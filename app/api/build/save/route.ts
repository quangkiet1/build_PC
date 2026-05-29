import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

type SaveBuildItemInput = {
  sanPhamId: string
  soLuong?: number
}

type SaveBuildRequestBody = {
  buildId?: string
  name?: string
  isCompleted?: boolean
  isPublic?: boolean
  buildItems?: unknown
}

function isBuildItemInput(value: unknown): value is SaveBuildItemInput {
  if (!value || typeof value !== 'object') return false
  const item = value as Record<string, unknown>
  return typeof item.sanPhamId === 'string' && item.sanPhamId.trim().length > 0
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Cần đăng nhập để lưu cấu hình' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as SaveBuildRequestBody
    const { buildId, name, isCompleted = true, isPublic = false } = body
    const buildItems = Array.isArray(body.buildItems)
      ? body.buildItems.filter(isBuildItemInput)
      : []

    if (typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Tên cấu hình không được để trống' }, { status: 400 })
    }

    if (buildId) {
      // Kiểm tra build tồn tại và thuộc user
      const build = await prisma.cauHinhPC.findFirst({
        where: {
          id: buildId,
          nguoiDungId: user.id
        }
      })

      if (!build) {
        return NextResponse.json(
          { error: 'Cấu hình không tồn tại hoặc không phải của bạn' },
          { status: 404 }
        )
      }

      // Update build với tên và flags
      const updatedBuild = await prisma.cauHinhPC.update({
        where: { id: buildId },
        data: {
          tenCauHinh: name.trim(),
          isCompleted,
          isPublic
        },
        include: {
          items: {
            include: { sanPham: { select: { id: true, tenSanPham: true, gia: true, hinhAnh: true } } }
          }
        }
      })

      return NextResponse.json({ success: true, build: updatedBuild })
    } else {
      // Lưu cấu hình mới
      if (buildItems.length === 0) {
        return NextResponse.json({ error: 'Cấu hình trống, không có linh kiện' }, { status: 400 })
      }

      // Lấy giá sản phẩm từ DB để bảo mật, tránh việc Client gửi sai giá
      const productIds = buildItems.map((item) => item.sanPhamId)
      const products = await prisma.sanPham.findMany({
        where: { id: { in: productIds } }
      })

      let tongGia = 0
      const itemsToCreate = buildItems.map((item) => {
        const product = products.find(p => p.id === item.sanPhamId)
        const quantity = Number.isInteger(item.soLuong) && item.soLuong && item.soLuong > 0 ? item.soLuong : 1
        if (product) {
          tongGia += product.gia * quantity
        }
        return {
          sanPhamId: item.sanPhamId,
          soLuong: quantity
        }
      })

      const newBuild = await prisma.cauHinhPC.create({
        data: {
          tenCauHinh: name.trim(),
          tongGia,
          isCompleted,
          isPublic,
          nguoiDungId: user.id,
          items: {
            create: itemsToCreate
          }
        },
        include: {
          items: {
            include: { sanPham: { select: { id: true, tenSanPham: true, gia: true, hinhAnh: true } } }
          }
        }
      })

      return NextResponse.json({ success: true, build: newBuild })
    }
  } catch (error) {
    console.error('Save build error:', error)
    return NextResponse.json({ error: 'Lỗi khi lưu cấu hình' }, { status: 500 })
  }
}
