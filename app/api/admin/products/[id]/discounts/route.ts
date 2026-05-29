import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const discounts = await prisma.khuyenMaiSanPham.findMany({
      where: { sanPhamId: id },
      include: { khuyenMai: true },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ discounts })
  } catch (error) {
    console.error('GET /api/admin/products/[id]/discounts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as {
      phanTramGiam: number
      ngayBatDau: string
      ngayKetThuc: string
      khuyenMaiId?: string
      isActive?: boolean
    }

    const { phanTramGiam, ngayBatDau, ngayKetThuc, khuyenMaiId, isActive } = body

    if (!phanTramGiam || !ngayBatDau || !ngayKetThuc) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ các trường' }, { status: 400 })
    }

    if (phanTramGiam < 1 || phanTramGiam > 100) {
      return NextResponse.json({ error: 'Phần trăm giảm phải từ 1-100' }, { status: 400 })
    }

    const startDate = new Date(ngayBatDau)
    const endDate = new Date(ngayKetThuc)

    if (startDate >= endDate) {
      return NextResponse.json({ error: 'Ngày kết thúc phải sau ngày bắt đầu' }, { status: 400 })
    }

    // Check if product exists
    const product = await prisma.sanPham.findUnique({ where: { id } })
    if (!product) {
      return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 })
    }

    // Check if khuyenMai exists (if provided)
    if (khuyenMaiId) {
      const promotion = await prisma.khuyenMai.findUnique({ where: { id: khuyenMaiId } })
      if (!promotion) {
        return NextResponse.json({ error: 'Mã khuyến mãi không tồn tại' }, { status: 404 })
      }
    }

    const discount = await prisma.khuyenMaiSanPham.create({
      data: {
        sanPhamId: id,
        khuyenMaiId: khuyenMaiId || null,
        phanTramGiam,
        ngayBatDau: startDate,
        ngayKetThuc: endDate,
        isActive: isActive !== undefined ? isActive : true,
      },
      include: { khuyenMai: true }
    })

    return NextResponse.json({ discount }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/products/[id]/discounts:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Khuyến mãi này đã được thêm cho sản phẩm' }, { status: 409 })
      }
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest
) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as {
      discountId: string
      phanTramGiam?: number
      ngayBatDau?: string
      ngayKetThuc?: string
      isActive?: boolean
    }

    const { discountId, phanTramGiam, ngayBatDau, ngayKetThuc, isActive } = body

    if (!discountId) {
      return NextResponse.json({ error: 'Thiếu ID khuyến mãi' }, { status: 400 })
    }

    type UpdateData = {
      phanTramGiam?: number
      ngayBatDau?: Date
      ngayKetThuc?: Date
      isActive?: boolean
    }

    const updateData: UpdateData = {}
    if (phanTramGiam !== undefined) {
      if (phanTramGiam < 1 || phanTramGiam > 100) {
        return NextResponse.json({ error: 'Phần trăm giảm phải từ 1-100' }, { status: 400 })
      }
      updateData.phanTramGiam = phanTramGiam
    }
    if (ngayBatDau) updateData.ngayBatDau = new Date(ngayBatDau)
    if (ngayKetThuc) updateData.ngayKetThuc = new Date(ngayKetThuc)
    if (isActive !== undefined) updateData.isActive = isActive

    const discount = await prisma.khuyenMaiSanPham.update({
      where: { id: discountId },
      data: updateData,
      include: { khuyenMai: true }
    })

    return NextResponse.json({ discount })
  } catch (error) {
    console.error('PUT /api/admin/products/[id]/discounts:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Khuyến mãi không tồn tại' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest
) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as { discountId: string }
    const { discountId } = body

    if (!discountId) {
      return NextResponse.json({ error: 'Thiếu ID khuyến mãi' }, { status: 400 })
    }

    await prisma.khuyenMaiSanPham.delete({ where: { id: discountId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/products/[id]/discounts:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Khuyến mãi không tồn tại' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
