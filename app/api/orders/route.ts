import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

const ALLOWED_PAYMENT_METHODS = ['COD', 'VNPAY', 'MOMO'] as const

export async function GET(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const orders = await prisma.donHang.findMany({
    where: { nguoiDungId: auth.user.id },
    include: {
      chiTietDonHangs: { include: { sanPham: true } },
      thanhToans: true
    },
    orderBy: { ngayTao: 'desc' }
  })

  return NextResponse.json({ orders })
}

export async function POST(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const shippingAddress = String(body.shippingAddress || '').trim()
  const paymentMethod = String(body.paymentMethod || 'COD').trim().toUpperCase()

  if (shippingAddress.length < 10) {
    return NextResponse.json({ error: 'Dia chi giao hang khong hop le' }, { status: 400 })
  }

  if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod as (typeof ALLOWED_PAYMENT_METHODS)[number])) {
    return NextResponse.json({ error: 'Phuong thuc thanh toan khong hop le' }, { status: 400 })
  }

  const cart = await prisma.gioHang.findUnique({
    where: { nguoiDungId: auth.user.id },
    include: { items: { include: { sanPham: true } } }
  })

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Gio hang trong' }, { status: 400 })
  }

  const now = Date.now()
  const rand = Math.floor(Math.random() * 100000)
  const total = cart.items.reduce((sum, item) => sum + item.soLuong * item.sanPham.gia, 0)
  const order = await prisma.donHang.create({
    data: {
      maDonHang: `DH-${now}-${rand}`,
      trangThai: 'CHO_XAC_NHAN',
      tongTien: total,
      diaChiGiaoHang: shippingAddress,
      ghiChu: 'Don hang tu website PC Builder',
      nguoiDungId: auth.user.id,
      chiTietDonHangs: {
        create: cart.items.map((item) => ({
          soLuong: item.soLuong,
          giaBanLucMua: item.sanPham.gia,
          sanPhamId: item.sanPhamId
        }))
      },
      thanhToans: {
        create: {
          maThanhToan: `TT-${now}-${rand}`,
          soTien: total,
          phuongThuc: paymentMethod,
          trangThai: 'PENDING'
        }
      }
    },
    include: {
      chiTietDonHangs: true,
      thanhToans: true
    }
  })

  await prisma.gioHangItem.deleteMany({ where: { gioHangId: cart.id } })

  return NextResponse.json({ order }, { status: 201 })
}
