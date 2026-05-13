import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'
import { buildTotal, checkBuildCompatibility, loadProductsByIds } from '@/lib/build'

type BuilderRequestItem = {
  productId: string
  quantity?: number
}

type BuilderRequestBody = {
  items?: BuilderRequestItem[]
  saveBuild?: boolean
  name?: string
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  const body = (await request.json()) as BuilderRequestBody
  const items = body.items || []

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Danh sach linh kien khong hop le' }, { status: 400 })
  }

  const ids = items.map((item) => item.productId)
  const products = await loadProductsByIds(ids)
  const mergedItems = []

  for (const item of items) {
    const product = products.find((value) => value.id === item.productId)
    if (!product) {
      return NextResponse.json({ error: `San pham khong ton tai: ${item.productId}` }, { status: 400 })
    }

    mergedItems.push({
      ...product,
      price: product.gia,
      quantity: Number(item.quantity || 1)
    })
  }

  const compatibility = checkBuildCompatibility(products)
  if (!compatibility.valid) {
    return NextResponse.json(
      {
        error: 'Cau hinh khong tuong thich',
        compatibility,
        items: mergedItems
      },
      { status: 400 }
    )
  }

  const totalPrice = buildTotal(mergedItems)

  if (body.saveBuild) {
    if (!user) {
      return NextResponse.json({ error: 'Can dang nhap de luu cau hinh' }, { status: 401 })
    }

    const build = await prisma.cauHinhPC.create({
      data: {
        tenCauHinh: body.name || `Build ${new Date().toISOString()}`,
        tongGia: totalPrice,
        nguoiDungId: user.id,
        items: {
          create: mergedItems.map((item) => ({
            sanPhamId: item.id,
            soLuong: item.quantity
          }))
        }
      },
      include: {
        items: {
          include: { sanPham: true }
        }
      }
    })

    return NextResponse.json({ success: true, compatibility, totalPrice, build })
  }

  return NextResponse.json({ success: true, compatibility, totalPrice, items: mergedItems })
}
