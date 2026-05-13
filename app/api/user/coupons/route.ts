import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { calculateCouponDiscount } from '@/lib/coupons'

export async function GET(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const now = new Date()
  const [assigned, available, usage] = await Promise.all([
    prisma.userKhuyenMai.findMany({
      where: { nguoiDungId: auth.user.id },
      include: { khuyenMai: true },
      orderBy: { ngayCap: 'desc' },
    }),
    prisma.khuyenMai.findMany({
      where: {
        isActive: true,
        ngayBatDau: { lte: now },
        ngayKetThuc: { gte: now },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.suDungKhuyenMai.groupBy({
      by: ['khuyenMaiId'],
      where: { nguoiDungId: auth.user.id },
      _count: { khuyenMaiId: true },
    }),
  ])

  const usageByCoupon = new Map(usage.map((item) => [item.khuyenMaiId, item._count.khuyenMaiId]))
  const personalIds = new Set(assigned.map((item) => item.khuyenMaiId))

  const personalCoupons = assigned.map((item) => ({
    id: item.khuyenMai.id,
    maKhuyenMai: item.khuyenMai.maKhuyenMai,
    tenKhuyenMai: item.khuyenMai.tenKhuyenMai,
    loaiGiamGia: item.khuyenMai.loaiGiamGia,
    giaTriGiam: item.khuyenMai.giaTriGiam,
    phanTramGiam: item.khuyenMai.phanTramGiam,
    minOrderValue: item.khuyenMai.minOrderValue,
    ngayBatDau: item.khuyenMai.ngayBatDau,
    ngayKetThuc: item.khuyenMai.ngayKetThuc,
    isActive: item.khuyenMai.isActive,
    daSuDung: item.daSuDung,
    soLanDaDung: usageByCoupon.get(item.khuyenMaiId) || 0,
    soLanConLai: Math.max(0, item.khuyenMai.gioiHanMoiNguoi - (usageByCoupon.get(item.khuyenMaiId) || 0)),
    sampleDiscount: calculateCouponDiscount(item.khuyenMai, item.khuyenMai.minOrderValue || 1000000),
  }))

  const availableCoupons = available
    .filter((coupon) => !personalIds.has(coupon.id))
    .map((coupon) => ({
      id: coupon.id,
      maKhuyenMai: coupon.maKhuyenMai,
      tenKhuyenMai: coupon.tenKhuyenMai,
      loaiGiamGia: coupon.loaiGiamGia,
      giaTriGiam: coupon.giaTriGiam,
      phanTramGiam: coupon.phanTramGiam,
      minOrderValue: coupon.minOrderValue,
      ngayBatDau: coupon.ngayBatDau,
      ngayKetThuc: coupon.ngayKetThuc,
      isActive: coupon.isActive,
      soLanDaDung: usageByCoupon.get(coupon.id) || 0,
      soLanConLai: Math.max(0, coupon.gioiHanMoiNguoi - (usageByCoupon.get(coupon.id) || 0)),
      sampleDiscount: calculateCouponDiscount(coupon, coupon.minOrderValue || 1000000),
    }))

  return NextResponse.json({
    personalCoupons,
    availableCoupons,
  })
}
