import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.email !== 'string' || typeof body.otp !== 'string') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()
    const otp = body.otp.trim()

    // Tìm OTP hợp lệ gần nhất
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
        { error: 'Mã xác nhận không tồn tại hoặc đã được sử dụng. Vui lòng yêu cầu mã mới.' },
        { status: 400 }
      )
    }

    // Kiểm tra hết hạn
    if (new Date() > record.hetHan) {
      await prisma.maXacNhan.delete({ where: { id: record.id } })
      return NextResponse.json(
        { error: 'Mã xác nhận đã hết hạn (2 phút). Vui lòng yêu cầu mã mới.' },
        { status: 400 }
      )
    }

    // Kiểm tra số lần thử (tối đa 5 lần)
    if (record.soLanThu >= 5) {
      await prisma.maXacNhan.delete({ where: { id: record.id } })
      return NextResponse.json(
        { error: 'Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.' },
        { status: 429 }
      )
    }

    // Kiểm tra mã
    if (record.ma !== otp) {
      await prisma.maXacNhan.update({
        where: { id: record.id },
        data: { soLanThu: { increment: 1 } },
      })
      const remaining = 5 - (record.soLanThu + 1)
      return NextResponse.json(
        { error: `Mã xác nhận không đúng. Còn ${remaining} lần thử.` },
        { status: 400 }
      )
    }

    // Đánh dấu OTP đã xác nhận
    await prisma.maXacNhan.update({
      where: { id: record.id },
      data: { daXacNhan: true },
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Xác nhận thành công',
      email, // trả về để client dùng cho bước tiếp theo
    })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
