import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

const SECRET = process.env.JWT_SECRET || "test-secret";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const cookieHeader = req.headers?.cookie ?? "";

  const tokenPair = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth-token="));

  if (!tokenPair)
    return res.status(401).json({ error: "Authentication required" });

  const token = tokenPair.split("=")[1];

  try {
    const payload: any = jwt.verify(token, SECRET);

    const userId = payload.sub;
    const user = await prisma.user.findUnique({ where: { id: userId } as any });

    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    (req as any).user = user;

    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid authentication token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;

  if (!user || user.role !== "ADMIN")
    return res.status(403).json({ error: "Admin privilege required" });

  return next();
}

export default { requireAuth, requireAdmin };
