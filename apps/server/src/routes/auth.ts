import express, { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import prisma from "@/lib/prisma";


const router: Router = express.Router();

const RegisterSchema = z.object({
  email: z.email({ message: "Provide a valid email address." }),
  name: z.string().min(1, { message: "User name is required for account creation." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
});

function formatZodErrors(err: z.ZodError) {
  const out: Record<string, string[]> = {};
  for (const issue of err.issues) {
    const key = (issue.path[0] as string) || "_";
    out[key] = out[key] ?? [];
    out[key].push(issue.message);
  }
  return out;
}

router.post("/register", async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ errors: formatZodErrors(parsed.error) });
  }

  const { email, name, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return res.status(409).json({ error: "A user with that email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashed,
    },
  });

  const secret = process.env.JWT_SECRET || "test-secret";
  const token = jwt.sign({ sub: user.id, email: user.email }, secret, {
    expiresIn: "7d",
  });

  res.cookie("auth-token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  const { password: _pw, ...publicUser } = user;

  return res.status(201).json({ user: publicUser });
});

export default router;
