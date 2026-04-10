import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { pathname } = new URL(request.url)
  const slug = pathname.split('/').pop() || ''

  const product = await prisma.sanPham.findUnique({
    where: { slug },
    include: { danhMuc: true }
  })

  if (!product) {
    return NextResponse.json({ error: 'Sản phẩm không tồn tại' }, { status: 404 })
  }

  return NextResponse.json({ product })
}
