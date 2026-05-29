import { describe, expect, it } from 'vitest'
import { aggregateProductBrands, normalizeBrandName } from '../lib/brands'
import { generateUniqueProductSlug, slugifyProductName, validateAdminProductPayload } from '../lib/products'

describe('admin product helpers', () => {
  it('slugifies Vietnamese names consistently', () => {
    expect(slugifyProductName('Ổ Cứng SSD NVMe 1TB')).toBe('o-cung-ssd-nvme-1tb')
  })

  it('validates admin product payload', () => {
    expect(
      validateAdminProductPayload({
        tenSanPham: 'RTX 5070',
        gia: 100,
        soLuongTon: 3,
        danhMucId: 'cat-1',
        thuongHieu: '  ASUS  '
      }).ok
    ).toBe(true)

    expect(
      validateAdminProductPayload({
        tenSanPham: '',
        gia: -1,
        soLuongTon: -2,
        danhMucId: ''
      }).ok
    ).toBe(false)
  })

  it('generates unique slugs by suffixing duplicates', async () => {
    const taken = new Set(['rtx-5070', 'rtx-5070-1'])
    const slug = await generateUniqueProductSlug('RTX 5070', async (candidate) => taken.has(candidate))

    expect(slug).toBe('rtx-5070-2')
  })

  it('normalizes and aggregates brand names', () => {
    expect(normalizeBrandName('  ASUS   ROG  ')).toBe('ASUS ROG')

    expect(
      aggregateProductBrands([
        { thuongHieu: 'ASUS' },
        { thuongHieu: ' asus ' },
        { thuongHieu: 'MSI' },
        { thuongHieu: null },
      ])
    ).toEqual([
      { name: 'ASUS', productCount: 2, aliases: ['ASUS', 'asus'] },
      { name: 'MSI', productCount: 1, aliases: ['MSI'] },
    ])
  })
})
