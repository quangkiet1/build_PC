import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as {
      maKhuyenMai: string
      sanPhamIds?: string[]
    }

    const maKhuyenMai = String(body.maKhuyenMai || '').trim().toUpperCase()
    if (!maKhuyenMai) {
      return NextResponse.json({ error: 'Mã khuyến mãi không được để trống' }, { status: 400 })
    }

    // Find promotion by code
    const promotion = await prisma.khuyenMai.findUnique({
      where: { maKhuyenMai },
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Mã khuyến mãi không hợp lệ' }, { status: 404 })
    }

    if (!promotion.isActive) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã hết hạn' }, { status: 400 })
    }

    // Check date range
    const now = new Date()
    if (now < promotion.ngayBatDau || now > promotion.ngayKetThuc) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã hết hạn' }, { status: 400 })
    }

    // Check if user already used this promotion (for single-use promos, if needed)
    const existingUserPromo = await prisma.userKhuyenMai.findUnique({
      where: {
        nguoiDungId_khuyenMaiId: {
          nguoiDungId: auth.user.id,
          khuyenMaiId: promotion.id,
        },
      },
    })

    if (existingUserPromo?.daSuDung) {
      return NextResponse.json({ error: 'Bạn đã sử dụng mã khuyến mãi này rồi' }, { status: 400 })
    }

    // Get applicable products (if specific products for this promo)
    let applicableProducts: { id: string; phanTramGiam: number }[] = []

    if (body.sanPhamIds && body.sanPhamIds.length > 0) {
      // Check if products have specific discounts for this promotion
      const productDiscounts = await prisma.khuyenMaiSanPham.findMany({
        where: {
          khuyenMaiId: promotion.id,
          sanPhamId: { in: body.sanPhamIds },
          isActive: true,
          ngayBatDau: { lte: now },
          ngayKetThuc: { gte: now },
        },
        select: {
          sanPhamId: true,
          phanTramGiam: true,
        },
      })

      if (productDiscounts.length > 0) {
        applicableProducts = productDiscounts.map(pd => ({
          id: pd.sanPhamId,
          phanTramGiam: pd.phanTramGiam,
        }))
      } else {
        // If no specific product discounts, apply global promo to all requested products
        applicableProducts = body.sanPhamIds.map(id => ({
          id,
          phanTramGiam: promotion.phanTramGiam,
        }))
      }
    }

    // Mark promotion as used by user (if this is their first use)
    if (!existingUserPromo) {
      await prisma.userKhuyenMai.create({
        data: {
          nguoiDungId: auth.user.id,
          khuyenMaiId: promotion.id,
          daSuDung: applicableProducts.length > 0,
          ngaySuDung: applicableProducts.length > 0 ? now : null,
        },
      })
    } else {
      // Update if they had it but haven't used it yet
      await prisma.userKhuyenMai.update({
        where: {
          id: existingUserPromo.id,
        },
        data: {
          daSuDung: true,
          ngaySuDung: now,
        },
      })
    }

    return NextResponse.json({
      success: true,
      promotion: {
        id: promotion.id,
        maKhuyenMai: promotion.maKhuyenMai,
        tenKhuyenMai: promotion.tenKhuyenMai,
        phanTramGiam: promotion.phanTramGiam,
      },
      applicableProducts,
    })
  } catch (error) {
    console.error('POST /api/promotions/apply:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
