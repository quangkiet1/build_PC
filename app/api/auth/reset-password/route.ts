import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAccessToken, getAuthCookieOptions, hashPassword, TOKEN_NAME } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.email !== 'string' || typeof body.password !== 'string') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()
    const password = body.password

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      )
    }

    const record = await prisma.maXacNhan.findFirst({
      where: {
        email,
        loai: 'QUEN_MAT_KHAU',
        daXacNhan: true,
        ngayTao: { gte: new Date(Date.now() - 10 * 60 * 1000) },
      },
      orderBy: { ngayTao: 'desc' },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Phiên xác thực không hợp lệ hoặc đã hết hạn. Vui lòng bắt đầu lại.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.nguoiDung.findUnique({
      where: { email },
      select: { id: true },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 })
    }

    const hashedPassword = await hashPassword(password)
    const user = await prisma.nguoiDung.update({
      where: { email },
      data: { matKhauHash: hashedPassword },
      select: { id: true, email: true, hoTen: true, vaiTro: true },
    })

    await prisma.maXacNhan.delete({ where: { id: record.id } })

    const token = createAccessToken({ id: user.id, email: user.email, vaiTro: user.vaiTro })
    const response = NextResponse.json({
      message: 'Đặt lại mật khẩu thành công',
      user: { id: user.id, name: user.hoTen, email: user.email, role: user.vaiTro },
    })
    response.cookies.set(TOKEN_NAME, token, getAuthCookieOptions())

    return response
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
