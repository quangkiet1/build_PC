export interface Product {
  id: string
  tenSanPham: string
  slug: string
  gia: number
  hinhAnh?: string | null
  hinhAnhs?: string[]
  moTa?: string | null
  soLuongTon: number
  thongSoKyThuat?: any
  danhMuc?: {
    id: string
    tenDanhMuc: string
    moTa?: string | null
  }
  createdAt?: Date
  updatedAt?: Date
  danhMucId?: string
}
