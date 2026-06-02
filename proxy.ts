import { NextRequest, NextResponse } from 'next/server'
import jwt, { type JwtPayload } from 'jsonwebtoken'
import { getAuthCookieOptions, TOKEN_NAME } from '@/lib/auth-cookie'

type AuthTokenPayload = JwtPayload & {
  sub?: unknown
  role?: unknown
}

function verifyJwtPayload(token: string): AuthTokenPayload | null {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) return null

  try {
    const payload = jwt.verify(token, secret)
    return typeof payload === 'object' && payload !== null ? (payload as AuthTokenPayload) : null
  } catch {
    return null
  }
}

function redirectWithAuthReason(
  request: NextRequest,
  reason: 'required' | 'forbidden',
  options: { clearCookie?: boolean } = {}
) {
  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.searchParams.set('auth', reason)
  if (reason === 'required') {
    url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  }

  const response = NextResponse.redirect(url)
  if (options.clearCookie) {
    response.cookies.set(TOKEN_NAME, '', getAuthCookieOptions(0, request))
  }

  return response
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(TOKEN_NAME)?.value

  if (!token) {
    return redirectWithAuthReason(request, 'required')
  }

  const payload = verifyJwtPayload(token)
  if (!payload || typeof payload.sub !== 'string') {
    return redirectWithAuthReason(request, 'required', { clearCookie: true })
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const role = payload.role
    if (role !== 'QUAN_TRI_VIEN') {
      return redirectWithAuthReason(request, 'forbidden')
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*']
}
