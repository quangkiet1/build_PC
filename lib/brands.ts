export type BrandSummary = {
  name: string
  productCount: number
  aliases: string[]
}

export type BrandSource = {
  thuongHieu?: string | null
}

export function normalizeBrandName(value: unknown) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\s+/g, ' ')
}

export function getBrandKey(value: unknown) {
  return normalizeBrandName(value).toLowerCase()
}

export function aggregateProductBrands(products: BrandSource[]) {
  const grouped = new Map<string, BrandSummary>()

  for (const product of products) {
    const name = normalizeBrandName(product.thuongHieu)
    if (!name) continue

    const key = getBrandKey(name)
    const current = grouped.get(key)

    if (current) {
      current.productCount += 1
      if (!current.aliases.includes(name)) {
        current.aliases.push(name)
      }
      continue
    }

    grouped.set(key, {
      name,
      productCount: 1,
      aliases: [name],
    })
  }

  return Array.from(grouped.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}
