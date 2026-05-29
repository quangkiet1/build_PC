import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { authorizeRoles } from '@/lib/auth'
import { aggregateProductBrands, getBrandKey, normalizeBrandName } from '@/lib/brands'

async function loadBrandSummaries() {
  const [registeredBrands, products] = await Promise.all([
    prisma.thuongHieu.findMany({ orderBy: { tenThuongHieu: 'asc' } }),
    prisma.sanPham.findMany({ select: { thuongHieu: true } }),
  ])

  const productBrands = new Map(
    aggregateProductBrands(products).map((brand) => [getBrandKey(brand.name), brand])
  )

  const summaries = new Map<
    string,
    { id: string | null; name: string; productCount: number; aliases: string[] }
  >()

  for (const brand of registeredBrands) {
    const name = normalizeBrandName(brand.tenThuongHieu)
    if (!name) continue

    const key = getBrandKey(name)
    const productBrand = productBrands.get(key)
    summaries.set(key, {
      id: brand.id,
      name,
      productCount: productBrand?.productCount ?? 0,
      aliases: productBrand?.aliases ?? [name],
    })
  }

  for (const brand of productBrands.values()) {
    const key = getBrandKey(brand.name)
    if (summaries.has(key)) continue

    summaries.set(key, {
      id: null,
      name: brand.name,
      productCount: brand.productCount,
      aliases: brand.aliases,
    })
  }

  return Array.from(summaries.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const brands = await loadBrandSummaries()
    return NextResponse.json({ brands })
  } catch (error) {
    console.error('GET /api/admin/brands:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authorizeRoles(request, ['QUAN_TRI_VIEN'])
    if (!auth.user) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = (await request.json()) as { name?: string }
    const name = normalizeBrandName(body.name)

    if (!name) {
      return NextResponse.json({ error: 'Ten thuong hieu la bat buoc' }, { status: 400 })
    }

    const existing = await prisma.thuongHieu.findFirst({
      where: { tenThuongHieu: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    })

    if (existing) {
      return NextResponse.json({ error: 'Thuong hieu da ton tai' }, { status: 409 })
    }

    await prisma.thuongHieu.create({
      data: { tenThuongHieu: name },
    })

    const brands = await loadBrandSummaries()
    const brand = brands.find((item) => getBrandKey(item.name) === getBrandKey(name))
    return NextResponse.json({ brand }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/brands:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Thuong hieu da ton tai' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
