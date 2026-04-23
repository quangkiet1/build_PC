import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Cần đăng nhập để lưu cấu hình' }, { status: 401 })
    }

    const body = await request.json()
    const { buildId, name, isCompleted = true, isPublic = false } = body

    if (!buildId) {
      return NextResponse.json({ error: 'buildId không hợp lệ' }, { status: 400 })
    }

    if (!name || name.trim() === '') {
      return NextResponse.json({ error: 'Tên cấu hình không được để trống' }, { status: 400 })
    }

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
          include: {
            sanPham: {
              select: {
                id: true,
                tenSanPham: true,
                gia: true,
                hinhAnh: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, build: updatedBuild })
  } catch (error) {
    console.error('Save build error:', error)
    return NextResponse.json({ error: 'Lỗi khi lưu cấu hình' }, { status: 500 })
  }
}
