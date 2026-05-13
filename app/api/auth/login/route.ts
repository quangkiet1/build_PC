import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, createAccessToken, createAuthCookie, getJwtSecret } from '@/lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    getJwtSecret()

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Du lieu dang nhap khong hop le' }, { status: 400 })
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (!email || !password) {
      return NextResponse.json({ error: 'Email và mật khẩu là bắt buộc' }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Email không đúng định dạng' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
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
    const response = NextResponse.json({
      user: { id: user.id, name: user.hoTen, email: user.email, role: user.vaiTro },
      message: 'Đăng nhập thành công'
    })
    response.headers.set('Set-Cookie', createAuthCookie(token))

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Đăng nhập thất bại. Kiểm tra cấu hình server và kết nối database.' }, { status: 500 })
  }
}
