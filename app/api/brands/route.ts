import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get all distinct brands
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

    const uniqueBrands = brands
      .map((p) => p.thuongHieu)
      .filter((b) => b !== null) as string[]

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
