import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const categories = await prisma.danhMuc.findMany({
      orderBy: { tenDanhMuc: 'asc' },
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error('GET /api/admin/categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
