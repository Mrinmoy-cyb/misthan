/**
 * tests/sweets.test.ts
 *
 * Tests for the POST /api/sweets endpoint.
 */

// Mock Prisma at the top to avoid ESM import issues
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: require("./__mocks__/prisma").default,
}));

import request from "supertest";
import { describe, test, expect, beforeEach } from "@jest/globals";
import jwt from "jsonwebtoken";
import { app } from "../src/app";

const prismaMockModule = require("./__mocks__/prisma");
const prismaMock = prismaMockModule.default;

beforeEach(() => {
  if (typeof prismaMock.__resetMocks === "function") prismaMock.__resetMocks();
});

const SECRET = process.env.JWT_SECRET || "test-secret";

describe("POST /api/sweets", () => {
  test("returns 401 for unauthenticated users", async () => {
    const res = await request(app).post("/api/sweets").send({});
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 403 for authenticated non-admin users", async () => {
    // create non-admin user
    const user = await prismaMock.user.create({
      data: {
        email: "u@example.com",
        name: "User",
        password: "x",
        role: "USER",
      },
    });
    const token = jwt.sign({ sub: user.id, email: user.email }, SECRET);

    const res = await request(app)
      .post("/api/sweets")
      .set("Cookie", [`auth-token=${token}`])
      .send({ name: "Candy", price: 1.5, stock: 10, categoryId: "1" });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  test("allows admin users to create a sweet", async () => {
    // create category and admin user
    const category = await prismaMock.category.create({
      data: { name: "Chocolates", description: "Sweet things" },
    });
    const admin = await prismaMock.user.create({
      data: {
        email: "a@example.com",
        name: "Admin",
        password: "x",
        role: "ADMIN",
      },
    });
    const token = jwt.sign({ sub: admin.id, email: admin.email }, SECRET);

    const res = await request(app)
      .post("/api/sweets")
      .set("Cookie", [`auth-token=${token}`])
      .send({ name: "Truffle", price: 2.5, stock: 5, categoryId: category.id });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("sweet");
    expect(res.body.sweet).toHaveProperty("name", "Truffle");
  });

  test('returns detailed errors when payload invalid', async () => {
    const admin = await prismaMock.user.create({ data: { email: 'v@example.com', name: 'Validator', password: 'x', role: 'ADMIN' } })
    const token = jwt.sign({ sub: admin.id, email: admin.email }, SECRET)

    const res = await request(app)
      .post('/api/sweets')
      .set('Cookie', [`auth-token=${token}`])
      .send({})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('errors')
    const errors = res.body.errors
    expect(errors).toHaveProperty('name')
    expect(errors.name).toContain('Name is required')
    expect(errors).toHaveProperty('price')
    expect(errors.price).toContain('Price is required')
    expect(errors).toHaveProperty('stock')
    expect(errors.stock).toContain('Stock is required')
    expect(errors).toHaveProperty('categoryId')
    expect(errors.categoryId).toContain('Category ID is required')
  })
});
