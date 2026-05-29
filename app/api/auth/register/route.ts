import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createAccessToken, getAuthCookieOptions, getJwtSecret, TOKEN_NAME } from '@/lib/auth'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    getJwtSecret()

    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Du lieu dang ky khong hop le' }, { status: 400 })
    }

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''
    const address = typeof body.address === 'string' ? body.address.trim() : ''

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Tên, email và mật khẩu là bắt buộc' }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Email không đúng định dạng' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
    }

    const existing = await prisma.nguoiDung.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.$transaction(async (transaction) => {
      const createdUser = await transaction.nguoiDung.create({
        data: {
          hoTen: name,
          email,
          matKhauHash: hashedPassword,
          soDienThoai: phone || null,
          diaChi: address || null
        }
      })

      await transaction.gioHang.upsert({
        where: { nguoiDungId: createdUser.id },
        create: { nguoiDungId: createdUser.id },
        update: {}
      })

      return createdUser
    })

    const token = createAccessToken({ id: user.id, email: user.email, vaiTro: user.vaiTro })
    const response = NextResponse.json({
      user: { id: user.id, name: user.hoTen, email: user.email, role: user.vaiTro },
      message: 'Đăng ký thành công'
    })
    response.cookies.set(TOKEN_NAME, token, getAuthCookieOptions())

    return response
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Đăng ký thất bại. Kiểm tra cấu hình server và kết nối database.' }, { status: 500 })
  }
}
