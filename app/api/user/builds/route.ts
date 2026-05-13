import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const builds = await prisma.cauHinhPC.findMany({
    where: { nguoiDungId: auth.user.id },
    select: {
      id: true,
      tenCauHinh: true,
      tongGia: true,
      isCompleted: true,
      isPublic: true,
      ngayTao: true,
      items: {
        select: {
          id: true,
          soLuong: true,
          sanPham: {
            select: {
              id: true,
              tenSanPham: true,
              gia: true,
            },
          },
        },
      },
    },
    orderBy: { ngayTao: 'desc' },
  })

  return NextResponse.json({ builds })
}
