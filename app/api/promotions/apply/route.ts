import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { validateCouponForCheckout } from '@/lib/coupons'

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as { maKhuyenMai: string; orderTotal?: number }
    const cart = await prisma.gioHang.findUnique({
      where: { nguoiDungId: auth.user.id },
      include: { items: { include: { sanPham: true } } },
    })

    const subtotal = cart?.items.reduce((sum, item) => sum + item.soLuong * item.sanPham.gia, 0) || Number(body.orderTotal || 0)
    const result = await validateCouponForCheckout({
      code: body.maKhuyenMai,
      userId: auth.user.id,
      subtotal,
    })

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    return NextResponse.json({
      success: true,
      promotion: result.coupon,
      discount: result.discount,
      finalTotal: result.finalTotal,
    })
  } catch (error) {
    console.error('POST /api/promotions/apply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
