'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Boxes, Edit2, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { AdminModal } from '@/components/admin-modal'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useToast } from '@/app/providers/toast-provider'

type Brand = {
  id: string | null
  name: string
  productCount: number
  aliases: string[]
}

export function AdminBrandsClient() {
  const router = useRouter()
  const { addToast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '' })

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/brands', { credentials: 'include' })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/brands')
        return
      }

      const data = await response.json()
      setBrands(data.brands || [])
    } catch (error) {
      console.error('Error fetching brands:', error)
      addToast('Không thể tải danh sách thương hiệu', 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast, router])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  const openForm = (brand?: Brand) => {
    if (brand) {
      setSelectedBrand(brand)
      setFormData({ name: brand.name })
    } else {
      setSelectedBrand(null)
      setFormData({ name: '' })
    }

    setIsFormOpen(true)
  }

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setSelectedBrand(null)
    setFormData({ name: '' })
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      addToast('Vui lòng nhập tên thương hiệu', 'error')
      return
    }

    try {
      const method = selectedBrand ? 'PUT' : 'POST'
      const url = selectedBrand
        ? `/api/admin/brands/${encodeURIComponent(selectedBrand.name)}`
        : '/api/admin/brands'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: formData.name }),
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/brands')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi lưu thương hiệu')
      }

      await fetchBrands()
      closeForm()
      addToast(selectedBrand ? 'Cập nhật thương hiệu thành công' : 'Thêm thương hiệu thành công', 'success')
    } catch (error) {
      console.error('Error saving brand:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi lưu thương hiệu', 'error')
    }
  }

  const handleDelete = async () => {
    if (!brandToDelete) return

    try {
      const response = await fetch(`/api/admin/brands/${encodeURIComponent(brandToDelete.name)}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/brands')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi xóa thương hiệu')
      }

      await fetchBrands()
      setBrandToDelete(null)
      addToast('Xóa thương hiệu thành công', 'success')
    } catch (error) {
      console.error('Error deleting brand:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi xóa thương hiệu', 'error')
    }
  }

  const filteredBrands = brands.filter((brand) => {
    const query = searchTerm.toLowerCase()
    return (
      brand.name.toLowerCase().includes(query) ||
      brand.aliases.some((alias) => alias.toLowerCase().includes(query))
    )
  })

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030304] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#FFD600]" />
          <p className="text-slate-400">Đang tải thương hiệu...</p>
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
                <Boxes className="h-7 w-7 text-[#FFD600]" />
                Quản lý Thương hiệu
              </h1>
              <p className="mt-1 text-sm text-slate-400">{brands.length} thương hiệu trong hệ thống.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F7931A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff9f2d]"
          >
            <Plus className="h-4 w-4" />
            Thêm thương hiệu
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên thương hiệu..."
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
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Thương hiệu</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Số sản phẩm</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Tên đã gộp</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-slate-500">
                      Không tìm thấy thương hiệu phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr key={brand.name} className="transition hover:bg-[#141a26]">
                      <td className="px-5 py-4 text-sm font-medium text-white">{brand.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">{brand.productCount}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {brand.aliases.length > 1 ? brand.aliases.join(', ') : 'Không có'}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/products?brand=${encodeURIComponent(brand.name)}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#F7931A]/40 hover:text-white"
                          >
                            <Boxes className="h-3 w-3" />
                            Sản phẩm
                          </Link>
                          <button
                            type="button"
                            onClick={() => openForm(brand)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#F7931A]/40 hover:text-white"
                          >
                            <Edit2 className="h-3 w-3" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => setBrandToDelete(brand)}
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

      <AdminModal
        open={isFormOpen}
        onClose={closeForm}
        title={selectedBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
        maxWidthClassName="max-w-lg"
        footer={(
          <>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="brand-form"
              className="rounded-xl bg-[#F7931A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff9f2d]"
            >
              {selectedBrand ? 'Cập nhật' : 'Thêm thương hiệu'}
            </button>
          </>
        )}
      >
        <form id="brand-form" onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            Tên thương hiệu *
            <input
              type="text"
              value={formData.name}
              onChange={(event) => setFormData({ name: event.target.value })}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
              placeholder="Ví dụ: ASUS"
              required
            />
          </label>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(brandToDelete)}
        title="Xác nhận xóa thương hiệu"
        description={
          brandToDelete
            ? `Thao tác này sẽ xóa thương hiệu "${brandToDelete.name}" và gỡ khỏi ${brandToDelete.productCount} sản phẩm.`
            : ''
        }
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setBrandToDelete(null)
        }}
      />
    </main>
  )
}
