import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { authorizeRoles } from '@/lib/auth'
import { Prisma } from '@prisma/client'

function buildWhere(search: string, category: string): Prisma.SanPhamWhereInput {
  return {
    ...(search
      ? {
          OR: [
            { tenSanPham: { contains: search, mode: 'insensitive' } },
            { moTa: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {}),
    ...(category && category.toLowerCase() !== 'all'
      ? {
          danhMuc: { tenDanhMuc: { equals: category, mode: 'insensitive' } }
        }
      : {})
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page') || '1')
    const limit = Number(searchParams.get('limit') || '12')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'newest'
    const skip = (page - 1) * limit

    const where = buildWhere(search, category)
    const orderBy =
      sort === 'price-asc'
        ? ({ gia: 'asc' } as const)
        : sort === 'price-desc'
          ? ({ gia: 'desc' } as const)
          : ({ createdAt: 'desc' } as const)

    const [data, total] = await Promise.all([
      prisma.sanPham.findMany({
        where,
        include: {
          danhMuc: {
            select: { id: true, tenDanhMuc: true }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.sanPham.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('GET /api/products error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
  if (!auth.user) {
    return NextResponse.json({ error: 'Chi admin moi co quyen tao san pham' }, { status: 403 })
  }

  const body = await request.json()
  const { tenSanPham, slug, gia, moTa, danhMucId, thongSoKyThuat, hinhAnh, hinhAnhs, soLuongTon } = body

  if (!tenSanPham || !slug || !gia || !danhMucId) {
    return NextResponse.json({ error: 'Thieu thong tin san pham' }, { status: 400 })
  }

  const product = await prisma.sanPham.create({
    data: {
      tenSanPham,
      slug,
      gia: Number(gia),
      moTa: moTa || '',
      danhMucId,
      thongSoKyThuat: thongSoKyThuat || {},
      hinhAnh: hinhAnh || null,
      hinhAnhs: hinhAnhs || [],
      soLuongTon: Number(soLuongTon || 0)
    },
    include: { danhMuc: true }
  })

  return NextResponse.json({ success: true, product }, { status: 201 })
}
