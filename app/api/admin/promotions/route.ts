import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const promotions = await prisma.khuyenMai.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ promotions })
  } catch (error) {
    console.error('GET /api/admin/promotions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { maKhuyenMai, tenKhuyenMai, phanTramGiam, ngayBatDau, ngayKetThuc, isActive } = body

    if (!maKhuyenMai || !tenKhuyenMai || !phanTramGiam || !ngayBatDau || !ngayKetThuc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check percentage validity
    const percent = parseInt(phanTramGiam)
    if (percent < 1 || percent > 100) {
      return NextResponse.json({ error: 'Percentage must be between 1 and 100' }, { status: 400 })
    }

    // Check if promo code already exists (for new promotions)
    const existing = await prisma.khuyenMai.findFirst({
      where: { maKhuyenMai: maKhuyenMai.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json({ error: 'Promotion code already exists' }, { status: 400 })
    }

    const promotion = await prisma.khuyenMai.create({
      data: {
        maKhuyenMai: maKhuyenMai.toUpperCase(),
        tenKhuyenMai: tenKhuyenMai.trim(),
        phanTramGiam: percent,
        ngayBatDau: new Date(ngayBatDau),
        ngayKetThuc: new Date(ngayKetThuc),
        isActive: isActive !== false,
      },
    })

    return NextResponse.json({ promotion }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/promotions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
