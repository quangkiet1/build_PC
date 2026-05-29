import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { getBrandKey, normalizeBrandName } from '@/lib/brands'

function normalizedBrandSql(name: string) {
  return Prisma.sql`
    lower(regexp_replace(btrim("thuongHieu"), '[[:space:]]+', ' ', 'g')) = ${getBrandKey(name)}
  `
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { name: rawName } = await context.params
    const oldName = normalizeBrandName(decodeURIComponent(rawName))
    const body = (await request.json()) as { name?: string }
    const newName = normalizeBrandName(body.name)

    if (!oldName || !newName) {
      return NextResponse.json({ error: 'Ten thuong hieu la bat buoc' }, { status: 400 })
    }

    const oldKey = getBrandKey(oldName)
    const newKey = getBrandKey(newName)

    if (oldKey !== newKey) {
      const duplicate = await prisma.thuongHieu.findFirst({
        where: { tenThuongHieu: { equals: newName, mode: 'insensitive' } },
        select: { id: true },
      })

      if (duplicate) {
        return NextResponse.json({ error: 'Thuong hieu moi da ton tai' }, { status: 409 })
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const currentBrand = await tx.thuongHieu.findFirst({
        where: { tenThuongHieu: { equals: oldName, mode: 'insensitive' } },
        select: { id: true },
      })

      if (currentBrand) {
        await tx.thuongHieu.update({
          where: { id: currentBrand.id },
          data: { tenThuongHieu: newName },
        })
      } else {
        await tx.thuongHieu.create({
          data: { tenThuongHieu: newName },
        })
      }

      const updatedProducts = await tx.$executeRaw`
        UPDATE "san_pham"
        SET "thuongHieu" = ${newName}
        WHERE "thuongHieu" IS NOT NULL
          AND ${normalizedBrandSql(oldName)}
      `

      return { updatedProducts }
    })

    return NextResponse.json({ success: true, brand: { name: newName }, ...result })
  } catch (error) {
    console.error('PUT /api/admin/brands/[name]:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Thuong hieu da ton tai' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { name: rawName } = await context.params
    const name = normalizeBrandName(decodeURIComponent(rawName))

    if (!name) {
      return NextResponse.json({ error: 'Ten thuong hieu la bat buoc' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedProducts = await tx.$executeRaw`
        UPDATE "san_pham"
        SET "thuongHieu" = NULL
        WHERE "thuongHieu" IS NOT NULL
          AND ${normalizedBrandSql(name)}
      `

      const deletedBrands = await tx.thuongHieu.deleteMany({
        where: { tenThuongHieu: { equals: name, mode: 'insensitive' } },
      })

      return { updatedProducts, deletedBrands: deletedBrands.count }
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error('DELETE /api/admin/brands/[name]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
