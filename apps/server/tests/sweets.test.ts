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

  test("GET /api/sweets returns all sweets", async () => {
    const cat = await prismaMock.category.create({
      data: { name: "Gummies", description: "" },
    });
    await prismaMock.sweet.create({
      data: { name: "Gum", price: 0.5, stock: 10, categoryId: cat.id },
    });
    await prismaMock.sweet.create({
      data: { name: "Gummy Bear", price: 0.7, stock: 8, categoryId: cat.id },
    });

    const res = await request(app).get("/api/sweets");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("sweets");
    expect(Array.isArray(res.body.sweets)).toBe(true);
    expect(res.body.sweets.map((s: any) => s.name)).toEqual(
      expect.arrayContaining(["Gum", "Gummy Bear"]),
    );
  });

  test("GET /api/sweets/search requires authentication", async () => {
    const res = await request(app).get("/api/sweets/search");
    expect(res.status).toBe(401);
  });

  test("GET /api/sweets/search by name", async () => {
    const cat = await prismaMock.category.create({
      data: { name: "SearchCat", description: "" },
    });
    await prismaMock.sweet.create({
      data: { name: "Blue Gum", price: 1.2, stock: 5, categoryId: cat.id },
    });
    await prismaMock.sweet.create({
      data: { name: "Red Gum", price: 1.3, stock: 3, categoryId: cat.id },
    });

    const user = await prismaMock.user.create({
      data: {
        email: "s@example.com",
        name: "Searcher",
        password: "x",
        role: "USER",
      },
    });
    const token = require("jsonwebtoken").sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "test-secret",
    );

    const res = await request(app)
      .get("/api/sweets/search")
      .set("Cookie", [`auth-token=${token}`])
      .query({ name: "blue" });
    expect(res.status).toBe(200);
    expect(res.body.sweets.map((s: any) => s.name)).toEqual(
      expect.arrayContaining(["Blue Gum"]),
    );
  });

  test("GET /api/sweets/search by category", async () => {
    const cat1 = await prismaMock.category.create({
      data: { name: "CatA", description: "" },
    });
    const cat2 = await prismaMock.category.create({
      data: { name: "CatB", description: "" },
    });
    await prismaMock.sweet.create({
      data: { name: "Only A", price: 2, stock: 1, categoryId: cat1.id },
    });
    await prismaMock.sweet.create({
      data: { name: "Only B", price: 3, stock: 1, categoryId: cat2.id },
    });

    const user = await prismaMock.user.create({
      data: {
        email: "s2@example.com",
        name: "Searcher2",
        password: "x",
        role: "USER",
      },
    });
    const token = require("jsonwebtoken").sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "test-secret",
    );

    const res = await request(app)
      .get("/api/sweets/search")
      .set("Cookie", [`auth-token=${token}`])
      .query({ categoryId: cat1.id });
    expect(res.status).toBe(200);
    expect(res.body.sweets.map((s: any) => s.name)).toEqual(
      expect.arrayContaining(["Only A"]),
    );
  });

  test("GET /api/sweets/search by price range", async () => {
    const cat = await prismaMock.category.create({
      data: { name: "Pcat", description: "" },
    });
    await prismaMock.sweet.create({
      data: { name: "Low", price: 1.0, stock: 5, categoryId: cat.id },
    });
    await prismaMock.sweet.create({
      data: { name: "Mid", price: 2.0, stock: 5, categoryId: cat.id },
    });
    await prismaMock.sweet.create({
      data: { name: "High", price: 3.0, stock: 5, categoryId: cat.id },
    });

    const user = await prismaMock.user.create({
      data: {
        email: "s3@example.com",
        name: "Searcher3",
        password: "x",
        role: "USER",
      },
    });
    const token = require("jsonwebtoken").sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "test-secret",
    );

    const res = await request(app)
      .get("/api/sweets/search")
      .set("Cookie", [`auth-token=${token}`])
      .query({ price_min: "1.5", price_max: "2.5" });
    expect(res.status).toBe(200);
    expect(res.body.sweets.map((s: any) => s.name)).toEqual(
      expect.arrayContaining(["Mid"]),
    );
  });

  test("returns detailed errors when payload invalid", async () => {
    const admin = await prismaMock.user.create({
      data: {
        email: "v@example.com",
        name: "Validator",
        password: "x",
        role: "ADMIN",
      },
    });
    const token = jwt.sign({ sub: admin.id, email: admin.email }, SECRET);

    const res = await request(app)
      .post("/api/sweets")
      .set("Cookie", [`auth-token=${token}`])
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    const errors = res.body.errors;
    expect(errors).toHaveProperty("name");
    expect(errors.name).toContain("Name is required");
    expect(errors).toHaveProperty("price");
    expect(errors.price).toContain("Price is required");
    expect(errors).toHaveProperty("stock");
    expect(errors.stock).toContain("Stock is required");
    expect(errors).toHaveProperty("categoryId");
    expect(errors.categoryId).toContain("Category ID is required");
  });
});
