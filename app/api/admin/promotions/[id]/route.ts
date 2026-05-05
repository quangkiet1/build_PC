import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

interface PromotionBody {
  tenKhuyenMai: string
  phanTramGiam: string | number
  ngayBatDau: string
  ngayKetThuc: string
  isActive?: boolean
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as PromotionBody
    const { tenKhuyenMai, phanTramGiam, ngayBatDau, ngayKetThuc, isActive } = body

    if (!tenKhuyenMai || !phanTramGiam || !ngayBatDau || !ngayKetThuc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const percent = parseInt(String(phanTramGiam))
    if (percent < 1 || percent > 100) {
      return NextResponse.json({ error: 'Percentage must be between 1 and 100' }, { status: 400 })
    }

    const promotion = await prisma.khuyenMai.update({
      where: { id },
      data: {
        tenKhuyenMai: tenKhuyenMai.trim(),
        phanTramGiam: percent,
        ngayBatDau: new Date(ngayBatDau),
        ngayKetThuc: new Date(ngayKetThuc),
        isActive: isActive !== false,
      },
    })

    return NextResponse.json({ promotion })
  } catch (error) {
    console.error('PUT /api/admin/promotions/[id]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    await prisma.khuyenMai.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/promotions/[id]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
