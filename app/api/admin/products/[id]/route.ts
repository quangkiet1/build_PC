import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { generateUniqueProductSlug, validateAdminProductPayload } from '@/lib/products'

async function ensureBrandExists(name?: string) {
  if (!name) return

  const existing = await prisma.thuongHieu.findFirst({
    where: { tenThuongHieu: { equals: name, mode: 'insensitive' } },
    select: { id: true },
  })

  if (!existing) {
    await prisma.thuongHieu.create({ data: { tenThuongHieu: name } })
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as Record<string, unknown>
    // Add phanTramGiam to body if provided
    if (body.phanTramGiam === undefined) {
      body.phanTramGiam = null
    }
    const validated = validateAdminProductPayload(body)
    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400 })
    }

    const category = await prisma.danhMuc.findUnique({ where: { id: validated.data.danhMucId } })
    if (!category) {
      return NextResponse.json({ error: 'Danh muc khong ton tai' }, { status: 400 })
    }

    const slug = await generateUniqueProductSlug(validated.data.tenSanPham, async (candidate) => {
      const existing = await prisma.sanPham.findUnique({ where: { slug: candidate }, select: { id: true } })
      return Boolean(existing && existing.id !== id)
    })

    await ensureBrandExists(validated.data.thuongHieu)

    const product = await prisma.sanPham.update({
      where: { id },
      data: {
        tenSanPham: validated.data.tenSanPham,
        slug,
        gia: validated.data.gia,
        soLuongTon: validated.data.soLuongTon,
        danhMucId: validated.data.danhMucId,
        thuongHieu: validated.data.thuongHieu ?? null,
        moTa: validated.data.moTa,
        hinhAnhs: validated.data.hinhAnhs || [],
        hinhAnh: validated.data.hinhAnh ?? validated.data.hinhAnhs?.[0] ?? undefined,
        thongSoKyThuat: validated.data.thongSoKyThuat ? JSON.parse(JSON.stringify(validated.data.thongSoKyThuat)) : null,
        phanTramGiam: body.phanTramGiam ? parseInt(String(body.phanTramGiam)) : null,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('PUT /api/admin/products/[id]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Xung dot du lieu duy nhat' }, { status: 409 })
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

    await prisma.sanPham.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/products/[id]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ error: 'Khong the xoa san pham dang duoc su dung' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
