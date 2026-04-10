import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, createAccessToken, createAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc' }, { status: 400 })
  }

  const user = await prisma.nguoiDung.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
  }

  const valid = await comparePassword(password, user.matKhauHash)
  if (!valid) {
    return NextResponse.json({ error: 'Email hoặc mật khẩu không đúng' }, { status: 401 })
  }

  const token = createAccessToken({ id: user.id, email: user.email, vaiTro: user.vaiTro })
  const response = NextResponse.json({ user: { id: user.id, name: user.hoTen, email: user.email, role: user.vaiTro }, token })
  response.headers.set('Set-Cookie', createAuthCookie(token))

  return response
}
