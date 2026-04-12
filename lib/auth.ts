import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { type NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'pcbuilder-secret'
const TOKEN_NAME = 'pcbuilder_token'
type UserRole = 'KHACH_HANG' | 'QUAN_TRI_VIEN'

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
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function verifyAccessToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string; email: string; role: string }
  } catch {
    return null
  }
}

export function createAuthCookie(token: string) {
  const maxAge = 60 * 60 * 24 * 7
  return `${TOKEN_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
}

export function clearAuthCookie() {
  return `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
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
