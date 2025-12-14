// Prevent Jest from importing the real Prisma Client (ESM) by
// mocking the module at the top of the file before any imports.
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: require('./__mocks__/prisma').default,
}));

import request from 'supertest'
import { describe, test, expect, jest } from '@jest/globals'
import { app } from "../src/app";

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
