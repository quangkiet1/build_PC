import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, createAccessToken, createAuthCookie, getJwtSecret } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    getJwtSecret()

    const body = await request.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

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
    const response = NextResponse.json({ user: { id: user.id, name: user.hoTen, email: user.email, role: user.vaiTro } })
    response.headers.set('Set-Cookie', createAuthCookie(token))

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Đăng nhập thất bại. Kiểm tra cấu hình server và kết nối database.' }, { status: 500 })
  }
}
