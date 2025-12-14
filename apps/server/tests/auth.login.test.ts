/**
 * tests/auth.login.test.ts
 *
 * Integration test for the login endpoint. This test is written red-first
 * (it asserts the expected behaviour before the implementation exists):
 * it expects a successful login to return `200` and set an `auth-token`
 * cookie. Currently this test will fail until `/api/auth/login` is
 * implemented.
 */

// Mock Prisma at the top to avoid ESM import and to control DB behaviour
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: require('./__mocks__/prisma').default,
}));

import request from 'supertest'
import { describe, test, expect, beforeEach, jest } from '@jest/globals'
import bcrypt from 'bcryptjs'
import { app } from '../src/app'

const prismaMockModule = require('./__mocks__/prisma');
const prismaMock = prismaMockModule.default;

beforeEach(() => {
  if (typeof prismaMockModule.__resetMocks === 'function') prismaMockModule.__resetMocks();
});

describe('Auth - Login (red test)', () => {
  test('logs in a user and sets auth-token cookie (expected to be red)', async () => {
    // Arrange: create a user in the mock DB with a hashed password
    const plain = 'password123'
    const hashed = await bcrypt.hash(plain, 10)
    await prismaMock.user.create({ data: { email: 'login@example.com', name: 'Login User', password: hashed } })

    // Act: attempt to login
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'login@example.com', password: plain })

    // Assert: we expect 200 and a Set-Cookie header containing `auth-token`
    expect(res.status).toBe(200)
    const setCookie = res.headers['set-cookie']
    expect(setCookie).toBeDefined()

    const hasAuthToken = Array.isArray(setCookie)
      ? setCookie.some((c: string) => c.startsWith('auth-token='))
      : typeof setCookie === 'string' && setCookie.startsWith('auth-token=')

    expect(hasAuthToken).toBe(true)

    // Also assert response includes public user data
    expect(res.body).toHaveProperty('user')
    expect(res.body.user).toHaveProperty('email', 'login@example.com')
  })

  test('returns 400 if already authenticated (has auth-token cookie)', async () => {
    // Arrange: create user
    const plain = 'password123'
    const hashed = await bcrypt.hash(plain, 10)
    await prismaMock.user.create({ data: { email: 'already@example.com', name: 'Already', password: hashed } })

    // Act: attempt to login with auth-token cookie already present
    const res = await request(app)
      .post('/api/auth/login')
      .set('Cookie', ['auth-token=existing'])
      .send({ email: 'already@example.com', password: plain })

    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error', 'Already authenticated')
  })
})
