import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAccessToken, createAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()
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
        { error: 'Phiên xác thực không hợp lệ. Vui lòng bắt đầu lại.' },
        { status: 400 }
      )
    }

    const user = await prisma.nguoiDung.findUnique({
      where: { email },
      select: { id: true, email: true, hoTen: true, vaiTro: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Tài khoản không tồn tại' }, { status: 404 })
    }

    await prisma.maXacNhan.delete({ where: { id: record.id } })

    const token = createAccessToken({ id: user.id, email: user.email, vaiTro: user.vaiTro })
    const response = NextResponse.json({
      message: 'Đăng nhập thành công',
      user: { id: user.id, name: user.hoTen, email: user.email, role: user.vaiTro },
    })
    response.headers.set('Set-Cookie', createAuthCookie(token))

    return response
  } catch (error) {
    console.error('Skip reset error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
