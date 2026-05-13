import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const orders = await prisma.donHang.findMany({
    where: { nguoiDungId: auth.user.id },
    select: {
      id: true,
      maDonHang: true,
      trangThai: true,
      tamTinh: true,
      tienGiam: true,
      tongTien: true,
      ngayTao: true,
      khuyenMai: {
        select: {
          maKhuyenMai: true,
          tenKhuyenMai: true,
        },
      },
    },
    orderBy: { ngayTao: 'desc' },
  })

  return NextResponse.json({ orders })
}
