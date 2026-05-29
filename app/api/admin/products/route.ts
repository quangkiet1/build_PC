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

    const body = await request.json() as Record<string, unknown>
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
      return Boolean(existing)
    })

    await ensureBrandExists(validated.data.thuongHieu)

    const product = await prisma.sanPham.create({
      data: {
        tenSanPham: validated.data.tenSanPham,
        slug,
        gia: validated.data.gia,
        soLuongTon: validated.data.soLuongTon,
        danhMucId: validated.data.danhMucId,
        thuongHieu: validated.data.thuongHieu ?? null,
        moTa: validated.data.moTa,
        hinhAnhs: validated.data.hinhAnhs || [],
        hinhAnh: validated.data.hinhAnh ?? validated.data.hinhAnhs?.[0] ?? null,
        thongSoKyThuat: validated.data.thongSoKyThuat ? JSON.parse(JSON.stringify(validated.data.thongSoKyThuat)) : null,
        phanTramGiam: body.phanTramGiam ? parseInt(String(body.phanTramGiam)) : null,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/products:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Xung dot du lieu duy nhat' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
