import { Prisma, type KhuyenMai, type PrismaClient } from '@prisma/client'
import { prisma } from '@/lib/prisma'

type CouponDb = PrismaClient | Prisma.TransactionClient

export type CouponValidationResult =
  | {
      ok: true
      coupon: KhuyenMai
      discount: number
      finalTotal: number
      totalUsed: number
      userUsed: number
    }
  | {
      ok: false
      error: string
      status: number
    }

export function normalizeCouponCode(value: unknown) {
  return String(value || '').trim().toUpperCase()
}

export function getCouponDisplayValue(coupon: Pick<KhuyenMai, 'loaiGiamGia' | 'giaTriGiam' | 'phanTramGiam'>) {
  const value = coupon.giaTriGiam > 0 ? coupon.giaTriGiam : coupon.phanTramGiam
  return coupon.loaiGiamGia === 'SO_TIEN' ? `${value.toLocaleString('vi-VN')} VND` : `${value}%`
}

export function calculateCouponDiscount(
  coupon: Pick<KhuyenMai, 'loaiGiamGia' | 'giaTriGiam' | 'phanTramGiam'>,
  subtotal: number
) {
  const safeSubtotal = Math.max(0, Math.round(subtotal))
  const value = coupon.giaTriGiam > 0 ? coupon.giaTriGiam : coupon.phanTramGiam
  const rawDiscount = coupon.loaiGiamGia === 'SO_TIEN'
    ? value
    : safeSubtotal * (value / 100)

  return Math.min(safeSubtotal, Math.max(0, Math.round(rawDiscount)))
}

export async function validateCouponForCheckout({
  code,
  userId,
  subtotal,
  db = prisma,
}: {
  code: unknown
  userId: string
  subtotal: number
  db?: CouponDb
}): Promise<CouponValidationResult> {
  const maKhuyenMai = normalizeCouponCode(code)
  if (!maKhuyenMai) {
    return { ok: false, error: 'Vui long nhap ma khuyen mai', status: 400 }
  }

  const coupon = await db.khuyenMai.findUnique({
    where: { maKhuyenMai },
  })

  if (!coupon) {
    return { ok: false, error: 'Ma khuyen mai khong ton tai', status: 404 }
  }

  if (!coupon.isActive) {
    return { ok: false, error: 'Ma khuyen mai dang bi tat', status: 400 }
  }

  const now = new Date()
  if (now < coupon.ngayBatDau) {
    return { ok: false, error: 'Ma khuyen mai chua den ngay su dung', status: 400 }
  }

  if (now > coupon.ngayKetThuc) {
    return { ok: false, error: 'Ma khuyen mai da het han', status: 400 }
  }

  const safeSubtotal = Math.max(0, Math.round(subtotal))
  if (coupon.minOrderValue !== null && coupon.minOrderValue !== undefined && safeSubtotal < coupon.minOrderValue) {
    return {
      ok: false,
      error: `Don hang can toi thieu ${coupon.minOrderValue.toLocaleString('vi-VN')} VND de dung ma nay`,
      status: 400,
    }
  }

  const [usageCount, userUsageCount] = await Promise.all([
    db.suDungKhuyenMai.count({ where: { khuyenMaiId: coupon.id } }),
    db.suDungKhuyenMai.count({ where: { khuyenMaiId: coupon.id, nguoiDungId: userId } }),
  ])
  const totalUsed = Math.max(coupon.soLuotDaDung, usageCount)

  if (coupon.gioiHanTong !== null && coupon.gioiHanTong !== undefined && totalUsed >= coupon.gioiHanTong) {
    return { ok: false, error: 'Ma khuyen mai da het luot su dung', status: 400 }
  }

  if (userUsageCount >= coupon.gioiHanMoiNguoi) {
    return { ok: false, error: 'Ban da dung qua so lan cho phep cua ma nay', status: 400 }
  }

  const discount = calculateCouponDiscount(coupon, safeSubtotal)
  if (discount <= 0) {
    return { ok: false, error: 'Ma khuyen mai khong tao ra gia tri giam hop le', status: 400 }
  }

  return {
    ok: true,
    coupon,
    discount,
    finalTotal: Math.max(0, safeSubtotal - discount),
    totalUsed,
    userUsed: userUsageCount,
  }
}

export async function recordCouponUsage({
  tx,
  coupon,
  userId,
  orderId,
  discount,
}: {
  tx: Prisma.TransactionClient
  coupon: KhuyenMai
  userId: string
  orderId: string
  discount: number
}) {
  if (coupon.gioiHanTong !== null && coupon.gioiHanTong !== undefined) {
    const updated = await tx.khuyenMai.updateMany({
      where: {
        id: coupon.id,
        soLuotDaDung: { lt: coupon.gioiHanTong },
      },
      data: {
        soLuotDaDung: { increment: 1 },
      },
    })

    if (updated.count !== 1) {
      throw new Error('COUPON_LIMIT_REACHED')
    }
  } else {
    await tx.khuyenMai.update({
      where: { id: coupon.id },
      data: { soLuotDaDung: { increment: 1 } },
    })
  }

  await tx.suDungKhuyenMai.create({
    data: {
      maKhuyenMai: coupon.maKhuyenMai,
      soTienGiam: discount,
      nguoiDungId: userId,
      khuyenMaiId: coupon.id,
      donHangId: orderId,
    },
  })

  await tx.userKhuyenMai.upsert({
    where: {
      nguoiDungId_khuyenMaiId: {
        nguoiDungId: userId,
        khuyenMaiId: coupon.id,
      },
    },
    create: {
      nguoiDungId: userId,
      khuyenMaiId: coupon.id,
      daSuDung: true,
      ngaySuDung: new Date(),
    },
    update: {
      daSuDung: true,
      ngaySuDung: new Date(),
    },
  })
}
