import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const users = await prisma.nguoiDung.findMany({
      orderBy: { ngayTao: 'desc' },
      select: {
        id: true,
        hoTen: true,
        email: true,
        vaiTro: true,
        soDienThoai: true,
        diaChi: true,
        ngayTao: true,
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('GET /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
