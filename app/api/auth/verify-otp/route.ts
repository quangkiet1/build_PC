import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.email !== 'string' || typeof body.otp !== 'string') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()
    const otp = body.otp.replace(/\s/g, '')

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json({ error: 'Mã OTP phải gồm 6 chữ số' }, { status: 400 })
    }

    const record = await prisma.maXacNhan.findFirst({
      where: {
        email,
        loai: 'QUEN_MAT_KHAU',
        daXacNhan: false,
      },
      orderBy: { ngayTao: 'desc' },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Mã OTP không tồn tại hoặc đã được sử dụng. Vui lòng yêu cầu mã mới.' },
        { status: 400 }
      )
    }

    if (new Date() > record.hetHan) {
      await prisma.maXacNhan.delete({ where: { id: record.id } })
      return NextResponse.json(
        { error: 'Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.' },
        { status: 400 }
      )
    }

    if (record.ma !== otp) {
      const nextAttempts = record.soLanThu + 1

      if (nextAttempts >= 5) {
        await prisma.maXacNhan.delete({ where: { id: record.id } })
        return NextResponse.json(
          { error: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.' },
          { status: 429 }
        )
      }

      await prisma.maXacNhan.update({
        where: { id: record.id },
        data: { soLanThu: nextAttempts },
      })

      return NextResponse.json(
        { error: `Mã OTP không đúng. Còn ${5 - nextAttempts} lần thử.` },
        { status: 400 }
      )
    }

    await prisma.maXacNhan.update({
      where: { id: record.id },
      data: { daXacNhan: true },
    })

    return NextResponse.json({
      success: true,
      message: 'Xác thực OTP thành công',
      email,
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
