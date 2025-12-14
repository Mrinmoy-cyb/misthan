/**
 * Jest mock for a minimal Prisma client used in tests.
 *
 * Overview:
 * - Implements a small subset of Prisma models (`user`, `category`, `sweet`).
 * - Each model exposes methods that mirror Prisma's API shape
 *   (e.g., `findUnique`, `create`, `findMany`, `update`, `delete`).
 * - All data is stored in simple in-memory arrays to keep tests fast
 *   and deterministic without a database.
 *
 * Usage in tests:
 * - Imported via `jest.mock('@/lib/prisma', ...)` so application code
 *   uses this mock instead of the real Prisma client.
 * - Methods are `jest.fn()` allowing per-test overrides like
 *   `mockImplementationOnce` and call assertions.
 * - Call `__resetMocks()` in `beforeEach` to clear state between tests.
 *
 * Notes:
 * - This mock is intentionally small and focused on the needs of the
 *   current test suite. Add minimal methods as required by new tests.
 */
import { jest } from "@jest/globals";

// In-memory stores of model records for the duration of the test run
const users: any[] = [];
const categories: any[] = [];
const sweets: any[] = [];

const prisma = {
  user: {
    /**
     * Mimics `prisma.user.findUnique({ where })`.
     * Supports lookup by `email` or `id` and returns `null` when not found.
     */
    findUnique: jest.fn(
      async ({ where }: { where?: { email?: string; id?: string } }) => {
        if (where?.email)
          return users.find((u) => u.email === where.email) ?? null;
        if (where?.id) return users.find((u) => u.id === where.id) ?? null;
        return null;
      },
    ),

    /**
     * Mimics `prisma.user.create({ data })` — returns the created user.
     * Adds `id`, `createdAt`, and `updatedAt` fields.
     */
    create: jest.fn(async ({ data }: { data: any }) => {
      const user = {
        ...data,
        id: (users.length + 1).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.push(user);
      return user;
    }),

    /**
     * Mimics `prisma.user.deleteMany({ where })`.
     * Supports clearing by `email` or a full reset when `where` omitted.
     */
    deleteMany: jest.fn(async ({ where }: { where?: any } = {}) => {
      if (where && where.email) {
        const idx = users.findIndex((u) => u.email === where.email);
        if (idx !== -1) users.splice(idx, 1);
      } else {
        users.length = 0;
      }
      return { count: 0 };
    }),
  },
  category: {
    /**
     * Mimics `prisma.category.findUnique({ where })`.
     * Supports lookup by `id` or `name` (exact match) and returns `null` when not found.
     */
    findUnique: jest.fn(
      async ({ where }: { where: { id?: string; name?: string } }) => {
        if (where?.id) return categories.find((c) => c.id === where.id) ?? null;
        if (where?.name)
          return categories.find((c) => c.name === where.name) ?? null;
        return null;
      },
    ),
    /**
     * Mimics `prisma.category.create({ data })`.
     */
    create: jest.fn(async ({ data }: { data: any }) => {
      const category = {
        ...data,
        id: (categories.length + 1).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      categories.push(category);
      return category;
    }),
    /**
     * Mimics `prisma.category.findMany()` — returns a shallow copy of all categories.
     */
    findMany: jest.fn(async () => {
      return categories.slice();
    }),
  },
  sweet: {
    /**
     * Mimics `prisma.sweet.findUnique({ where })`.
     */
    findUnique: jest.fn(async ({ where }: { where?: { id?: string } }) => {
      if (where?.id) return sweets.find((s) => s.id === where.id) ?? null;
      return null;
    }),
    /**
     * Mimics `prisma.sweet.create({ data })`.
     */
    create: jest.fn(async ({ data }: { data: any }) => {
      const sweet = {
        ...data,
        id: (sweets.length + 1).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      sweets.push(sweet);
      return sweet;
    }),
    /**
     * Mimics `prisma.sweet.findMany()` — returns a shallow copy of all sweets.
     */
    findMany: jest.fn(async () => {
      return sweets.slice();
    }),
    /**
     * Mimics `prisma.sweet.update({ where, data })`.
     */
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = sweets.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error("Not found");
      sweets[idx] = { ...sweets[idx], ...data, updatedAt: new Date() };
      return sweets[idx];
    }),
    /**
     * Mimics `prisma.sweet.delete({ where })`.
     */
    delete: jest.fn(async ({ where }: { where: any }) => {
      const idx = sweets.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error("Not found");
      const [deleted] = sweets.splice(idx, 1);
      return deleted;
    }),
  },
};

/**
 * Reset internal mock state and Jest mock metadata.
 *
 * Call from `beforeEach` or `afterEach` in tests to ensure a clean state.
 */
export function __resetMocks() {
  // Clear in-memory store but keep default implementations in place.
  users.length = 0;
  categories.length = 0;
  sweets.length = 0;
  prisma.user.findUnique.mockClear();
  prisma.user.create.mockClear();
  prisma.user.deleteMany.mockClear();
  prisma.category.findUnique.mockClear();
  prisma.category.create.mockClear();
  prisma.sweet.create.mockClear();
}

export default prisma;
