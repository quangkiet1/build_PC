import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request)

    if (!user) {
      return NextResponse.json({ error: 'Cần đăng nhập' }, { status: 401 })
    }

    // Get query params
    const searchParams = request.nextUrl.searchParams
    const isCompleted = searchParams.get('isCompleted')
    const isPublic = searchParams.get('isPublic')

    // Build filter
    type BuildWhere = {
      nguoiDungId: string
      isCompleted?: boolean
      isPublic?: boolean
    }

    const where: BuildWhere = {
      nguoiDungId: user.id
    }

    if (isCompleted !== null) {
      where.isCompleted = isCompleted === 'true'
    }

    if (isPublic !== null) {
      where.isPublic = isPublic === 'true'
    }

    const builds = await prisma.cauHinhPC.findMany({
      where,
      orderBy: {
        ngayTao: 'desc'
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

    // Transform to include item count and formatted dates
    const formattedBuilds = builds.map((build) => ({
      id: build.id,
      tenCauHinh: build.tenCauHinh,
      tongGia: build.tongGia,
      ngayTao: build.ngayTao,
      isCompleted: build.isCompleted,
      isPublic: build.isPublic,
      itemCount: build.items.length,
      items: build.items
    }))

    return NextResponse.json({ success: true, builds: formattedBuilds })
  } catch (error) {
    console.error('Get my builds error:', error)
    return NextResponse.json({ error: 'Lỗi khi lấy danh sách cấu hình' }, { status: 500 })
  }
}
