import { afterEach, describe, expect, it } from 'vitest'
import { createAccessToken, createAuthCookie, getJwtSecret, verifyAccessToken } from '../lib/auth'

const originalJwtSecret = process.env.JWT_SECRET
const originalNodeEnv = process.env.NODE_ENV

afterEach(() => {
  process.env.JWT_SECRET = originalJwtSecret
  Object.assign(process.env, { NODE_ENV: originalNodeEnv })
})

describe('auth utilities', () => {
  it('requires JWT_SECRET to be configured', () => {
    delete process.env.JWT_SECRET
    expect(() => getJwtSecret()).toThrow('JWT_SECRET must be configured')
  })

  it('creates a secure auth cookie in production', () => {
    process.env.JWT_SECRET = 'secret'
    Object.assign(process.env, { NODE_ENV: 'production' })

    expect(createAuthCookie('token-value')).toContain('Secure')
  })

  it('creates and verifies access tokens', () => {
    process.env.JWT_SECRET = 'secret'
    const token = createAccessToken({ id: 'user-1', email: 'user@example.com', vaiTro: 'KHACH_HANG' })
    const payload = verifyAccessToken(token)

    expect(payload?.sub).toBe('user-1')
    expect(payload?.email).toBe('user@example.com')
    expect(payload?.role).toBe('KHACH_HANG')
  })
})