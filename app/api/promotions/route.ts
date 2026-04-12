import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get active global promotions
    const now = new Date()
    
    const promotions = await prisma.khuyenMai.findMany({
      where: {
        isActive: true,
        ngayBatDau: { lte: now },
        ngayKetThuc: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Get active product-specific promotions with product details
    const productPromotions = await prisma.khuyenMaiSanPham.findMany({
      where: {
        isActive: true,
        ngayBatDau: { lte: now },
        ngayKetThuc: { gte: now },
      },
      include: {
        sanPham: {
          select: {
            id: true,
            tenSanPham: true,
            gia: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format product promotions with calculated discount price
    const formattedProductPromotions = productPromotions.map((pp) => ({
      id: pp.id,
      sanPhamId: pp.sanPham.id,
      tenSanPham: pp.sanPham.tenSanPham,
      gia: pp.sanPham.gia,
      phanTramGiam: pp.phanTramGiam,
      giaSauGiam: pp.sanPham.gia * (1 - pp.phanTramGiam / 100),
      ngayBatDau: pp.ngayBatDau,
      ngayKetThuc: pp.ngayKetThuc,
      isActive: pp.isActive,
    }))

    return NextResponse.json({
      promotions,
      productPromotions: formattedProductPromotions,
    })
  } catch (error) {
    console.error('GET /api/promotions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
