import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { createOrderCode, validateOrderInput } from '@/lib/orders'

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
  const validated = validateOrderInput({
    shippingAddress: String(body.shippingAddress || ''),
    paymentMethod: String(body.paymentMethod || 'COD')
  })

  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
  }

  const cart = await prisma.gioHang.findUnique({
    where: { nguoiDungId: auth.user.id },
    include: { items: { include: { sanPham: true } } }
  })

  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: 'Gio hang trong' }, { status: 400 })
  }

  const invalidItem = cart.items.find(
    (item) => !Number.isInteger(item.soLuong) || item.soLuong < 1 || item.soLuong > item.sanPham.soLuongTon
  )

  if (invalidItem) {
    return NextResponse.json(
      { error: `So luong khong hop le hoac vuot ton kho cho san pham ${invalidItem.sanPham.tenSanPham}` },
      { status: 400 }
    )
  }

  const total = cart.items.reduce((sum, item) => sum + item.soLuong * item.sanPham.gia, 0)
  try {
    const order = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const updated = await tx.sanPham.updateMany({
          where: {
            id: item.sanPhamId,
            soLuongTon: { gte: item.soLuong }
          },
          data: {
            soLuongTon: { decrement: item.soLuong }
          }
        })

        if (updated.count !== 1) {
          throw new Error(`OUT_OF_STOCK:${item.sanPham.tenSanPham}`)
        }
      }

      const createdOrder = await tx.donHang.create({
        data: {
          maDonHang: createOrderCode('DH'),
          trangThai: 'CHO_XAC_NHAN',
          tongTien: total,
          diaChiGiaoHang: validated.data.shippingAddress,
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
              maThanhToan: createOrderCode('TT'),
              soTien: total,
              phuongThuc: validated.data.paymentMethod,
              trangThai: 'PENDING'
            }
          }
        },
        include: {
          chiTietDonHangs: true,
          thanhToans: true
        }
      })

      await tx.gioHangItem.deleteMany({ where: { gioHangId: cart.id } })

      return createdOrder
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('OUT_OF_STOCK:')) {
      return NextResponse.json(
        { error: `So luong ton kho cua san pham ${error.message.slice('OUT_OF_STOCK:'.length)} khong du` },
        { status: 409 }
      )
    }

    throw error
  }
}
