import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { tenSanPham, gia, soLuongTon, danhMucId, moTa } = body

    if (!tenSanPham || !danhMucId || gia === undefined || soLuongTon === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const product = await prisma.sanPham.update({
      where: { id },
      data: {
        tenSanPham: tenSanPham.trim(),
        gia: parseFloat(gia),
        soLuongTon: parseInt(soLuongTon),
        danhMucId,
        moTa: moTa?.trim() || undefined,
      },
    })

    return NextResponse.json({ product })
  } catch (error) {
    console.error('PUT /api/admin/products/[id]:', error)
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
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
    if ((error as any).code === 'P2025') {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
