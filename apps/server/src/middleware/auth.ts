import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";

// JWT secret used to sign and verify tokens. In production this should be
// provided as an environment variable. Tests default to `test-secret`.
const SECRET = process.env.JWT_SECRET || "test-secret";

/**
 * Middleware that requires a valid authentication token via cookie.
 *
 * Behavior:
 * - Reads the `auth-token` cookie from the `Cookie` header.
 * - Verifies the token using the configured `SECRET`.
 * - Looks up the corresponding `User` in the database and attaches it to
 *   `req.user` for downstream handlers.
 * - Returns `401` for missing/invalid token or when the user cannot be found.
 *
 * @param req Express request
 * @param res Express response
 * @param next Next function
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // Extract the raw Cookie header safely (may be undefined)
  const cookieHeader = req.headers?.cookie ?? "";

  // Find the auth-token cookie pair (e.g. `auth-token=...`)
  const tokenPair = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("auth-token="));

  if (!tokenPair)
    return res.status(401).json({ error: "Authentication required" });

  const token = tokenPair.split("=")[1];

  try {
    // Verify JWT and extract payload
    const payload: any = jwt.verify(token, SECRET);

    const userId = payload.sub;

    // Fetch user from DB to ensure token corresponds to an existing user
    const user = await prisma.user.findUnique({ where: { id: userId } as any });

    if (!user)
      return res.status(401).json({ error: "Authentication required" });

    // Attach the user object to the request for later middleware/handlers
    req.user = user;

    return next();
  } catch (err) {
    // Any error verifying the token yields a 401
    return res.status(401).json({ error: "Invalid authentication token" });
  }
}

/**
 * Middleware that requires the authenticated user to have ADMIN role.
 *
 * Notes:
 * - `requireAuth` should be called before this middleware so that
 *   `req.user` is available.
 * - Returns `403` when the user is missing or does not have the ADMIN role.
 *
 * @param req Express request (with `req.user` set by `requireAuth`)
 * @param res Express response
 * @param next Next function
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user || user.role !== "ADMIN")
    return res.status(403).json({ error: "Admin privilege required" });

  return next();
}

// Default export for convenience when importing as a module
export default { requireAuth, requireAdmin };
