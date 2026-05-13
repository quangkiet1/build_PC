import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { getMembershipTier } from '@/lib/rewards'

export async function GET(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [user, history] = await Promise.all([
    prisma.nguoiDung.findUnique({
      where: { id: auth.user.id },
      select: { diemTichLuy: true },
    }),
    prisma.lichSuDiem.findMany({
      where: { nguoiDungId: auth.user.id },
      include: {
        donHang: {
          select: {
            maDonHang: true,
            tongTien: true,
          },
        },
      },
      orderBy: { ngayTao: 'desc' },
      take: 50,
    }),
  ])

  const points = user?.diemTichLuy || 0
  return NextResponse.json({
    diemTichLuy: points,
    hangThanhVien: getMembershipTier(points),
    history,
  })
}
