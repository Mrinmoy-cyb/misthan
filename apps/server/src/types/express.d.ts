/**
 * Augment Express Request with application-specific properties.
 *
 * We attach a `user` object (from Prisma's `User` model) to the request
 * after successful authentication. Declaring it here lets us avoid
 * casting `req` to `any` across the codebase.
 */
import type { User } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      /** The authenticated user (set by `requireAuth`) */
      user?: User;
    }
  }
}

export {};
