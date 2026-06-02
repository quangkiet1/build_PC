import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { type NextRequest } from 'next/server'
import { TOKEN_NAME } from '@/lib/auth-cookie'
import { prisma } from '@/lib/prisma'
export {
  AUTH_COOKIE_MAX_AGE,
  TOKEN_NAME,
  clearAuthCookie,
  createAuthCookie,
  getAuthCookieOptions,
  shouldUseSecureAuthCookie,
} from '@/lib/auth-cookie'

type UserRole = 'KHACH_HANG' | 'QUAN_TRI_VIEN'

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim()

  if (!secret) {
    throw new Error('JWT_SECRET must be configured')
  }

  return secret
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export function createAccessToken(user: { id: string; email: string; vaiTro: string }) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.vaiTro
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  )
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, getJwtSecret()) as { sub: string; email: string; role: string }
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest) {
  const authorization = request.headers.get('authorization')
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const bearerToken = authorization.slice(7).trim()
    if (bearerToken) return bearerToken
  }

  const tokenFromCookie = request.cookies.get(TOKEN_NAME)?.value
  if (tokenFromCookie) return tokenFromCookie

  // Fallback for environments that only expose raw cookie header.
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = cookieHeader.split(';').map((item) => item.trim())
  const tokenCookie = cookies.find((cookie) => cookie.startsWith(`${TOKEN_NAME}=`))
  return tokenCookie ? decodeURIComponent(tokenCookie.slice(TOKEN_NAME.length + 1)) : null
}

export async function authenticateRequest(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) return null
  const payload = verifyAccessToken(token)
  if (!payload?.sub) return null

  return prisma.nguoiDung.findUnique({
    where: { id: payload.sub }
  })
}

export async function authorizeRoles(request: NextRequest, roles: UserRole[]) {
  const user = await authenticateRequest(request)
  if (!user) {
    return { user: null, error: 'Unauthorized', status: 401 as const }
  }

  if (!roles.includes(user.vaiTro as UserRole)) {
    return { user: null, error: 'Forbidden', status: 403 as const }
  }

  return { user, error: null, status: 200 as const }
}
