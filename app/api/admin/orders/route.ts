import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const orders = await prisma.donHang.findMany({
      orderBy: { ngayTao: 'desc' },
      include: {
        nguoiDung: true,
        chiTietDonHangs: { include: { sanPham: true } },
        thanhToans: true,
      },
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('GET /api/admin/orders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
