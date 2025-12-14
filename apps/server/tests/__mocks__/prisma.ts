/**
 * Manual Jest mock for the Prisma client used in tests
 *
 * This mock is intentionally small and focused on the parts of the
 * Prisma client used by the authentication tests (`prisma.user`). It
 * provides:
 *
 * - `findUnique`: returns a user by email or `null` when not found
 * - `create`: stores a user object in an in-memory array and returns it
 * - `deleteMany`: removes users by email or clears the store
 *
 * Each function is implemented with `jest.fn()` so tests can:
 * - replace the implementation with `mockImplementationOnce` to simulate errors
 * - assert calls with `expect(prisma.user.create).toHaveBeenCalledWith(...)`
 *
 * The file also exports a small `__resetMocks` helper that tests can
 * call to clear internal state and reset the Jest mock metadata.
 */
import { jest } from "@jest/globals";

// In-memory store of created users for the duration of the test run
const users: any[] = [];
const categories: any[] = [];
const sweets: any[] = [];

const prisma = {
  user: {
    // Mimics `prisma.user.findUnique({ where: { email } })`
    findUnique: jest.fn(
      async ({ where }: { where?: { email?: string; id?: string } }) => {
        if (where?.email)
          return users.find((u) => u.email === where.email) ?? null;
        if (where?.id) return users.find((u) => u.id === where.id) ?? null;
        return null;
      },
    ),

    // Mimics `prisma.user.create({ data })` — returns the created user
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

    // Mimics `prisma.user.deleteMany({ where })` — supports clearing by email or full reset
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
    findUnique: jest.fn(
      async ({ where }: { where: { id?: string; name?: string } }) => {
        if (where?.id) return categories.find((c) => c.id === where.id) ?? null;
        if (where?.name)
          return categories.find((c) => c.name === where.name) ?? null;
        return null;
      },
    ),
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
    findMany: jest.fn(async () => {
      return categories.slice();
    }),
  },
  sweet: {
    findUnique: jest.fn(async ({ where }: { where?: { id?: string } }) => {
      if (where?.id) return sweets.find((s) => s.id === where.id) ?? null;
      return null;
    }),
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
    findMany: jest.fn(async () => {
      return sweets.slice();
    }),
    update: jest.fn(async ({ where, data }: { where: any; data: any }) => {
      const idx = sweets.findIndex((s) => s.id === where.id);
      if (idx === -1) throw new Error("Not found");
      sweets[idx] = { ...sweets[idx], ...data, updatedAt: new Date() };
      return sweets[idx];
    }),
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
 * Useful to call from `beforeEach` or `afterEach` in tests to ensure a clean state.
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
