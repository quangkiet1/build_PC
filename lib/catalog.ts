import { prisma } from '@/lib/prisma'
import { readSpecNumber, readSpecString } from '@/lib/types'
import type { Product as BuilderProduct } from '@/app/types/builder'

export const BUILDER_CATEGORIES = [
  'cpu',
  'mainboard',
  'ram',
  'gpu',
  'storage',
  'psu',
  'case',
  'cooling'
] as const

export type BuilderCategory = (typeof BUILDER_CATEGORIES)[number]

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function normalizeCategoryName(categoryName?: string | null): BuilderCategory | null {
  const value = normalizeText(categoryName || '')

  if (value.includes('cpu')) return 'cpu'
  if (value.includes('mainboard') || value.includes('motherboard') || value.includes('bo mach')) {
    return 'mainboard'
  }
  if (value.includes('ram')) return 'ram'
  if (value.includes('gpu') || value.includes('card do hoa') || value.includes('vga')) return 'gpu'
  if (value.includes('storage') || value.includes('o cung') || value.includes('ssd') || value.includes('hdd')) {
    return 'storage'
  }
  if (value.includes('psu') || value.includes('nguon')) return 'psu'
  if (value.includes('case') || value.includes('vo may')) return 'case'
  if (value.includes('cool') || value.includes('tan nhiet') || value.includes('fan')) return 'cooling'

  return null
}

export function getProductBrand(productName: string) {
  return productName.split(' ').slice(0, 2).join(' ')
}

export function mapProductToBuilder(product: {
  id: string
  tenSanPham: string
  gia: number
  hinhAnh: string | null
  thongSoKyThuat: unknown
  danhMuc?: { tenDanhMuc: string } | null
}): BuilderProduct | null {
  const category = normalizeCategoryName(product.danhMuc?.tenDanhMuc)
  if (!category) return null

  const ramType =
    readSpecString(product.thongSoKyThuat as never, 'ram_type', 'type', 'memoryType', 'memory')?.toUpperCase()
  const supportedRamRaw = readSpecString(
    product.thongSoKyThuat as never,
    'supported_ram',
    'ram_type',
    'memory',
    'memoryType'
  )
  const supportedRam = supportedRamRaw
    ? supportedRamRaw
        .split('/')
        .flatMap((item) => item.split(','))
        .map((item) => item.trim().toUpperCase())
        .filter(Boolean)
    : undefined

  return {
    id: product.id,
    name: product.tenSanPham,
    brand: getProductBrand(product.tenSanPham),
    category,
    price: product.gia,
    image: product.hinhAnh || '/images/cpu-i7.svg',
    rating: 4.8,
    socket: readSpecString(product.thongSoKyThuat as never, 'socket'),
    supportedSocket: readSpecString(product.thongSoKyThuat as never, 'supported_socket', 'socket'),
    supportedRam,
    ramType: (ramType as 'DDR4' | 'DDR5' | undefined) || undefined,
    tdp: readSpecNumber(product.thongSoKyThuat as never, 'tdp', 'tgp', 'watt'),
    wattage: readSpecNumber(product.thongSoKyThuat as never, 'wattage', 'watt'),
    capacity: readSpecNumber(product.thongSoKyThuat as never, 'capacity'),
    capacity_storage: readSpecNumber(product.thongSoKyThuat as never, 'capacity'),
    type:
      (readSpecString(product.thongSoKyThuat as never, 'storage_type', 'type')?.toUpperCase() as
        | 'SSD'
        | 'HDD'
        | undefined) || undefined,
    vram: readSpecNumber(product.thongSoKyThuat as never, 'vram', 'memory'),
    cores: readSpecNumber(product.thongSoKyThuat as never, 'cores')
  }
}

export async function getStorefrontData() {
  const [categories, featuredProducts, latestProducts] = await Promise.all([
    prisma.danhMuc.findMany({
      include: {
        _count: {
          select: {
            sanPhams: true,
          },
        },
      },
      orderBy: { tenDanhMuc: 'asc' }
    }),
    prisma.sanPham.findMany({
      include: { danhMuc: true },
      orderBy: [{ soLuongTon: 'desc' }, { createdAt: 'desc' }],
      take: 8
    }),
    prisma.sanPham.findMany({
      include: { danhMuc: true },
      orderBy: { createdAt: 'desc' },
      take: 4
    })
  ])

  return { categories, featuredProducts, latestProducts }
}
