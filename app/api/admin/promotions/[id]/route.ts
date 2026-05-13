import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

interface PromotionBody {
  tenKhuyenMai: string
  moTa?: string
  phanTramGiam?: string | number
  loaiGiamGia?: 'PHAN_TRAM' | 'SO_TIEN'
  giaTriGiam?: string | number
  minOrderValue?: string | number | null
  gioiHanTong?: string | number | null
  gioiHanMoiNguoi?: string | number
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
    const loaiGiamGia = body.loaiGiamGia || 'PHAN_TRAM'

    if (!body.tenKhuyenMai || !body.ngayBatDau || !body.ngayKetThuc) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (!['PHAN_TRAM', 'SO_TIEN'].includes(loaiGiamGia)) {
      return NextResponse.json({ error: 'Discount type is invalid' }, { status: 400 })
    }

    const discountValue = Number(body.giaTriGiam ?? body.phanTramGiam)
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return NextResponse.json({ error: 'Discount value must be greater than 0' }, { status: 400 })
    }

    if (loaiGiamGia === 'PHAN_TRAM' && (discountValue < 1 || discountValue > 100)) {
      return NextResponse.json({ error: 'Percentage must be between 1 and 100' }, { status: 400 })
    }

    const startDate = new Date(body.ngayBatDau)
    const endDate = new Date(body.ngayKetThuc)
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate >= endDate) {
      return NextResponse.json({ error: 'Date range is invalid' }, { status: 400 })
    }

    const promotion = await prisma.khuyenMai.update({
      where: { id },
      data: {
        tenKhuyenMai: body.tenKhuyenMai.trim(),
        moTa: body.moTa?.trim() || null,
        phanTramGiam: loaiGiamGia === 'PHAN_TRAM' ? Math.round(discountValue) : 0,
        loaiGiamGia,
        giaTriGiam: discountValue,
        minOrderValue: body.minOrderValue ? Number(body.minOrderValue) : null,
        gioiHanTong: body.gioiHanTong ? Number(body.gioiHanTong) : null,
        gioiHanMoiNguoi: Math.max(1, Number(body.gioiHanMoiNguoi || 1)),
        ngayBatDau: startDate,
        ngayKetThuc: endDate,
        isActive: body.isActive !== false,
      },
      include: {
        _count: { select: { suDungKhuyenMais: true } },
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

    const usedCount = await prisma.suDungKhuyenMai.count({ where: { khuyenMaiId: id } })
    if (usedCount > 0) {
      const promotion = await prisma.khuyenMai.update({
        where: { id },
        data: { isActive: false },
      })

      return NextResponse.json({
        success: true,
        softDeleted: true,
        promotion,
        message: 'Promotion has usage history, so it was disabled instead of deleted.',
      })
    }

    await prisma.khuyenMai.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/promotions/[id]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
