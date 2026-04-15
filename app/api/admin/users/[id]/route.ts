import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

const VALID_ROLES = ['KHACH_HANG', 'QUAN_TRI_VIEN'] as const

type UserRole = typeof VALID_ROLES[number]

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json() as { vaiTro?: string; soDienThoai?: string; diaChi?: string }
    const updates: Record<string, string | null> = {}

    if (body.vaiTro !== undefined) {
      const role = String(body.vaiTro).trim() as UserRole
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ error: 'Vai trò không hợp lệ' }, { status: 400 })
      }

      updates.vaiTro = role
    }

    if (body.soDienThoai !== undefined) {
      updates.soDienThoai = String(body.soDienThoai).trim() || null
    }

    if (body.diaChi !== undefined) {
      updates.diaChi = String(body.diaChi).trim() || null
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Không có dữ liệu cập nhật' }, { status: 400 })
    }

    const user = await prisma.nguoiDung.update({
      where: { id },
      data: updates,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('PATCH /api/admin/users/[id]:', error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (auth.user.id === id) {
      return NextResponse.json({ error: 'Không thể xóa chính bạn' }, { status: 400 })
    }

    await prisma.nguoiDung.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/users/[id]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2003') {
      return NextResponse.json({ error: 'Không thể xóa người dùng đang có dữ liệu liên quan' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
