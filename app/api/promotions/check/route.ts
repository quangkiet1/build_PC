import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { validateCouponForCheckout } from '@/lib/coupons'

interface PromotionCheckRequest {
  maKhuyenMai: string
  orderTotal?: number
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as PromotionCheckRequest
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

    const promotion = result.coupon
    return NextResponse.json({
      promotion: {
        id: promotion.id,
        maKhuyenMai: promotion.maKhuyenMai,
        tenKhuyenMai: promotion.tenKhuyenMai,
        moTa: promotion.moTa,
        phanTramGiam: promotion.phanTramGiam,
        loaiGiamGia: promotion.loaiGiamGia,
        giaTriGiam: promotion.giaTriGiam,
        minOrderValue: promotion.minOrderValue,
        gioiHanTong: promotion.gioiHanTong,
        gioiHanMoiNguoi: promotion.gioiHanMoiNguoi,
        soLuotDaDung: result.totalUsed,
        ngayBatDau: promotion.ngayBatDau,
        ngayKetThuc: promotion.ngayKetThuc,
      },
      discount: result.discount,
      finalTotal: result.finalTotal,
      alreadyUsed: result.userUsed > 0,
      status: 'success',
    })
  } catch (error) {
    console.error('POST /api/promotions/check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Kept for backward compatibility with older UI flows. New checkout usage is
// recorded transactionally in POST /api/orders.
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as { khuyenMaiId: string }
    const { khuyenMaiId } = body

    if (!khuyenMaiId) {
      return NextResponse.json({ error: 'Thieu khuyen mai ID' }, { status: 400 })
    }

    const userPromotion = await prisma.userKhuyenMai.findUnique({
      where: {
        nguoiDungId_khuyenMaiId: {
          nguoiDungId: auth.user.id,
          khuyenMaiId,
        },
      },
    })

    if (!userPromotion) {
      return NextResponse.json({ error: 'Khuyen mai khong duoc gan cho nguoi dung' }, { status: 404 })
    }

    if (userPromotion.daSuDung) {
      return NextResponse.json({ error: 'Ma khuyen mai da duoc su dung' }, { status: 400 })
    }

    await prisma.userKhuyenMai.update({
      where: { id: userPromotion.id },
      data: {
        daSuDung: true,
        ngaySuDung: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/promotions/check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
