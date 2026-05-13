import { Prisma } from '@prisma/client'

export function calculateRewardPoints(total: number) {
  return Math.floor(Math.max(0, total) / 1000)
}

export function getMembershipTier(points: number) {
  if (points >= 50000) return 'Platinum'
  if (points >= 10000) return 'Gold'
  return 'Silver'
}

export async function awardOrderRewardPoints(tx: Prisma.TransactionClient, orderId: string) {
  const order = await tx.donHang.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      maDonHang: true,
      trangThai: true,
      tongTien: true,
      nguoiDungId: true,
    },
  })

  if (!order || order.trangThai !== 'DA_GIAO') {
    return null
  }

  const existing = await tx.lichSuDiem.findUnique({
    where: { donHangId: order.id },
  })

  if (existing) {
    return existing
  }

  const points = calculateRewardPoints(order.tongTien)
  if (points <= 0) {
    return null
  }

  await tx.nguoiDung.update({
    where: { id: order.nguoiDungId },
    data: {
      diemTichLuy: { increment: points },
    },
  })

  return tx.lichSuDiem.create({
    data: {
      diem: points,
      loai: 'CONG',
      lyDo: `Cong diem tu don hang ${order.maDonHang}`,
      nguoiDungId: order.nguoiDungId,
      donHangId: order.id,
    },
  })
}
