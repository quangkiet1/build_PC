import { Prisma } from '@prisma/client'

export interface Product {
  id: string
  tenSanPham: string
  slug: string
  gia: number
  phanTramGiam?: number | null
  hinhAnh?: string | null
  hinhAnhs?: string[]
  moTa?: string | null
  soLuongTon: number
  thuongHieu?: string | null
  thongSoKyThuat?: Prisma.JsonValue | null
  danhMuc?: {
    id: string
    tenDanhMuc: string
    moTa?: string | null
  }
  createdAt?: Date
  updatedAt?: Date
  danhMucId?: string
}
