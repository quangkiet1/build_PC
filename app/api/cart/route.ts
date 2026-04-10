import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cart = await prisma.gioHang.findUnique({
    where: { nguoiDungId: user.id },
    include: {
      items: {
        include: { sanPham: { include: { danhMuc: true } } }
      }
    }
  })

  return NextResponse.json({ cart })
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { productId, quantity } = body
  const count = Number(quantity || 1)

  if (!productId) {
    return NextResponse.json({ error: 'ProductId is required' }, { status: 400 })
  }

  const cart = await prisma.gioHang.upsert({
    where: { nguoiDungId: user.id },
    create: { nguoiDungId: user.id },
    update: {}
  })

  const existing = await prisma.gioHangItem.findUnique({
    where: {
      gioHangId_sanPhamId: {
        gioHangId: cart.id,
        sanPhamId: productId
      }
    }
  })

  if (existing) {
    await prisma.gioHangItem.update({
      where: { id: existing.id },
      data: { soLuong: existing.soLuong + count }
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
  const user = await authenticateRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { itemId, quantity } = body
  const count = Number(quantity || 1)

  if (!itemId) {
    return NextResponse.json({ error: 'ItemId is required' }, { status: 400 })
  }

  await prisma.gioHangItem.update({
    where: { id: itemId },
    data: { soLuong: count }
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { itemId } = body

  if (!itemId) {
    return NextResponse.json({ error: 'ItemId is required' }, { status: 400 })
  }

  await prisma.gioHangItem.delete({ where: { id: itemId } })
  return NextResponse.json({ success: true })
}
