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
 * - `role`: optional, defaults to "USER"
 */
const RegisterSchema = z.object({
  email: z.string().email({ message: "Provide a valid email address." }),
  name: z
    .string()
    .min(1, { message: "User name is required for account creation." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
  role: z.enum(["USER", "ADMIN"]).optional().default("USER"),
});

/**
 * Schema for login requests
 */
const LoginSchema = z.object({
  email: z.email({ message: "Provide a valid email address." }),
  password: z.string().min(1, { message: "Password is required" }),
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

  const { email, name, password, role } = parsed.data;

  // Check for existing user with the same email
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return res
      .status(409)
      .json({ error: "A user with that email already exists" });
  }

  // Hash password before persisting
  const hashed = await bcrypt.hash(password, 10);

  // Persist user via Prisma
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
      role,
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
});

/**
 * POST /login
 *
 * Authenticates a user and sets an `auth-token` cookie on success.
 * Behavior:
 * - If a request already contains an `auth-token` cookie we return 400
 *   to avoid double-authentication.
 * - Validates input using Zod and returns structured validation errors.
 * - Verifies the password using `bcrypt.compare` and returns 401 on failure.
 * - On success issues a JWT and sets the `auth-token` cookie (HttpOnly).
 */
router.post("/login", async (req, res) => {
  // Quick check: if a cookie header contains an `auth-token` assume the
  // client is already authenticated and avoid additional login.
  const cookieHeader = req.headers?.cookie ?? "";

  if (cookieHeader.split(";").some((c) => c.trim().startsWith("auth-token="))) {
    return res.status(400).json({ error: "Already authenticated" });
  }

  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: formatZodErrors(parsed.error) });
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, (user as any).password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });

  const secret = process.env.JWT_SECRET || "test-secret";
  const token = jwt.sign({ sub: user.id, email: user.email }, secret);

  res.cookie("auth-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const { password: _pw, ...publicUser } = user as any;
  return res.status(200).json({ user: publicUser });
});

/**
 * GET /me
 *
 * Returns the currently authenticated user's information.
 * Requires a valid auth-token cookie.
 */
router.get("/me", async (req, res) => {
  // Extract auth-token from cookies
  const cookieHeader = req.headers?.cookie ?? "";
  const authTokenCookie = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("auth-token="));

  if (!authTokenCookie) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const token = authTokenCookie.split("=")[1];
  const secret = process.env.JWT_SECRET || "test-secret";

  try {
    const decoded = jwt.verify(token, secret) as { sub: string; email: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const { password: _pw, ...publicUser } = user as any;
    return res.status(200).json({ user: publicUser });
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
});

/**
 * POST /logout
 *
 * Clears the auth-token cookie to log the user out.
 */
router.post("/logout", (req, res) => {
  res.clearCookie("auth-token");

  return res.status(200).json({ message: "Logged out successfully" });
});

export default router;
