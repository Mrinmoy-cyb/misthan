/**
 * tests/auth.test.ts
 *
 * Integration tests for authentication endpoints.
 * This file exercises the registration flow and asserts that
 * upon successful registration the server sets an HTTP cookie
 * named `auth-token` containing the issued token.
 *
 * The test uses `supertest` to perform requests against the
 * Express `app` and runs under Jest.
 */

// Prevent Jest from importing the real Prisma Client (ESM) by
// mocking the module at the top of the file before any imports.
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: require('./__mocks__/prisma').default,
}));

import request from 'supertest'
import { describe, test, expect, jest } from '@jest/globals'
import { app } from "../src/app";

/**
 * Auth - Register
 *
 * Ensures that user registration returns `201 Created` and that
 * the response includes a `Set-Cookie` header with the
 * `auth-token` cookie.
 */
describe('Auth - Register', () => {
	/**
	 * registers a user and sets auth token cookie
	 *
	 * Steps:
	 * 1. POST /api/auth/register with valid credentials
	 * 2. Expect status 201
	 * 3. Expect `Set-Cookie` header to include `auth-token`
	 */
	test('registers a user and sets auth token cookie', async () => {
		const agent = request.agent(app)
		const res = await agent
			.post('/api/auth/register')
			.send({ email: 'test@example.com', name: 'Test User', password: 'password123' })

		// Expect 201 Created and a Set-Cookie header containing auth-token
		expect(res.status).toBe(201)
		const setCookie = res.headers['set-cookie']
		expect(setCookie).toBeDefined()

		// Cookie should include an auth-token cookie (e.g., auth-token=...)
		const hasTokenCookie = Array.isArray(setCookie)
			? setCookie.some((c: string) => c.startsWith('auth-token='))
			: typeof setCookie === 'string' && setCookie.startsWith('auth-token=')

		expect(hasTokenCookie).toBe(true)
	})
})

