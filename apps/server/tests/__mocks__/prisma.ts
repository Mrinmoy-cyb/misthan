import { jest } from "@jest/globals";

const users: any[] = [];

const prisma = {
  user: {
    findUnique: jest.fn(async ({ where }: { where: { email?: string } }) => {
      if (where && where.email) return users.find((u) => u.email === where.email) ?? null;
      return null;
    }),
    create: jest.fn(async ({ data }: { data: any }) => {
      const user = { ...data, id: (users.length + 1).toString(), createdAt: new Date(), updatedAt: new Date() };
      users.push(user);
      return user;
    }),
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
};

export default prisma;
