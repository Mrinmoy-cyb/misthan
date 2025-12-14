/**
 * Category routes integration tests
 *
 * Verifies admin-only creation, duplicate detection (case-insensitive),
 * and authenticated listing for categories. Uses the Prisma mock to keep
 * tests isolated and deterministic without a real database.
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

// Access the mock Prisma client and its reset helper
const prismaMockModule = require("./__mocks__/prisma");
const prismaMock = prismaMockModule.default;

// Ensure clean state across tests
beforeEach(() => {
  if (typeof prismaMockModule.__resetMocks === "function")
    prismaMockModule.__resetMocks();
});

const SECRET = process.env.JWT_SECRET || "test-secret";

describe("POST /api/category", () => {
  test("returns 401 for unauthenticated users", async () => {
    const res = await request(app).post("/api/category").send({});
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("returns 403 for authenticated non-admin users", async () => {
    const user = await prismaMock.user.create({
      data: {
        email: "u2@example.com",
        name: "User2",
        password: "x",
        role: "USER",
      },
    });
    const token = jwt.sign({ sub: user.id, email: user.email }, SECRET);

    const res = await request(app)
      .post("/api/category")
      .set("Cookie", [`auth-token=${token}`])
      .send({ name: "NewCat" });

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty("error");
  });

  test("allows admin to create a category", async () => {
    const admin = await prismaMock.user.create({
      data: {
        email: "admin2@example.com",
        name: "Admin2",
        password: "x",
        role: "ADMIN",
      },
    });
    const token = jwt.sign({ sub: admin.id, email: admin.email }, SECRET);

    const res = await request(app)
      .post("/api/category")
      .set("Cookie", [`auth-token=${token}`])
      .send({ name: "Candies", description: "Sweet candes" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("category");
    expect(res.body.category).toHaveProperty("name", "Candies");
  });

  test("returns duplicate message when name matches existing (case-insensitive)", async () => {
    // create existing category with mixed case
    await prismaMock.category.create({
      data: { name: "Chocolates", description: "" },
    });

    const admin = await prismaMock.user.create({
      data: {
        email: "admin3@example.com",
        name: "Admin3",
        password: "x",
        role: "ADMIN",
      },
    });
    const token = jwt.sign({ sub: admin.id, email: admin.email }, SECRET);

    const res = await request(app)
      .post("/api/category")
      .set("Cookie", [`auth-token=${token}`])
      .send({ name: "chocolates", description: "lowercase" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error", "Category already exists");
  });

  test("GET /api/category requires authentication", async () => {
    const res = await request(app).get("/api/category");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /api/category returns all categories when authenticated", async () => {
    await prismaMock.category.create({
      data: { name: "Alpha", description: "" },
    });
    await prismaMock.category.create({
      data: { name: "Beta", description: "" },
    });

    const user = await prismaMock.user.create({
      data: {
        email: "viewer@example.com",
        name: "Viewer",
        password: "x",
        role: "USER",
      },
    });
    const token = require("jsonwebtoken").sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "test-secret",
    );

    const res = await request(app)
      .get("/api/category")
      .set("Cookie", [`auth-token=${token}`]);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("categories");
    expect(Array.isArray(res.body.categories)).toBe(true);
    expect(res.body.categories.map((c: any) => c.name)).toEqual(
      expect.arrayContaining(["Alpha", "Beta"]),
    );
  });
});
