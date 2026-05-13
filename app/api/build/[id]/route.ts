import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID cấu hình không hợp lệ' }, { status: 400 })
    }

    // Kiểm tra build tồn tại và thuộc user
    const build = await prisma.cauHinhPC.findFirst({
      where: {
        id,
        nguoiDungId: user.id
      }
    })

    if (!build) {
      return NextResponse.json(
        { error: 'Cấu hình không tồn tại hoặc không phải của bạn' },
        { status: 404 }
      )
    }

    // Delete build (cascade delete sẽ xóa build items tự động)
    await prisma.cauHinhPC.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Đã xóa cấu hình' })
  } catch (error) {
    console.error('Delete build error:', error)
    return NextResponse.json({ error: 'Lỗi khi xóa cấu hình' }, { status: 500 })
  }
}

// GET /api/build/[id] - Lấy chi tiết một build
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 })
    }

    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'ID cấu hình không hợp lệ' }, { status: 400 })
    }

    const build = await prisma.cauHinhPC.findFirst({
      where: {
        id,
        // Chỉ user đó hoặc build là public mới xem được
        OR: [
          { nguoiDungId: user.id },
          { isPublic: true }
        ]
      },
      include: {
        items: {
          include: {
            sanPham: true
          }
        }
      }
    })

    if (!build) {
      return NextResponse.json(
        { error: 'Cấu hình không tồn tại' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, build })
  } catch (error) {
    console.error('Get build error:', error)
    return NextResponse.json({ error: 'Lỗi khi lấy cấu hình' }, { status: 500 })
  }
}
