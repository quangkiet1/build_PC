import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const products = await prisma.sanPham.findMany({
      include: { danhMuc: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ products })
  } catch (error) {
    console.error('GET /api/admin/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { tenSanPham, gia, soLuongTon, danhMucId, moTa } = body

    if (!tenSanPham || !danhMucId || gia === undefined || soLuongTon === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const slug = tenSanPham.toLowerCase().replace(/\s+/g, '-')

    const product = await prisma.sanPham.create({
      data: {
        tenSanPham: tenSanPham.trim(),
        slug,
        gia: parseFloat(gia),
        soLuongTon: parseInt(soLuongTon),
        danhMucId,
        moTa: moTa?.trim() || undefined,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/products:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
