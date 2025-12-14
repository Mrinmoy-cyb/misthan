/**
 * tests/auth.login.validation.test.ts
 *
 * Validation tests for the login endpoint. Verifies that missing or invalid
 * credentials return a structured `errors` map and a `400` status.
 */

// Mock Prisma before importing app to avoid ESM runtime issues
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: require('./__mocks__/prisma').default,
}));

import request from 'supertest'
import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { app } from "../src/app";

const prismaMockModule = require('./__mocks__/prisma');

beforeEach(() => {
  if (typeof prismaMockModule.__resetMocks === 'function') prismaMockModule.__resetMocks();
});

describe('Auth - Login Validation', () => {
  test('returns detailed errors when email or password are missing', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('errors')
    const errors = res.body.errors
    expect(errors).toHaveProperty('email')
    expect(errors).toHaveProperty('password')
  })
})
