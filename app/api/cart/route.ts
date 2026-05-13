import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { parseCartQuantity, validateDesiredQuantity } from '@/lib/cart'

async function getUserCart(userId: string) {
  return prisma.gioHang.upsert({
    where: { nguoiDungId: userId },
    create: { nguoiDungId: userId },
    update: {}
  })
}

export async function GET(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const cart = await prisma.gioHang.findUnique({
    where: { nguoiDungId: auth.user.id },
    include: {
      items: {
        include: { sanPham: { include: { danhMuc: true } } }
      }
    }
  })

  return NextResponse.json({ cart })
}

export async function POST(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const productId = body.productId as string | undefined
  const count = parseCartQuantity(body.quantity ?? 1)

  if (!productId) {
    return NextResponse.json({ error: 'ProductId is required' }, { status: 400 })
  }

  if (!count) {
    return NextResponse.json({ error: 'Quantity is invalid' }, { status: 400 })
  }

  const product = await prisma.sanPham.findUnique({ where: { id: productId } })
  if (!product) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  const cart = await getUserCart(auth.user.id)
  const existing = await prisma.gioHangItem.findUnique({
    where: {
      gioHangId_sanPhamId: {
        gioHangId: cart.id,
        sanPhamId: productId
      }
    }
  })

  const desiredQuantity = (existing?.soLuong ?? 0) + count
  const stockCheck = validateDesiredQuantity(product.soLuongTon, desiredQuantity)
  if (!stockCheck.ok) {
    return NextResponse.json({ error: stockCheck.error }, { status: 400 })
  }

  if (existing) {
    await prisma.gioHangItem.update({
      where: { id: existing.id },
      data: { soLuong: desiredQuantity }
    })
  } else {
    await prisma.gioHangItem.create({
      data: {
        gioHangId: cart.id,
        sanPhamId: productId,
        soLuong: count
      }
    })
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const itemId = body.itemId as string | undefined
  const count = parseCartQuantity(body.quantity)

  if (!itemId) {
    return NextResponse.json({ error: 'ItemId is required' }, { status: 400 })
  }

  if (!count) {
    return NextResponse.json({ error: 'Quantity is invalid' }, { status: 400 })
  }

  const cart = await getUserCart(auth.user.id)
  const existing = await prisma.gioHangItem.findFirst({
    where: { id: itemId, gioHangId: cart.id },
    include: { sanPham: true }
  })

  if (!existing) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
  }

  const stockCheck = validateDesiredQuantity(existing.sanPham.soLuongTon, count)
  if (!stockCheck.ok) {
    return NextResponse.json({ error: stockCheck.error }, { status: 400 })
  }

  await prisma.gioHangItem.update({
    where: { id: existing.id },
    data: { soLuong: count }
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const auth = await authorizeRoles(request, ['KHACH_HANG', 'QUAN_TRI_VIEN'])
  if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const itemId = body.itemId as string | undefined

  if (!itemId) {
    return NextResponse.json({ error: 'ItemId is required' }, { status: 400 })
  }

  const cart = await getUserCart(auth.user.id)
  const existing = await prisma.gioHangItem.findFirst({
    where: { id: itemId, gioHangId: cart.id }
  })

  if (!existing) {
    return NextResponse.json({ error: 'Cart item not found' }, { status: 404 })
  }

  await prisma.gioHangItem.delete({ where: { id: existing.id } })
  return NextResponse.json({ success: true })
}
