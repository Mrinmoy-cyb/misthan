/**
 * tests/auth.test.ts
 *
 * Combined integration tests for authentication endpoints: registration
 * and login. Uses the manual Prisma mock for deterministic behavior and
 * resets mock state between tests.
 */

// Mock Prisma at the top to avoid ESM import and to control DB behaviour
jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: require("./__mocks__/prisma").default,
}));

import request from "supertest";
import { describe, test, expect, beforeEach } from "@jest/globals";
import bcrypt from "bcryptjs";
import { app } from "../src/app";

const prismaMockModule = require("./__mocks__/prisma");
const prismaMock = prismaMockModule.default;

beforeEach(() => {
  if (typeof prismaMockModule.__resetMocks === "function")
    prismaMockModule.__resetMocks();
});

/**
 * Registration
 */
describe("Auth - Register", () => {
  test("registers a user and sets auth token cookie", async () => {
    const agent = request.agent(app);
    const res = await agent
      .post("/api/auth/register")
      .send({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      });

    expect(res.status).toBe(201);
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();

    const hasTokenCookie = Array.isArray(setCookie)
      ? setCookie.some((c: string) => c.startsWith("auth-token="))
      : typeof setCookie === "string" && setCookie.startsWith("auth-token=");

    expect(hasTokenCookie).toBe(true);
  });

  test("returns detailed errors for missing fields", async () => {
    const res = await request(app).post("/api/auth/register").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    const errors = res.body.errors;
    expect(errors).toHaveProperty("email");
    expect(errors).toHaveProperty("name");
    expect(errors).toHaveProperty("password");
  });
});

/**
 * Login
 */
describe("Auth - Login", () => {
  test("logs in a user and sets auth-token cookie", async () => {
    // Arrange: create a user in the mock DB with a hashed password
    const plain = "password123";
    const hashed = await bcrypt.hash(plain, 10);
    await prismaMock.user.create({
      data: {
        email: "login@example.com",
        name: "Login User",
        password: hashed,
      },
    });

    // Act: attempt to login
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "login@example.com", password: plain });

    // Assert: we expect 200 and a Set-Cookie header containing `auth-token`
    expect(res.status).toBe(200);
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();

    const hasAuthToken = Array.isArray(setCookie)
      ? setCookie.some((c: string) => c.startsWith("auth-token="))
      : typeof setCookie === "string" && setCookie.startsWith("auth-token=");

    expect(hasAuthToken).toBe(true);

    // Also assert response includes public user data
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", "login@example.com");
  });

  test("returns 400 if already authenticated (has auth-token cookie)", async () => {
    // Arrange: create user
    const plain = "password123";
    const hashed = await bcrypt.hash(plain, 10);
    await prismaMock.user.create({
      data: { email: "already@example.com", name: "Already", password: hashed },
    });

    // Act: attempt to login with auth-token cookie already present
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", ["auth-token=existing"])
      .send({ email: "already@example.com", password: plain });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Already authenticated");
  });

  test("returns detailed errors when email or password are missing", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("errors");
    const errors = res.body.errors;
    expect(errors).toHaveProperty("email");
    expect(errors).toHaveProperty("password");
  });
});
