import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const skip = (page - 1) * limit
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { tenSanPham: { contains: search, mode: 'insensitive' } },
      { moTa: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (category && category.toLowerCase() !== 'all') {
    where.danhMuc = { tenDanhMuc: { equals: category, mode: 'insensitive' } }
  }

  const data = await prisma.sanPham.findMany({
    where,
    include: {
      danhMuc: {
        select: { id: true, tenDanhMuc: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  })

  const total = await prisma.sanPham.count({ where })

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
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user || user.vaiTro !== 'QUAN_TRI_VIEN') {
    return NextResponse.json({ error: 'Chỉ admin mới có quyền tạo sản phẩm' }, { status: 403 })
  }

  const body = await request.json()
  const { tenSanPham, slug, gia, moTa, danhMucId, thongSoKyThuat, hinhAnh, hinhAnhs, soLuongTon } = body

  if (!tenSanPham || !slug || !gia || !danhMucId) {
    return NextResponse.json({ error: 'Thiếu thông tin sản phẩm' }, { status: 400 })
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
    }
  })

  return NextResponse.json({ success: true, product })
}
