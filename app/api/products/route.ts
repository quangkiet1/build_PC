import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')
  const skip = (page - 1) * limit
  const search = searchParams.get('search') || ''

  const where: any = {}
  if (search) {
    where.OR = [
      { tenSanPham: { contains: search, mode: 'insensitive' } },
      { moTa: { contains: search, mode: 'insensitive' } },
    ]
  }

  const data = await prisma.sanPham.findMany({
    where,
    include: {
      danhMuc: {
        select: { id: true, tenDanhMuc: true },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  })

  const total = await prisma.sanPham.count({ where })

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}