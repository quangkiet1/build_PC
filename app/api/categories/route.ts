import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.danhMuc.findMany({ orderBy: { tenDanhMuc: 'asc' } })
  return NextResponse.json({ categories })
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user || user.vaiTro !== 'QUAN_TRI_VIEN') {
    return NextResponse.json({ error: 'Chi admin moi co quyen tao danh muc' }, { status: 403 })
  }

  const body = await request.json()
  const { tenDanhMuc, moTa } = body
  if (!tenDanhMuc) {
    return NextResponse.json({ error: 'Ten danh muc la bat buoc' }, { status: 400 })
  }

  const category = await prisma.danhMuc.create({
    data: { tenDanhMuc, moTa: moTa || null }
  })

  return NextResponse.json({ category }, { status: 201 })
}
