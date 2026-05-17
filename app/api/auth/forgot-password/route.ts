import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/mailer'

const IS_DEV = process.env.NODE_ENV !== 'production'

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email không đúng định dạng' }, { status: 400 })
    }

    // Tìm người dùng
    const user = await prisma.nguoiDung.findUnique({
      where: { email },
      select: { id: true, hoTen: true, email: true },
    })

    if (!user) {
      // Trả về thành công để tránh email enumeration attack
      return NextResponse.json({ message: 'Nếu email tồn tại, mã xác nhận đã được gửi' })
    }

    // Rate limit: không gửi lại trong 60 giây
    const recentOtp = await prisma.maXacNhan.findFirst({
      where: {
        email,
        loai: 'QUEN_MAT_KHAU',
        ngayTao: { gte: new Date(Date.now() - 60 * 1000) },
      },
      orderBy: { ngayTao: 'desc' },
    })

    if (recentOtp) {
      const secondsLeft = Math.ceil(
        (recentOtp.ngayTao.getTime() + 60 * 1000 - Date.now()) / 1000
      )
      return NextResponse.json(
        { error: `Vui lòng chờ ${secondsLeft} giây trước khi gửi lại` },
        { status: 429 }
      )
    }

    // Hủy tất cả OTP cũ chưa dùng
    await prisma.maXacNhan.deleteMany({
      where: { email, loai: 'QUEN_MAT_KHAU', daXacNhan: false },
    })

    // Tạo OTP mới (2 phút)
    const otp = generateOtp()
    const hetHan = new Date(Date.now() + 2 * 60 * 1000)

    await prisma.maXacNhan.create({
      data: { email, ma: otp, loai: 'QUEN_MAT_KHAU', hetHan },
    })

    // Thử gửi email — nếu lỗi thì fallback sang dev mode
    let emailSent = false
    let emailError = ''
    try {
      await sendOtpEmail(email, otp, user.hoTen)
      emailSent = true
    } catch (err) {
      emailError = err instanceof Error ? err.message : 'SMTP error'
      console.warn('[DEV] Email send failed, using console fallback:', emailError)
      console.log(`\n📬 [DEV MODE] OTP for ${email}: ${otp}\n`)
    }

    if (emailSent) {
      return NextResponse.json({ message: 'Mã xác nhận đã được gửi đến email của bạn' })
    }

    // Dev mode: trả OTP về response để test mà không cần SMTP
    if (IS_DEV) {
      return NextResponse.json({
        message: 'Mã xác nhận (chế độ dev - SMTP chưa cấu hình)',
        devOtp: otp,
        devNote: `SMTP Error: ${emailError}`,
      })
    }

    // Production: ẩn OTP, báo lỗi
    return NextResponse.json(
      { error: 'Không thể gửi email. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    const msg = error instanceof Error ? error.message : 'Lỗi máy chủ'
    return NextResponse.json({ error: `Lỗi máy chủ: ${msg}` }, { status: 500 })
  }
}
