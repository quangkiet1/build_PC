import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { mapProductToBuilder, normalizeCategoryName } from '@/lib/catalog'
import type { Product as BuilderProduct, Category } from '@/app/types/builder'

type ProductWithCategory = Prisma.SanPhamGetPayload<{ include: { danhMuc: true } }>

const buildCategoriesByPurpose: Record<string, Category[]> = {
  office: ['cpu', 'mainboard', 'ram', 'storage', 'psu', 'case'],
  gaming: ['cpu', 'mainboard', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooling'],
  graphics: ['cpu', 'mainboard', 'ram', 'gpu', 'storage', 'psu', 'case', 'cooling'],
  programming: ['cpu', 'mainboard', 'ram', 'storage', 'psu', 'case', 'cooling'],
}

const budgetRatio: Record<Category, number> = {
  cpu: 0.22,
  mainboard: 0.14,
  ram: 0.1,
  gpu: 0.32,
  storage: 0.1,
  psu: 0.08,
  case: 0.06,
  cooling: 0.05,
}

function getSpecs(product: ProductWithCategory) {
  if (!product.thongSoKyThuat || typeof product.thongSoKyThuat !== 'object' || Array.isArray(product.thongSoKyThuat)) {
    return {}
  }

  return product.thongSoKyThuat as Record<string, unknown>
}

function comparableValue(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim().toLowerCase()
  }

  return ''
}

function scoreSimilarProduct(base: ProductWithCategory, candidate: ProductWithCategory) {
  let score = 0
  if (candidate.danhMucId === base.danhMucId) score += 50
  if (base.thuongHieu && candidate.thuongHieu?.toLowerCase() === base.thuongHieu.toLowerCase()) score += 20

  const priceDiffRatio = Math.abs(candidate.gia - base.gia) / Math.max(base.gia, 1)
  if (priceDiffRatio <= 0.15) score += 15
  else if (priceDiffRatio <= 0.3) score += 8

  const baseSpecs = getSpecs(base)
  const candidateSpecs = getSpecs(candidate)
  for (const key of ['socket', 'ram_type', 'memory', 'chipset', 'wattage', 'tdp', 'vram']) {
    const baseValue = comparableValue(baseSpecs[key])
    const candidateValue = comparableValue(candidateSpecs[key])
    if (baseValue && candidateValue && baseValue === candidateValue) {
      score += 8
    }
  }

  return score
}

export async function getSimilarProducts(productId: string, limit = 4) {
  const product = await prisma.sanPham.findUnique({
    where: { id: productId },
    include: { danhMuc: true },
  })

  if (!product) return null

  const candidates = await prisma.sanPham.findMany({
    where: {
      id: { not: product.id },
      OR: [
        { danhMucId: product.danhMucId },
        ...(product.thuongHieu ? [{ thuongHieu: { equals: product.thuongHieu, mode: 'insensitive' as const } }] : []),
      ],
    },
    include: { danhMuc: true },
    take: 40,
  })

  const recommendations = candidates
    .map((item) => ({ item, score: scoreSimilarProduct(product, item) }))
    .sort((a, b) => b.score - a.score || Math.abs(a.item.gia - product.gia) - Math.abs(b.item.gia - product.gia))
    .slice(0, limit)
    .map(({ item, score }) => ({
      ...item,
      recommendationScore: score,
    }))

  return { product, recommendations }
}

function compatibleWithBuild(candidate: BuilderProduct, selected: Partial<Record<Category, BuilderProduct>>) {
  if (candidate.category === 'mainboard') {
    if (selected.cpu?.socket && candidate.supportedSocket && candidate.supportedSocket !== selected.cpu.socket) return false
    if (selected.ram?.ramType && candidate.supportedRam && !candidate.supportedRam.includes(selected.ram.ramType)) return false
  }

  if (candidate.category === 'cpu' && selected.mainboard?.supportedSocket && candidate.socket) {
    return selected.mainboard.supportedSocket === candidate.socket
  }

  if (candidate.category === 'ram' && selected.mainboard?.supportedRam && candidate.ramType) {
    return selected.mainboard.supportedRam.includes(candidate.ramType)
  }

  if (candidate.category === 'psu') {
    const totalTdp = (selected.cpu?.tdp || 0) + (selected.gpu?.tdp || 0)
    const needed = totalTdp + 150
    if (candidate.wattage && candidate.wattage < needed) return false
  }

  return true
}

function scoreBuildCandidate(candidate: BuilderProduct, targetPrice: number, purpose: string) {
  let score = 100 - Math.abs(candidate.price - targetPrice) / Math.max(targetPrice, 1) * 40
  const text = `${candidate.name} ${candidate.brand}`.toLowerCase()

  if (purpose === 'gaming' && candidate.category === 'gpu') score += 20
  if (purpose === 'graphics' && ['gpu', 'ram', 'storage'].includes(candidate.category)) score += 12
  if (purpose === 'programming' && ['cpu', 'ram', 'storage'].includes(candidate.category)) score += 10
  if (purpose === 'office' && text.includes('intel')) score += 4

  return score
}

export async function recommendBuild({
  purpose = 'gaming',
  budget = 20000000,
  selectedProductIds = [],
}: {
  purpose?: string
  budget?: number
  selectedProductIds?: string[]
}) {
  const safePurpose = buildCategoriesByPurpose[purpose] ? purpose : 'gaming'
  const safeBudget = Math.max(3000000, Math.round(Number(budget) || 20000000))

  const dbProducts = await prisma.sanPham.findMany({
    include: { danhMuc: true },
    orderBy: { gia: 'asc' },
  })

  const products = dbProducts
    .map(mapProductToBuilder)
    .filter((item): item is BuilderProduct => item !== null)

  const selected: Partial<Record<Category, BuilderProduct>> = {}
  for (const product of products) {
    if (selectedProductIds.includes(product.id)) {
      selected[product.category] = product
    }
  }

  const result: Partial<Record<Category, BuilderProduct>> = { ...selected }
  const categories = buildCategoriesByPurpose[safePurpose]

  for (const category of categories) {
    if (result[category]) continue

    const allocation = safeBudget * budgetRatio[category]
    const categoryProducts = products
      .filter((product) => product.category === category)
      .filter((product) => compatibleWithBuild(product, result))
      .sort((a, b) => {
        const aInBudget = a.price <= allocation * 1.35 ? 1 : 0
        const bInBudget = b.price <= allocation * 1.35 ? 1 : 0
        return (
          bInBudget - aInBudget ||
          scoreBuildCandidate(b, allocation, safePurpose) - scoreBuildCandidate(a, allocation, safePurpose)
        )
      })

    const picked = categoryProducts[0]
    if (picked) {
      result[category] = picked
    }
  }

  const items = categories
    .map((category) => result[category])
    .filter((item): item is BuilderProduct => Boolean(item))
  const total = items.reduce((sum, item) => sum + item.price, 0)

  return {
    purpose: safePurpose,
    budget: safeBudget,
    total,
    overBudget: total > safeBudget,
    items,
    missingCategories: categories.filter((category) => !result[category]),
  }
}

export function productCategoryKey(product: Pick<ProductWithCategory, 'danhMuc'>) {
  return normalizeCategoryName(product.danhMuc?.tenDanhMuc)
}
