import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { authorizeRoles } from '@/lib/auth'

type RouteProps = {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, { params }: RouteProps) {
  const { slug } = await params
  const product = await prisma.sanPham.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
    include: { danhMuc: true }
  })

  if (!product) {
    return NextResponse.json({ error: 'San pham khong ton tai' }, { status: 404 })
  }

  return NextResponse.json({ product })
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
  if (!auth.user) {
    return NextResponse.json({ error: 'Chi admin moi co quyen cap nhat san pham' }, { status: 403 })
  }

  const { slug } = await params
  const existing = await prisma.sanPham.findFirst({ where: { OR: [{ slug }, { id: slug }] } })
  if (!existing) {
    return NextResponse.json({ error: 'San pham khong ton tai' }, { status: 404 })
  }

  const body = await request.json()
  const product = await prisma.sanPham.update({
    where: { id: existing.id },
    data: {
      tenSanPham: body.tenSanPham ?? existing.tenSanPham,
      slug: body.slug ?? existing.slug,
      gia: body.gia !== undefined ? Number(body.gia) : existing.gia,
      moTa: body.moTa ?? existing.moTa,
      danhMucId: body.danhMucId ?? existing.danhMucId,
      thongSoKyThuat: body.thongSoKyThuat ?? existing.thongSoKyThuat,
      hinhAnh: body.hinhAnh ?? existing.hinhAnh,
      hinhAnhs: body.hinhAnhs ?? existing.hinhAnhs,
      soLuongTon: body.soLuongTon !== undefined ? Number(body.soLuongTon) : existing.soLuongTon
    },
    include: { danhMuc: true }
  })

  return NextResponse.json({ success: true, product })
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
  if (!auth.user) {
    return NextResponse.json({ error: 'Chi admin moi co quyen xoa san pham' }, { status: 403 })
  }

  const { slug } = await params
  const existing = await prisma.sanPham.findFirst({ where: { OR: [{ slug }, { id: slug }] } })
  if (!existing) {
    return NextResponse.json({ error: 'San pham khong ton tai' }, { status: 404 })
  }

  await prisma.sanPham.delete({ where: { id: existing.id } })
  return NextResponse.json({ success: true })
}
