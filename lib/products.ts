export type ProductPayload = {
  tenSanPham: string
  gia: number
  soLuongTon: number
  danhMucId: string
  moTa?: string
  hinhAnh?: string
  hinhAnhs?: string[]
  thongSoKyThuat?: any
}

export function slugifyProductName(name: string) {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return normalized || 'san-pham'
}

export async function generateUniqueProductSlug(
  name: string,
  isTaken: (slug: string) => Promise<boolean>
) {
  const baseSlug = slugifyProductName(name)
  let slug = baseSlug
  let suffix = 1

  while (await isTaken(slug)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

export function validateAdminProductPayload(input: Record<string, unknown>) {
  const tenSanPham = typeof input.tenSanPham === 'string' ? input.tenSanPham.trim() : ''
  const danhMucId = typeof input.danhMucId === 'string' ? input.danhMucId.trim() : ''
  const moTa = typeof input.moTa === 'string' ? input.moTa.trim() : ''
  const gia = Number(input.gia)
  const soLuongTon = Number(input.soLuongTon)
  const hinhAnh = typeof input.hinhAnh === 'string' ? input.hinhAnh.trim() : ''
  const hinhAnhs = Array.isArray(input.hinhAnhs) ? input.hinhAnhs.filter((url): url is string => typeof url === 'string' && url.trim().length > 0) : []
  const thongSoKyThuat = input.thongSoKyThuat

  if (!tenSanPham || !danhMucId) {
    return { ok: false as const, error: 'Ten san pham va danh muc la bat buoc' }
  }

  if (!Number.isFinite(gia) || gia < 0) {
    return { ok: false as const, error: 'Gia san pham khong hop le' }
  }

  if (!Number.isInteger(soLuongTon) || soLuongTon < 0) {
    return { ok: false as const, error: 'So luong ton khong hop le' }
  }

  if (hinhAnhs.length === 0 && !hinhAnh) {
    return { ok: false as const, error: 'Vui lòng thêm ít nhất một hình ảnh sản phẩm' }
  }

  return {
    ok: true as const,
    data: {
      tenSanPham,
      gia,
      soLuongTon,
      danhMucId,
      moTa: moTa || undefined,
      hinhAnh: hinhAnh || undefined,
      hinhAnhs: hinhAnhs.length > 0 ? hinhAnhs : undefined,
      thongSoKyThuat
    } satisfies ProductPayload
  }
}