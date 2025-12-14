/**
 * tests/auth.validation.test.ts
 *
 * Validation tests for the authentication routes. These tests verify the
 * server returns well-structured, friendly validation errors when
 * required fields are missing or invalid. The Prisma client is mocked
 * so tests run quickly and deterministically without a real database.
 */
// Prevent Jest from importing the real Prisma Client (ESM) by mocking
// the module at the top of the file before any imports. The manual mock
// exposes `__resetMocks()` which we call in `beforeEach` to keep tests
// isolated from each other.
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: require('./__mocks__/prisma').default,
}));

import request from 'supertest'
import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import { app } from "../src/app";

// Import the manual mock to reset internal state between tests
const prismaMock = require('./__mocks__/prisma');

// Ensure each test starts with a clean mock state
beforeEach(() => {
  if (typeof prismaMock.__resetMocks === 'function') prismaMock.__resetMocks();
});

describe('Auth - Validation', () => {
	test('returns detailed errors for missing fields', async () => {
		const res = await request(app)
			.post('/api/auth/register')
			.send({})

		expect(res.status).toBe(400)
		expect(res.body).toHaveProperty('errors')
		const errors = res.body.errors
		expect(errors).toHaveProperty('email')
		expect(errors).toHaveProperty('name')
		expect(errors).toHaveProperty('password')
	})
})
