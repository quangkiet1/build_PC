import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const orders = await prisma.donHang.findMany({
    where: { nguoiDungId: user.id },
    include: {
      chiTietDonHangs: { include: { sanPham: true } },
      thanhToans: true
    },
    orderBy: { ngayTao: 'desc' }
  })

  return NextResponse.json({ orders })
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { shippingAddress, paymentMethod } = body

  const cart = await prisma.gioHang.findUnique({
    where: { nguoiDungId: user.id },
    include: { items: { include: { sanPham: true } } }
  })

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Giỏ hàng trống' }, { status: 400 })
  }

  const total = cart.items.reduce((sum, item) => sum + item.soLuong * item.sanPham.gia, 0)
  const order = await prisma.donHang.create({
    data: {
      maDonHang: `DH-${Date.now()}`,
      trangThai: 'CHO_XAC_NHAN',
      tongTien: total,
      diaChiGiaoHang: shippingAddress || user.diaChi || 'Chưa cập nhật',
      ghiChu: 'Đơn hàng từ website PC Builder',
      nguoiDungId: user.id,
      chiTietDonHangs: {
        create: cart.items.map((item) => ({
          soLuong: item.soLuong,
          giaBanLucMua: item.sanPham.gia,
          sanPhamId: item.sanPhamId
        }))
      },
      thanhToans: {
        create: {
          maThanhToan: `TT-${Date.now()}`,
          soTien: total,
          phuongThuc: paymentMethod || 'COD',
          trangThai: 'PENDING'
        }
      }
    }
  })

  await prisma.gioHangItem.deleteMany({ where: { gioHangId: cart.id } })

  return NextResponse.json({ order })
}
