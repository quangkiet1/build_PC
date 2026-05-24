import { randomInt } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOtpEmail } from '@/lib/mailer'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const IS_DEV = process.env.NODE_ENV !== 'production'
const OTP_TTL_MS = 2 * 60 * 1000
const RESEND_COOLDOWN_MS = 60 * 1000

function generateOtp() {
  return randomInt(100000, 1000000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body.email !== 'string') {
      return NextResponse.json({ error: 'Email không hợp lệ' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Email không đúng định dạng' }, { status: 400 })
    }

    const user = await prisma.nguoiDung.findUnique({
      where: { email },
      select: { id: true, hoTen: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Email này chưa có tài khoản. Vui lòng đăng ký trước khi dùng quên mật khẩu.' },
        { status: 404 }
      )
    }

    const recentOtp = await prisma.maXacNhan.findFirst({
      where: {
        email,
        loai: 'QUEN_MAT_KHAU',
        ngayTao: { gte: new Date(Date.now() - RESEND_COOLDOWN_MS) },
      },
      orderBy: { ngayTao: 'desc' },
    })

    if (recentOtp) {
      const secondsLeft = Math.ceil(
        (recentOtp.ngayTao.getTime() + RESEND_COOLDOWN_MS - Date.now()) / 1000
      )
      return NextResponse.json(
        { error: `Vui lòng chờ ${secondsLeft} giây trước khi gửi lại mã OTP.` },
        { status: 429 }
      )
    }

    await prisma.maXacNhan.deleteMany({
      where: { email, loai: 'QUEN_MAT_KHAU', daXacNhan: false },
    })

    const otp = generateOtp()
    await prisma.maXacNhan.create({
      data: {
        email,
        ma: otp,
        loai: 'QUEN_MAT_KHAU',
        hetHan: new Date(Date.now() + OTP_TTL_MS),
      },
    })

    let emailError = ''
    try {
      await sendOtpEmail(email, otp, user.hoTen)
      return NextResponse.json({
        message: 'Mã OTP đã được gửi đến email của bạn.',
      })
    } catch (error) {
      emailError = error instanceof Error ? error.message : 'SMTP error'
      console.warn('[auth] Failed to send OTP email:', emailError)
    }

    if (IS_DEV) {
      return NextResponse.json({
        message: 'SMTP chưa cấu hình xong. Dùng OTP dev để kiểm thử.',
        devOtp: otp,
        devNote: emailError,
      })
    }

    return NextResponse.json(
      { error: 'Không thể gửi email OTP. Vui lòng thử lại sau.' },
      { status: 500 }
    )
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ' }, { status: 500 })
  }
}
