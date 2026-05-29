import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { aggregateProductBrands } from '@/lib/brands'

export async function GET() {
  try {
    const brands = await prisma.sanPham.findMany({
      where: {
        thuongHieu: {
          not: null
        }
      },
      select: {
        thuongHieu: true
      },
      distinct: ['thuongHieu'],
      orderBy: {
        thuongHieu: 'asc'
      }
    })

    const uniqueBrands = aggregateProductBrands(brands).map((brand) => brand.name)

    return NextResponse.json({
      success: true,
      brands: uniqueBrands
    })
  } catch (error) {
    console.error('GET /api/brands error:', error)
    return NextResponse.json(
      { error: 'Lỗi khi lấy danh sách thương hiệu' },
      { status: 500 }
    )
  }
}
