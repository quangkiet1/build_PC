'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, X, Boxes, ArrowLeft, Search, Package } from 'lucide-react'

interface Product {
  id: string
  tenSanPham: string
  gia: number
  soLuongTon: number
  danhMucId: string
  moTa?: string
  thongSoKyThuat?: any
}

interface Category {
  id: string
  tenDanhMuc: string
}

export default function AdminProducts() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    tenSanPham: '',
    gia: 0,
    soLuongTon: 0,
    danhMucId: '',
    moTa: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products', { credentials: 'include' }),
        fetch('/api/admin/categories', { credentials: 'include' }),
      ])

      if (productsRes.status === 401) {
        router.push('/?auth=required&next=/admin/products')
        return
      }

      const productsData = await productsRes.json()
      const categoriesData = await categoriesRes.json()

      setProducts(productsData.products || [])
      setCategories(categoriesData.categories || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const openForm = (product?: Product) => {
    if (product) {
      setSelectedProduct(product)
      setFormData({
        tenSanPham: product.tenSanPham,
        gia: product.gia,
        soLuongTon: product.soLuongTon,
        danhMucId: product.danhMucId,
        moTa: product.moTa || '',
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        tenSanPham: '',
        gia: 0,
        soLuongTon: 0,
        danhMucId: categories[0]?.id || '',
        moTa: '',
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tenSanPham || !formData.danhMucId) {
      alert('Vui lòng điền tên sản phẩm và chọn danh mục')
      return
    }

    try {
      const method = selectedProduct ? 'PUT' : 'POST'
      const url = selectedProduct
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.status === 401) {
        router.push('/?auth=required&next=/admin/products')
        return
      }

      if (!response.ok) throw new Error('Failed to save product')

      await fetchData()
      closeForm()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Lỗi khi lưu sản phẩm')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return

    try {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401) {
        router.push('/?auth=required&next=/admin/products')
        return
      }

      if (!response.ok) throw new Error('Failed to delete product')
      await fetchData()
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Lỗi khi xóa sản phẩm')
    }
  }

  const filteredProducts = products.filter((p) =>
    p.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07080d] text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-slate-400">Đang tải dữ liệu...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#07080d] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-800 bg-[#0f1117] p-2.5 text-slate-400 transition hover:border-indigo-500/40 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                <Boxes className="h-7 w-7 text-indigo-400" />
                Quản lý Sản phẩm
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {products.length} sản phẩm &middot; {categories.length} danh mục
              </p>
            </div>
          </div>
          <button
            onClick={() => openForm()}
            className="gaming-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#0f1117] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
          />
        </div>

        {/* Products Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Sản phẩm
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Giá
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tồn kho
                  </th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Danh mục
                  </th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center">
                      <Package className="mx-auto h-10 w-10 text-slate-700" />
                      <p className="mt-3 text-slate-500">
                        {searchTerm ? 'Không tìm thấy sản phẩm phù hợp' : 'Chưa có sản phẩm nào'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const category = categories.find((c) => c.id === product.danhMucId)
                    return (
                      <tr
                        key={product.id}
                        className="transition hover:bg-[#141a26]"
                      >
                        <td className="px-5 py-4">
                          <p className="font-medium text-white">{product.tenSanPham}</p>
                          {product.moTa && (
                            <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500">{product.moTa}</p>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-sm text-indigo-300">
                          {product.gia.toLocaleString('vi-VN')}₫
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              product.soLuongTon > 20
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : product.soLuongTon > 0
                                  ? 'bg-amber-500/10 text-amber-400'
                                  : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {product.soLuongTon > 0 ? product.soLuongTon : 'Hết hàng'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="rounded-lg border border-slate-700/50 bg-slate-800/40 px-2.5 py-1 text-xs text-slate-300">
                            {category?.tenDanhMuc || 'N/A'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => openForm(product)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-indigo-500/10 hover:text-indigo-400"
                              title="Sửa"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-400"
                              title="Xóa"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117] shadow-2xl shadow-indigo-950/20">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h2 className="text-lg font-bold text-white">
                {selectedProduct ? 'Sửa Sản phẩm' : 'Thêm Sản phẩm mới'}
              </h2>
              <button
                onClick={closeForm}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Tên sản phẩm</label>
                <input
                  type="text"
                  value={formData.tenSanPham}
                  onChange={(e) => setFormData({ ...formData, tenSanPham: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-[#141a26] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
                  placeholder="VD: RTX 4090 Gaming OC"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Giá (VND)</label>
                  <input
                    type="number"
                    value={formData.gia}
                    onChange={(e) => setFormData({ ...formData, gia: parseFloat(e.target.value) })}
                    className="w-full rounded-xl border border-slate-800 bg-[#141a26] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-300">Số lượng tồn</label>
                  <input
                    type="number"
                    value={formData.soLuongTon}
                    onChange={(e) => setFormData({ ...formData, soLuongTon: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-800 bg-[#141a26] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Danh mục</label>
                <select
                  value={formData.danhMucId}
                  onChange={(e) => setFormData({ ...formData, danhMucId: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-[#141a26] px-4 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.tenDanhMuc}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Mô tả</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData({ ...formData, moTa: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-[#141a26] px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
                  rows={3}
                  placeholder="Mô tả ngắn về sản phẩm..."
                />
              </div>

              {/* Modal footer */}
              <div className="flex gap-3 border-t border-slate-800 pt-5">
                <button
                  type="submit"
                  className="gaming-gradient flex-1 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-950/30 transition hover:brightness-110"
                >
                  {selectedProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-xl border border-slate-700 bg-transparent py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-600 hover:text-white"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
