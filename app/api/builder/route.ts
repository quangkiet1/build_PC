import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'
import { buildTotal, checkBuildCompatibility, loadProductsByIds } from '@/lib/build'

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  const body = await request.json()
  const { items, saveBuild, name } = body

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'Danh sách linh kiện không hợp lệ' }, { status: 400 })
  }

  const ids = items.map((item: any) => item.productId)
  const products = await loadProductsByIds(ids)

  const mergedItems = []
  for (const item of items) {
    const product = products.find((product) => product.id === item.productId)
    if (!product) {
      return NextResponse.json(
        { error: `Sản phẩm không tìm thấy: ${item.productId}` },
        { status: 400 }
      )
    }
    mergedItems.push({
      ...product,
      price: product.gia,
      quantity: Number(item.quantity || 1)
    })
  }

  const compatibility = checkBuildCompatibility(products)
  const totalPrice = buildTotal(mergedItems)

  if (saveBuild) {
    if (!user) {
      return NextResponse.json({ error: 'Cần đăng nhập để lưu cấu hình' }, { status: 401 })
    }

    const build = await prisma.cauHinhPC.create({
      data: {
        tenCauHinh: name || `Build - ${new Date().toISOString()}`,
        tongGia: totalPrice,
        nguoiDungId: user.id,
        items: {
          create: mergedItems.map((item) => ({
            sanPhamId: item.id,
            soLuong: item.quantity
          }))
        }
      }
    })

    return NextResponse.json({ success: true, compatibility, totalPrice, build })
  }

  return NextResponse.json({ success: true, compatibility, totalPrice, items: mergedItems })
}
