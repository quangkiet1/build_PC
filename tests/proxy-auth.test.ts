import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it } from 'vitest'
import { createAccessToken, TOKEN_NAME } from '../lib/auth'
import { proxy } from '../proxy'

const originalJwtSecret = process.env.JWT_SECRET
const originalNodeEnv = process.env.NODE_ENV

afterEach(() => {
  process.env.JWT_SECRET = originalJwtSecret
  Object.assign(process.env, { NODE_ENV: originalNodeEnv })
})

describe('auth proxy', () => {
  it('clears invalid auth cookies before redirecting to login', () => {
    process.env.JWT_SECRET = 'secret'
    Object.assign(process.env, { NODE_ENV: 'production' })
    const request = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `${TOKEN_NAME}=not-a-valid-token` },
    })

    const response = proxy(request)
    const location = response.headers.get('location')
    const setCookie = response.headers.get('set-cookie')

    expect(response.status).toBe(307)
    expect(location).toContain('auth=required')
    expect(location).toContain('next=%2Fadmin')
    expect(setCookie).toContain(`${TOKEN_NAME}=`)
    expect(setCookie).toContain('Max-Age=0')
    expect(setCookie).not.toContain('Secure')
  })

  it('allows admin routes for verified admin tokens', () => {
    process.env.JWT_SECRET = 'secret'
    const token = createAccessToken({
      id: 'admin-1',
      email: 'admin@example.com',
      vaiTro: 'QUAN_TRI_VIEN',
    })
    const request = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `${TOKEN_NAME}=${token}` },
    })

    const response = proxy(request)

    expect(response.status).toBe(200)
    expect(response.headers.get('location')).toBeNull()
  })

  it('keeps valid customer cookies when redirecting from admin as forbidden', () => {
    process.env.JWT_SECRET = 'secret'
    const token = createAccessToken({
      id: 'user-1',
      email: 'user@example.com',
      vaiTro: 'KHACH_HANG',
    })
    const request = new NextRequest('http://localhost:3000/admin', {
      headers: { cookie: `${TOKEN_NAME}=${token}` },
    })

    const response = proxy(request)

    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('auth=forbidden')
    expect(response.headers.get('set-cookie')).toBeNull()
  })
})
