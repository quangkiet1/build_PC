'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit2, Trash2, ArrowLeft, Search, Package, Loader2, Upload, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/app/providers/toast-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { AdminModal } from '@/components/admin-modal'
import { useLocale, useTranslations } from 'next-intl'
import type { AppLocale } from '@/i18n/config'
import { formatCurrency } from '@/lib/format'

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
  thuongHieu?: string | null
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
  const t = useTranslations('admin.products')
  const commonT = useTranslations('admin.common')
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const { addToast } = useToast()
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<string[]>([])
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
    thuongHieu: '',
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
      addToast(t('loadError'), 'error')
    } finally {
      setLoading(false)
    }
  }, [router, addToast, t])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/categories', { credentials: 'include' })
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }, [])

  const fetchBrands = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/brands', { credentials: 'include' })
      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/products')
        return
      }

      const data = await response.json()
      setBrands((data.brands || []).map((brand: { name: string }) => brand.name))
    } catch (error) {
      console.error('Error fetching brands:', error)
    }
  }, [router])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchBrands()
  }, [fetchProducts, fetchCategories, fetchBrands])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const brand = params.get('brand')
    if (brand) {
      setSearchTerm(brand)
    }
  }, [])

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
        thuongHieu: product.thuongHieu || '',
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
        thuongHieu: '',
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
          addToast(t('imageTooLarge', { name: file.name }), 'error')
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

      addToast(t('uploadSuccess'), 'success')
    } catch (error) {
      console.error('Error uploading images:', error)
      addToast(t('uploadError'), 'error')
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
      addToast(t('required'), 'error')
      return
    }

    let finalImages = formData.hinhAnhs
    if (finalImages.length === 0) {
      // Tự động tạo ảnh từ tên sản phẩm nếu không upload thủ công
      const autoImageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.tenSanPham)}&background=random&color=fff&size=300&bold=true`
      finalImages = [autoImageUrl]
    }

    if (formData.gia <= 0) {
      addToast(t('priceError'), 'error')
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

      if (!response.ok) {
        throw new Error(t('saveError'))
      }

      await fetchProducts()
      await fetchBrands()
      closeForm()
      addToast(selectedProduct ? t('updateSuccess') : t('createSuccess'), 'success')
    } catch (error) {
      console.error('Error saving product:', error)
      addToast(error instanceof Error ? error.message : t('saveError'), 'error')
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

      if (!response.ok) {
        throw new Error(t('deleteError'))
      }

      setProducts((current) => current.filter((product) => product.id !== productToDelete.id))
      await fetchBrands()
      addToast(t('deleteSuccess'), 'success')
      setProductToDelete(null)
    } catch (error) {
      console.error('Error deleting product:', error)
      addToast(error instanceof Error ? error.message : t('deleteError'), 'error')
    }
  }

  const filteredProducts = products.filter((product) =>
    product.tenSanPham.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.danhMuc.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.thuongHieu?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030304] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#FFD600]" />
          <p className="text-slate-400">{t('loading')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#030304] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-[#0F1115] p-2.5 text-slate-400 transition hover:border-[#F7931A]/40 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                <Package className="h-7 w-7 text-[#FFD600]" />
                {t('title')}
              </h1>
              <p className="mt-1 text-sm text-slate-400">{t('count', { count: products.length })}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F7931A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff9f2d]"
          >
            <Plus className="h-4 w-4" />
            {t('add')}
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0F1115] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50 focus:ring-1 focus:ring-[#F7931A]/20"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.product')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.category')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.brand')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.price')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.stock')}</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">{commonT('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                      {t('empty')}
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
                      <td className="px-5 py-4 text-sm text-slate-300">{product.thuongHieu || t('unassigned')}</td>
                      <td className="px-5 py-4 text-sm">
                        <div className="flex flex-col">
                          {product.phanTramGiam ? (
                            <>
                              <span className="line-through text-slate-400">{formatCurrency(product.gia, locale)}</span>
                              <span className="text-emerald-400 font-semibold">
                                {formatCurrency(product.gia * (100 - product.phanTramGiam) / 100, locale)}
                              </span>
                              <span className="text-xs text-orange-400">-{product.phanTramGiam}%</span>
                            </>
                          ) : (
                            <span className="text-white">{formatCurrency(product.gia, locale)}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{product.soLuongTon}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#F7931A]/40 hover:text-white"
                          >
                            <Edit2 className="h-3 w-3" />
                            {commonT('edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:border-rose-500/40 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                            {commonT('delete')}
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

      <AdminModal
        open={isFormOpen}
        onClose={closeForm}
        title={selectedProduct ? t('editTitle') : t('addTitle')}
        footer={(
          <>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              {commonT('cancel')}
            </button>
            <button
              type="submit"
              form="product-form"
              className="rounded-xl bg-[#F7931A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff9f2d]"
            >
              {selectedProduct ? commonT('update') : t('add')}
            </button>
          </>
        )}
      >
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('name')}</label>
                  <input
                    type="text"
                    value={formData.tenSanPham}
                    onChange={(e) => setFormData(prev => ({ ...prev, tenSanPham: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
                    placeholder={t('namePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('category')}</label>
                  <select
                    value={formData.danhMucId}
                    onChange={(e) => setFormData(prev => ({ ...prev, danhMucId: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition focus:border-[#F7931A]/50"
                    required
                  >
                    <option value="">{t('chooseCategory')}</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.tenDanhMuc}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('brand')}</label>
                  <input
                    type="text"
                    list="admin-brand-options"
                    value={formData.thuongHieu}
                    onChange={(e) => setFormData(prev => ({ ...prev, thuongHieu: e.target.value }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
                    placeholder={t('brandPlaceholder')}
                  />
                  <datalist id="admin-brand-options">
                    {brands.map((brand) => (
                      <option key={brand} value={brand} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('price')}</label>
                  <input
                    type="number"
                    value={formData.gia}
                    onChange={(e) => setFormData(prev => ({ ...prev, gia: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('discount')}</label>
                  <input
                    type="number"
                    value={formData.phanTramGiam}
                    onChange={(e) => setFormData(prev => ({ ...prev, phanTramGiam: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
                    placeholder="0"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">{t('stock')}</label>
                  <input
                    type="number"
                    value={formData.soLuongTon}
                    onChange={(e) => setFormData(prev => ({ ...prev, soLuongTon: Number(e.target.value) }))}
                    className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
                    placeholder="100"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('description')}</label>
                <textarea
                  value={formData.moTa}
                  onChange={(e) => setFormData(prev => ({ ...prev, moTa: e.target.value }))}
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
                  placeholder={t('descriptionPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('specifications')}</label>
                <textarea
                  value={formData.thongSoKyThuat}
                  onChange={(e) => setFormData(prev => ({ ...prev, thongSoKyThuat: e.target.value }))}
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 font-mono text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
                  placeholder='{"socket": "AM5", "chipset": "B650", "ram_type": "DDR5"}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('images')}</label>
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
                      className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-slate-300 transition hover:border-[#F7931A]/40 hover:text-white"
                    >
                      {uploadingImages ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploadingImages ? t('uploading') : t('chooseImages')}
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
      </AdminModal>

      <ConfirmDialog
        open={Boolean(productToDelete)}
        title={t('confirmTitle')}
        description={t('confirmDescription')}
        confirmLabel={commonT('delete')}
        cancelLabel={commonT('cancel')}
        confirmVariant="destructive"
        onConfirm={deleteProduct}
        onOpenChange={(open) => { if (!open) setProductToDelete(null) }}
      />
    </main>
  )
}
