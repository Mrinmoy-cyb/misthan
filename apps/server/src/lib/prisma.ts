/**
 * Prisma client singleton
 *
 * This module provides a single, shared `PrismaClient` instance for the
 * application. It also applies the Prisma Accelerate extension when
 * constructing the client.
 *
 * Important notes:
 * - Exported as the default export so test suites can easily mock this
 *   module (for example: `jest.mock('@/lib/prisma', () => ({ __esModule: true, default: mock }))`).
 * - Keep this file as the single database boundary for the app. Avoid
 *   importing the generated Prisma client directly in test files.
 * - The client reads the connection/accelerate URL from `process.env.DATABASE_URL`.
 */
import "dotenv/config";

import { PrismaClient } from '@/generated/prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// Create a PrismaClient with the Accelerate extension. The `accelerateUrl`
// is read from `DATABASE_URL` which allows the same configuration to be
// used for local development, CI, and production with the accelerator URL.
const prisma = new PrismaClient({
	accelerateUrl: process.env.DATABASE_URL as string,
}).$extends(withAccelerate());

export default prisma;