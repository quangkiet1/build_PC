import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

interface PromotionCheckRequest {
  maKhuyenMai: string
  sanPhamIds?: string[]  // Optional: check discount for specific products
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as PromotionCheckRequest
    const { maKhuyenMai, sanPhamIds } = body

    if (!maKhuyenMai) {
      return NextResponse.json({ error: 'Vui lòng nhập mã khuyến mãi' }, { status: 400 })
    }

    // Find promotion by code
    const promotion = await prisma.khuyenMai.findUnique({
      where: { maKhuyenMai: maKhuyenMai.toUpperCase() },
      include: {
        khuyenMaiSanPhams: true,
        userKhuyenMais: true
      }
    })

    if (!promotion) {
      return NextResponse.json({ error: 'Mã khuyến mãi không tồn tại' }, { status: 404 })
    }

    if (!promotion.isActive) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã bị vô hiệu hóa' }, { status: 400 })
    }

    const now = new Date()
    if (now < promotion.ngayBatDau) {
      return NextResponse.json({ error: 'Mã khuyến mãi chưa bắt đầu' }, { status: 400 })
    }

    if (now > promotion.ngayKetThuc) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã hết hạn' }, { status: 400 })
    }

    // Check if user already used this promotion
    const userPromotion = await prisma.userKhuyenMai.findUnique({
      where: {
        nguoiDungId_khuyenMaiId: {
          nguoiDungId: auth.user.id,
          khuyenMaiId: promotion.id
        }
      }
    })

    const alreadyUsed = userPromotion?.daSuDung || false

    // Get discount info for specific products
    const discountInfo: Record<string, number> = {}
    
    if (sanPhamIds && sanPhamIds.length > 0) {
      const productDiscounts = await prisma.khuyenMaiSanPham.findMany({
        where: {
          sanPhamId: { in: sanPhamIds },
          khuyenMaiId: promotion.id,
          isActive: true,
          ngayBatDau: { lte: now },
          ngayKetThuc: { gte: now }
        }
      })

      for (const productId of sanPhamIds) {
        const discount = productDiscounts.find(d => d.sanPhamId === productId)
        discountInfo[productId] = discount?.phanTramGiam || promotion.phanTramGiam
      }
    }

    return NextResponse.json({
      promotion: {
        id: promotion.id,
        maKhuyenMai: promotion.maKhuyenMai,
        tenKhuyenMai: promotion.tenKhuyenMai,
        moTa: promotion.moTa,
        phanTramGiam: promotion.phanTramGiam,
        ngayBatDau: promotion.ngayBatDau,
        ngayKetThuc: promotion.ngayKetThuc,
      },
      discountInfo,
      alreadyUsed,
      status: 'success'
    })
  } catch (error) {
    console.error('POST /api/promotions/check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Mark promotion as used
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as { khuyenMaiId: string }
    const { khuyenMaiId } = body

    if (!khuyenMaiId) {
      return NextResponse.json({ error: 'Thiếu khuyến mãi ID' }, { status: 400 })
    }

    const userPromotion = await prisma.userKhuyenMai.findUnique({
      where: {
        nguoiDungId_khuyenMaiId: {
          nguoiDungId: auth.user.id,
          khuyenMaiId
        }
      }
    })

    if (!userPromotion) {
      return NextResponse.json({ error: 'Khuyến mãi không được gán cho người dùng' }, { status: 404 })
    }

    if (userPromotion.daSuDung) {
      return NextResponse.json({ error: 'Mã khuyến mãi đã được sử dụng' }, { status: 400 })
    }

    await prisma.userKhuyenMai.update({
      where: { id: userPromotion.id },
      data: {
        daSuDung: true,
        ngaySuDung: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH /api/promotions/check:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
