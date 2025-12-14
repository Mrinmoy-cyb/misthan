/**
 * Authentication routes
 *
 * Provides endpoints for user registration and (later) login. Current
 * implementation focuses on `POST /register` which:
 * - Validates input using Zod and returns a structured `errors` map on
 *   validation failure.
 * - Hashes the password with `bcrypt` and persists the user via Prisma.
 * - Issues a JWT and sets it as an HttpOnly cookie named `auth-token`.
 *
 * The router intentionally returns JSON error responses (400/409/503)
 * rather than HTML pages, making it suitable for API clients and tests.
 */
import express, { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { formatZodErrors } from "@/utility/zod-error-formatter";


const router: Router = express.Router();

/**
 * Registration request schema
 *
 * - `email`: must be a valid email address
 * - `name`: required non-empty string
 * - `password`: minimum length to enforce basic strength
 */
const RegisterSchema = z.object({
  email: z.string().email({ message: "Provide a valid email address." }),
  name: z.string().min(1, { message: "User name is required for account creation." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});


/**
 * POST /register
 *
 * Red-Green-Refactor: written with testability in mind — returns
 * structured validation errors for invalid input and handles common
 * failure modes (duplicate email, DB errors).
 */
router.post("/register", async (req, res) => {
  // Validate request body; use `safeParse` to collect all validation issues
  const parsed = RegisterSchema.safeParse(req.body);

  if (!parsed.success) {
    // Return grouped messages keyed by field for easy client consumption
    return res.status(400).json({ errors: formatZodErrors(parsed.error) });
  }

  const { email, name, password } = parsed.data;

  try {
    // Check for existing user with the same email
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(409).json({ error: "A user with that email already exists" });
    }

    // Hash password before persisting
    const hashed = await bcrypt.hash(password, 10);

    // Persist user via Prisma
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
      },
    });

    // Sign a JWT and set it as an HttpOnly cookie named `auth-token`
    const secret = process.env.JWT_SECRET || "test-secret";
    const token = jwt.sign({ sub: user.id, email: user.email }, secret);

    res.cookie("auth-token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    // Remove internal fields from response
    const { password: _pw, ...publicUser } = user as any;

    return res.status(201).json({ user: publicUser });
  } catch (err: any) {
    // On database or unexpected errors, return a clear 503 JSON response
    console.error("Database error during registration:", err?.message || err);
    return res.status(503).json({ error: "Database unavailable. Please try again later." });
  }
});

export default router;
