'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit2, Trash2, X, ArrowLeft, Search, Package, Loader2, Upload, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/app/providers/toast-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'

// Hàm tự động thay thế ảnh lỗi/trống thành ảnh demo trên mạng
const getSafeDemoImage = (url?: string | null, fallbackName: string = 'Product') => {
  if (!url || url.includes('via.placeholder.com')) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&color=fff&size=300`
  }
  return url
}

interface Product {
  id: string
  tenSanPham: string
  slug: string
  gia: number
  phanTramGiam?: number | null
  hinhAnh?: string | null
  hinhAnhs: string[]
  moTa?: string | null
  soLuongTon: number
  thongSoKyThuat?: Record<string, unknown> | null
  danhMuc: {
    id: string
    tenDanhMuc: string
  }
}

interface Category {
  id: string
  tenDanhMuc: string
}

export default function AdminProductsPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)
  const [formData, setFormData] = useState({
    tenSanPham: '',
    gia: 0,
    phanTramGiam: 0,
    hinhAnh: '',
    hinhAnhs: [] as string[],
    moTa: '',
    soLuongTon: 100,
    thongSoKyThuat: '',
    danhMucId: '',
  })

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/products', { credentials: 'include' })
      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/products')
        return
      }
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      addToast('Không thể tải danh sách sản phẩm', 'error')
    } finally {
      setLoading(false)
    }
  }, [router, addToast])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories', { credentials: 'include' })
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  const openForm = (product?: Product) => {
    if (product) {
      setSelectedProduct(product)
      setFormData({
        tenSanPham: product.tenSanPham,
        gia: product.gia,
        phanTramGiam: product.phanTramGiam || 0,
        hinhAnh: product.hinhAnh || '',
        hinhAnhs: product.hinhAnhs || [],
        moTa: product.moTa || '',
        soLuongTon: product.soLuongTon,
        thongSoKyThuat: product.thongSoKyThuat ? JSON.stringify(product.thongSoKyThuat, null, 2) : '',
        danhMucId: product.danhMuc.id,
      })
    } else {
      setSelectedProduct(null)
      setFormData({
        tenSanPham: '',
        gia: 0,
        phanTramGiam: 0,
        hinhAnh: '',
        hinhAnhs: [],
        moTa: '',
        soLuongTon: 100,
        thongSoKyThuat: '',
        danhMucId: '',
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setSelectedProduct(null)
  }

  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true)
    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        // Kiểm tra dung lượng ảnh (giới hạn 2MB để tránh lỗi Payload Too Large khi lưu DB)
        if (file.size > 2 * 1024 * 1024) {
          addToast(`Ảnh "${file.name}" quá lớn. Vui lòng chọn ảnh nhỏ hơn 2MB`, 'error')
          continue
        }

        // Chuyển đổi file ảnh thành chuỗi Base64 để lưu trực tiếp vào database
        // Cách này giúp bỏ qua bước gọi API /api/upload (thường gây lỗi nếu chưa setup server lưu trữ)
        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.readAsDataURL(file)
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = (error) => reject(error)
        })
        
        uploadedUrls.push(base64Data)
      }

      setFormData(prev => ({
        ...prev,
        hinhAnhs: [...prev.hinhAnhs, ...uploadedUrls]
      }))

      addToast('Tải lên hình ảnh thành công', 'success')
    } catch (error) {
      console.error('Error uploading images:', error)
      addToast('Lỗi khi tải lên hình ảnh', 'error')
    } finally {
      setUploadingImages(false)
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hinhAnhs: prev.hinhAnhs.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.tenSanPham || !formData.danhMucId) {
      addToast('Vui lòng điền tên sản phẩm và chọn danh mục', 'error')
      return
    }

    let finalImages = formData.hinhAnhs
    if (finalImages.length === 0) {
      // Tự động tạo ảnh từ tên sản phẩm nếu không upload thủ công
      const autoImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.tenSanPham)}&background=random&color=fff&size=300&bold=true`
      finalImages = [autoImageUrl]
    }

    if (formData.gia <= 0) {
      addToast('Giá sản phẩm phải lớn hơn 0', 'error')
      return
    }

    try {
      const method = selectedProduct ? 'PUT' : 'POST'
      const url = selectedProduct
        ? `/api/admin/products/${selectedProduct.id}`
        : '/api/admin/products'

      const submitData = {
        ...formData,
        hinhAnh: finalImages[0], // Cập nhật ảnh chính
        hinhAnhs: finalImages,   // Cập nhật danh sách ảnh
        thongSoKyThuat: formData.thongSoKyThuat ? JSON.parse(formData.thongSoKyThuat) : null,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(submitData),
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/products')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi lưu sản phẩm')
      }

      await fetchProducts()
      closeForm()
      addToast(selectedProduct ? 'Cập nhật sản phẩm thành công' : 'Thêm sản phẩm thành công', 'success')
    } catch (error) {
      console.error('Error saving product:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi lưu sản phẩm', 'error')
    }
  }

  const deleteProduct = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/admin/products/${productToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/products')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi xóa sản phẩm')
      }

      setProducts((current) => current.filter((product) => product.id !== productToDelete.id))
      addToast('Xóa sản phẩm thành công', 'success')
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi xóa sản phẩm', 'error')
    }
  }

  const filteredProducts = products.filter((product) =>
    product.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.danhMuc.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-[#07080d] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Đang tải sản phẩm...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#07080d] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
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
                <Package className="h-7 w-7 text-indigo-400" />
                Quản lý Sản phẩm
              </h1>
              <p className="mt-1 text-sm text-slate-400">{products.length} sản phẩm trong kho.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm hoặc danh mục..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-[#0f1117] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/25"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Sản phẩm</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Danh mục</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Giá</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Tồn kho</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-16 text-center text-slate-500">
                      Không tìm thấy sản phẩm phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#141a26] transition">
                      <td className="px-5 py-4 text-sm text-white">
                        <div className="flex items-center gap-3">
                          {product.hinhAnhs.length > 0 ? (
                            <Image
                              src={getSafeDemoImage(product.hinhAnhs[0], product.tenSanPham)}
                              alt={product.tenSanPham}
                              width={40}
                              height={40}
                              className="rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.tenSanPham}</p>
                            <p className="text-xs text-slate-400">{product.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{product.danhMuc.tenDanhMuc}</td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex flex-col">
                          {product.phanTramGiam ? (
                            <>
                              <span className="line-through text-slate-400">{product.gia.toLocaleString('vi-VN')} VND</span>
                              <span className="text-emerald-400 font-semibold">
                                {(product.gia * (100 - product.phanTramGiam) / 100).toLocaleString('vi-VN')} VND
                              </span>
                              <span className="text-xs text-orange-400">-{product.phanTramGiam}%</span>
                            </>
                          ) : (
                            <span className="text-white">{product.gia.toLocaleString('vi-VN')} VND</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{product.soLuongTon}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-indigo-500/40 hover:text-white"
                          >
                            <Edit2 className="h-3 w-3" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:border-rose-500/40 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
          
          {/* CHUẨN HOÁ: Dùng thẻ div bọc ngoài để Flexbox tính toán chiều cao max-h-[90vh] chính xác trên mọi trình duyệt */}
          <div className="flex w-full max-w-2xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117] shadow-2xl">
            
            {/* Header Modal */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 p-5 sm:p-6 bg-[#0f1117]">
              <h2 className="text-xl font-bold text-white">
                {selectedProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-slate-600 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Vùng cuộn độc lập */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Tên sản phẩm *</label>
                  <input
                    type="text"
                    value={formData.tenSanPham}
                    onChange={(e) => setFormData(prev => ({ ...prev, tenSanPham: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50"
                    placeholder="Nhập tên sản phẩm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Danh mục *</label>
                  <select
                    value={formData.danhMucId}
                    onChange={(e) => setFormData(prev => ({ ...prev, danhMucId: e.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-indigo-500/50"
                    required
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.tenDanhMuc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Giá (VND) *</label>
                  <input
                    type="number"
                    value={formData.gia}
                    onChange={(e) => setFormData(prev => ({ ...prev, gia: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Giảm giá (%)</label>
                  <input
                    type="number"
                    value={formData.phanTramGiam}
                    onChange={(e) => setFormData(prev => ({ ...prev, phanTramGiam: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Số lượng tồn kho</label>
                  <input
                    type="number"
                    value={formData.soLuongTon}
                    onChange={(e) => setFormData(prev => ({ ...prev, soLuongTon: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50"
                    placeholder="100"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData(prev => ({ ...prev, moTa: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50"
                  placeholder="Mô tả sản phẩm..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Thông số kỹ thuật (JSON)</label>
                <textarea
                  value={formData.thongSoKyThuat}
                  onChange={(e) => setFormData(prev => ({ ...prev, thongSoKyThuat: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 font-mono"
                  placeholder='{"socket": "AM5", "chipset": "B650", "ram_type": "DDR5"}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Hình ảnh sản phẩm</label>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImages}
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111827] px-4 py-3 text-sm text-slate-300 transition hover:border-indigo-500/40 hover:text-white cursor-pointer"
                    >
                      {uploadingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingImages ? 'Đang tải lên...' : 'Chọn hình ảnh'}
                    </label>
                  </div>

                  {formData.hinhAnhs.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {formData.hinhAnhs.map((url, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={url}
                            alt={`Product ${index + 1}`}
                            width={96}
                            height={96}
                            className="w-full h-24 rounded-lg object-cover border border-slate-700"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-600 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              </form>
            </div>

            {/* Footer Modal - Gọi submit qua form="product-form" */}
            <div className="flex shrink-0 justify-end gap-3 border-t border-slate-800 bg-[#0f1117] p-5 sm:p-6">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
              >
                Hủy
              </button>
              <button
                type="submit"
                form="product-form"
                className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
              >
                {selectedProduct ? 'Cập nhật' : 'Thêm sản phẩm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title="Xác nhận xóa sản phẩm"
        description="Hành động này sẽ xóa sản phẩm và không thể hoàn tác. Bạn có chắc chắn muốn tiếp tục?"
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmVariant="destructive"
        onConfirm={deleteProduct}
        onOpenChange={(open) => { if (!open) setProductToDelete(null) }}
      />
    </main>
  )
}
