import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createAccessToken, createAuthCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name, email, password, phone, address } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Tên, email và mật khẩu là bắt buộc' }, { status: 400 })
  }

  const existing = await prisma.nguoiDung.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email đã tồn tại' }, { status: 409 })
  }

  const hashedPassword = await hashPassword(password)
  const user = await prisma.nguoiDung.create({
    data: {
      hoTen: name,
      email,
      matKhauHash: hashedPassword,
      soDienThoai: phone || null,
      diaChi: address || null
    }
  })

  await prisma.gioHang.upsert({
    where: { nguoiDungId: user.id },
    create: { nguoiDungId: user.id },
    update: {}
  })

  const token = createAccessToken({ id: user.id, email: user.email, vaiTro: user.vaiTro })
  const response = NextResponse.json({ user: { id: user.id, name: user.hoTen, email: user.email, role: user.vaiTro }, token })
  response.headers.set('Set-Cookie', createAuthCookie(token))

  return response
}
