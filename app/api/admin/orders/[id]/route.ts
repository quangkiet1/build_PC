import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { awardOrderRewardPoints } from '@/lib/rewards'

const VALID_STATUSES = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO', 'DA_HUY'] as const

type OrderStatus = typeof VALID_STATUSES[number]

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as { trangThai?: string }
    const status = String(body.trangThai || '').trim() as OrderStatus

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái đơn hàng không hợp lệ' }, { status: 400 })
    }

    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.donHang.update({
        where: { id },
        data: { trangThai: status },
        include: {
          nguoiDung: true,
          chiTietDonHangs: { include: { sanPham: true } },
          thanhToans: true,
          lichSuDiem: true,
          khuyenMai: true,
        },
      })

      if (status === 'DA_GIAO') {
        await awardOrderRewardPoints(tx, updatedOrder.id)
      }

      return tx.donHang.findUniqueOrThrow({
        where: { id: updatedOrder.id },
        include: {
          nguoiDung: true,
          chiTietDonHangs: { include: { sanPham: true } },
          thanhToans: true,
          lichSuDiem: true,
          khuyenMai: true,
        },
      })
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('PATCH /api/admin/orders/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
