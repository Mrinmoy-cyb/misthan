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

    const user = await prismaMock.user.create({
      data: {
        email: "list@example.com",
        name: "Lister",
        password: "x",
        role: "USER",
      },
    });
    const token = require("jsonwebtoken").sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET || "test-secret",
    );

    const res = await request(app)
      .get("/api/sweets")
      .set("Cookie", [`auth-token=${token}`]);
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
      .query({ priceMin: "1.5", priceMax: "2.5" });
    expect(res.status).toBe(200);
    expect(res.body.sweets.map((s: any) => s.name)).toEqual(
      expect.arrayContaining(["Mid"]),
    );
  });

  describe("returns detailed errors when payload invalid", () => {
    let admin: any;
    beforeEach(async () => {
      admin = await prismaMock.user.create({
        data: {
          email: "v@example.com",
          name: "Validator",
          password: "x",
          role: "ADMIN",
        },
      });
    });

    describe("PUT /api/sweets/:id", () => {
      test("requires authentication", async () => {
        const res = await request(app).put("/api/sweets/1").send({ name: "X" });
        expect(res.status).toBe(401);
      });

      test("requires admin", async () => {
        const user = await prismaMock.user.create({
          data: {
            email: "u9@example.com",
            name: "User9",
            password: "x",
            role: "USER",
          },
        });
        const token = require("jsonwebtoken").sign(
          { sub: user.id, email: user.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const res = await request(app)
          .put("/api/sweets/1")
          .set("Cookie", [`auth-token=${token}`])
          .send({ name: "X" });
        expect(res.status).toBe(403);
      });

      test("only creator admin can update", async () => {
        const cat = await prismaMock.category.create({
          data: { name: "UpCat", description: "" },
        });
        const admin1 = await prismaMock.user.create({
          data: {
            email: "a1@example.com",
            name: "A1",
            password: "x",
            role: "ADMIN",
          },
        });
        const admin2 = await prismaMock.user.create({
          data: {
            email: "a2@example.com",
            name: "A2",
            password: "x",
            role: "ADMIN",
          },
        });
        const sweet = await prismaMock.sweet.create({
          data: {
            name: "Orig",
            price: 1,
            stock: 1,
            categoryId: cat.id,
            userId: admin1.id,
          },
        });

        const tokenOther = require("jsonwebtoken").sign(
          { sub: admin2.id, email: admin2.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const resForbidden = await request(app)
          .put(`/api/sweets/${sweet.id}`)
          .set("Cookie", [`auth-token=${tokenOther}`])
          .send({ name: "New" });
        expect(resForbidden.status).toBe(403);

        const tokenOwner = require("jsonwebtoken").sign(
          { sub: admin1.id, email: admin1.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const resOk = await request(app)
          .put(`/api/sweets/${sweet.id}`)
          .set("Cookie", [`auth-token=${tokenOwner}`])
          .send({ name: "New" });
        expect(resOk.status).toBe(200);
        expect(resOk.body).toHaveProperty("sweet");
        expect(resOk.body.sweet).toHaveProperty("name", "New");
      });
    });

    describe("DELETE /api/sweets/:id", () => {
      test("requires authentication", async () => {
        const res = await request(app).delete("/api/sweets/1");
        expect(res.status).toBe(401);
      });

      test("requires admin", async () => {
        const user = await prismaMock.user.create({
          data: {
            email: "u10@example.com",
            name: "User10",
            password: "x",
            role: "USER",
          },
        });
        const token = require("jsonwebtoken").sign(
          { sub: user.id, email: user.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const res = await request(app)
          .delete("/api/sweets/1")
          .set("Cookie", [`auth-token=${token}`]);
        expect(res.status).toBe(403);
      });

      test("only creator admin can delete", async () => {
        const cat = await prismaMock.category.create({
          data: { name: "DelCat", description: "" },
        });
        const admin1 = await prismaMock.user.create({
          data: {
            email: "d1@example.com",
            name: "D1",
            password: "x",
            role: "ADMIN",
          },
        });
        const admin2 = await prismaMock.user.create({
          data: {
            email: "d2@example.com",
            name: "D2",
            password: "x",
            role: "ADMIN",
          },
        });
        const sweet = await prismaMock.sweet.create({
          data: {
            name: "ToDel",
            price: 1,
            stock: 1,
            categoryId: cat.id,
            userId: admin1.id,
          },
        });

        const tokenOther = require("jsonwebtoken").sign(
          { sub: admin2.id, email: admin2.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const resForbidden = await request(app)
          .delete(`/api/sweets/${sweet.id}`)
          .set("Cookie", [`auth-token=${tokenOther}`]);
        expect(resForbidden.status).toBe(403);

        const tokenOwner = require("jsonwebtoken").sign(
          { sub: admin1.id, email: admin1.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const resOk = await request(app)
          .delete(`/api/sweets/${sweet.id}`)
          .set("Cookie", [`auth-token=${tokenOwner}`]);
        expect(resOk.status).toBe(200);
        expect(resOk.body).toHaveProperty("deleted", true);
      });
    });

    describe("POST /api/sweets/:id/purchase", () => {
      test("requires authentication", async () => {
        const res = await request(app).post("/api/sweets/1/purchase").send({
          quantity: 1,
        });
        expect(res.status).toBe(401);
      });

      test("reduces stock on purchase", async () => {
        const cat = await prismaMock.category.create({
          data: { name: "Pbuy", description: "" },
        });
        const buyer = await prismaMock.user.create({
          data: {
            email: "buyer@example.com",
            name: "Buyer",
            password: "x",
            role: "USER",
          },
        });
        const sweet = await prismaMock.sweet.create({
          data: { name: "BuyMe", price: 1, stock: 5, categoryId: cat.id },
        });

        const token = require("jsonwebtoken").sign(
          { sub: buyer.id, email: buyer.email },
          process.env.JWT_SECRET || "test-secret",
        );

        const res = await request(app)
          .post(`/api/sweets/${sweet.id}/purchase`)
          .set("Cookie", [`auth-token=${token}`])
          .send({ quantity: 2 });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("sweet");
        expect(res.body.sweet).toHaveProperty("stock", 3);
      });

      test("returns 400 when insufficient stock", async () => {
        const cat = await prismaMock.category.create({
          data: { name: "Pbuy2", description: "" },
        });
        const buyer = await prismaMock.user.create({
          data: {
            email: "buyer2@example.com",
            name: "Buyer2",
            password: "x",
            role: "USER",
          },
        });
        const sweet = await prismaMock.sweet.create({
          data: { name: "LowStock", price: 1, stock: 1, categoryId: cat.id },
        });

        const token = require("jsonwebtoken").sign(
          { sub: buyer.id, email: buyer.email },
          process.env.JWT_SECRET || "test-secret",
        );

        const res = await request(app)
          .post(`/api/sweets/${sweet.id}/purchase`)
          .set("Cookie", [`auth-token=${token}`])
          .send({ quantity: 2 });

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      });
    });

    describe("POST /api/sweets/:id/restock", () => {
      test("requires authentication", async () => {
        const res = await request(app).post("/api/sweets/1/restock").send({
          quantity: 1,
        });
        expect(res.status).toBe(401);
      });

      test("requires admin", async () => {
        const user = await prismaMock.user.create({
          data: {
            email: "u11@example.com",
            name: "User11",
            password: "x",
            role: "USER",
          },
        });
        const token = require("jsonwebtoken").sign(
          { sub: user.id, email: user.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const res = await request(app)
          .post("/api/sweets/1/restock")
          .set("Cookie", [`auth-token=${token}`])
          .send({ quantity: 1 });
        expect(res.status).toBe(403);
      });

      test("only creator admin can restock", async () => {
        const cat = await prismaMock.category.create({
          data: { name: "RestockCat", description: "" },
        });
        const admin1 = await prismaMock.user.create({
          data: {
            email: "ra1@example.com",
            name: "RA1",
            password: "x",
            role: "ADMIN",
          },
        });
        const admin2 = await prismaMock.user.create({
          data: {
            email: "ra2@example.com",
            name: "RA2",
            password: "x",
            role: "ADMIN",
          },
        });
        const sweet = await prismaMock.sweet.create({
          data: {
            name: "RestMe",
            price: 1,
            stock: 1,
            categoryId: cat.id,
            userId: admin1.id,
          },
        });

        const tokenOther = require("jsonwebtoken").sign(
          { sub: admin2.id, email: admin2.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const resForbidden = await request(app)
          .post(`/api/sweets/${sweet.id}/restock`)
          .set("Cookie", [`auth-token=${tokenOther}`])
          .send({ quantity: 5 });
        expect(resForbidden.status).toBe(403);

        const tokenOwner = require("jsonwebtoken").sign(
          { sub: admin1.id, email: admin1.email },
          process.env.JWT_SECRET || "test-secret",
        );
        const resOk = await request(app)
          .post(`/api/sweets/${sweet.id}/restock`)
          .set("Cookie", [`auth-token=${tokenOwner}`])
          .send({ quantity: 5 });
        expect(resOk.status).toBe(200);
        expect(resOk.body).toHaveProperty("sweet");
        expect(resOk.body.sweet).toHaveProperty("stock", 6);
      });
    });
    test("POST invalid payload returns detailed errors", async () => {
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
});
