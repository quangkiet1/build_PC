import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyAccessToken } from '@/lib/auth'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('pcbuilder_token')?.value
  if (!token) return null

  const payload = verifyAccessToken(token)
  if (!payload?.sub) return null

  return prisma.nguoiDung.findUnique({ where: { id: payload.sub } })
}
