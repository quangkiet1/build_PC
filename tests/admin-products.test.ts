import { describe, expect, it } from 'vitest'
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
        danhMucId: 'cat-1'
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
})