import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

type RouteProps = {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteProps) {
  const user = await authenticateRequest(request)
  if (!user || user.vaiTro !== 'QUAN_TRI_VIEN') {
    return NextResponse.json({ error: 'Chi admin moi co quyen cap nhat danh muc' }, { status: 403 })
  }

  const { id } = await params
  const body = await request.json()
  const category = await prisma.danhMuc.update({
    where: { id },
    data: {
      tenDanhMuc: body.tenDanhMuc,
      moTa: body.moTa ?? null
    }
  })

  return NextResponse.json({ category })
}

export async function DELETE(request: NextRequest, { params }: RouteProps) {
  const user = await authenticateRequest(request)
  if (!user || user.vaiTro !== 'QUAN_TRI_VIEN') {
    return NextResponse.json({ error: 'Chi admin moi co quyen xoa danh muc' }, { status: 403 })
  }

  const { id } = await params
  await prisma.danhMuc.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
