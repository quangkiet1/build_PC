import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'

const VALID_ROLES = ['KHACH_HANG', 'QUAN_TRI_VIEN'] as const

type UserRole = typeof VALID_ROLES[number]

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    console.log('DELETE user:', id)
    
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    if (auth.user.id === id) {
      return NextResponse.json({ error: 'Không thể xóa chính bạn' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.nguoiDung.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 })
    }

    // Delete related data one by one with error handling
    try {
      console.log('Deleting userKhuyenMai...')
      await prisma.userKhuyenMai.deleteMany({ where: { nguoiDungId: id } })
      console.log('✓ userKhuyenMai deleted')
    } catch (err) {
      console.error('Error deleting userKhuyenMai:', err)
      throw err
    }

    try {
      console.log('Deleting gioHang...')
      // First delete items in giohang
      await prisma.gioHangItem.deleteMany({
        where: { gioHang: { nguoiDungId: id } }
      })
      // Then delete the giohang itself
      await prisma.gioHang.deleteMany({ where: { nguoiDungId: id } })
      console.log('✓ gioHang deleted')
    } catch (err) {
      console.error('Error deleting gioHang:', err)
      throw err
    }

    try {
      console.log('Deleting tinNhanChat...')
      await prisma.tinNhanChat.deleteMany({ where: { nguoiDungId: id } })
      console.log('✓ tinNhanChat deleted')
    } catch (err) {
      console.error('Error deleting tinNhanChat:', err)
      throw err
    }

    try {
      console.log('Deleting cauHinhPC...')
      // First delete buildItems
      await prisma.buildItem.deleteMany({
        where: { cauHinhPC: { nguoiDungId: id } }
      })
      // Then delete cauHinhPC
      await prisma.cauHinhPC.deleteMany({ where: { nguoiDungId: id } })
      console.log('✓ cauHinhPC deleted')
    } catch (err) {
      console.error('Error deleting cauHinhPC:', err)
      throw err
    }

    try {
      console.log('Deleting donHang...')
      // First delete chiTietDonHang
      const donHangs = await prisma.donHang.findMany({
        where: { nguoiDungId: id },
        select: { id: true }
      })
      for (const dh of donHangs) {
        await prisma.chiTietDonHang.deleteMany({ where: { donHangId: dh.id } })
        await prisma.thanhToan.deleteMany({ where: { donHangId: dh.id } })
      }
      // Then delete donHang
      await prisma.donHang.deleteMany({ where: { nguoiDungId: id } })
      console.log('✓ donHang deleted')
    } catch (err) {
      console.error('Error deleting donHang:', err)
      throw err
    }

    // Now delete the user
    console.log('Deleting user...')
    await prisma.nguoiDung.delete({ where: { id } })
    console.log('✓ User deleted successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/users/[id] - Full error:', error)
    
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined
    
    console.error('Error details:', {
      message: errorMessage,
      code: errorCode,
      stack: error instanceof Error ? error.stack : undefined
    })

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'Người dùng không tồn tại' }, { status: 404 })
      }
      if (error.code === 'P2003') {
        return NextResponse.json({ error: 'Có dữ liệu liên quan không thể xóa' }, { status: 409 })
      }
    }

    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage
    }, { status: 500 })
  }
}
