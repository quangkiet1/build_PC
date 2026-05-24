'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, ArrowLeft, Search, Folder, Loader2, X } from 'lucide-react'
import { useToast } from '@/app/providers/toast-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface Category {
  id: string
  tenDanhMuc: string
  moTa?: string | null
}

export default function AdminCategoriesPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({ tenDanhMuc: '', moTa: '' })

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories', { credentials: 'include' })
      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/categories')
        return
      }
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      addToast('Không thể tải danh sách danh mục', 'error')
    } finally {
      setLoading(false)
    }
  }, [router, addToast])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const openForm = (category?: Category) => {
    if (category) {
      setSelectedCategory(category)
      setFormData({ tenDanhMuc: category.tenDanhMuc, moTa: category.moTa || '' })
    } else {
      setSelectedCategory(null)
      setFormData({ tenDanhMuc: '', moTa: '' })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setSelectedCategory(null)
    setIsFormOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!formData.tenDanhMuc.trim()) {
      addToast('Vui lòng nhập tên danh mục', 'error')
      return
    }

    try {
      const method = selectedCategory ? 'PUT' : 'POST'
      const url = selectedCategory ? `/api/admin/categories/${selectedCategory.id}` : '/api/admin/categories'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/categories')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi lưu danh mục')
      }

      await fetchCategories()
      closeForm()
      addToast(selectedCategory ? 'Cập nhật danh mục thành công' : 'Tạo danh mục mới thành công', 'success')
    } catch (error) {
      console.error('Error saving category:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi lưu danh mục', 'error')
    }
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    try {
      const response = await fetch(`/api/admin/categories/${categoryToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/categories')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi xóa danh mục')
      }

      await fetchCategories()
      addToast('Xóa danh mục thành công', 'success')
      setCategoryToDelete(null)
    } catch (error) {
      console.error('Error deleting category:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi xóa danh mục', 'error')
    }
  }

  const filteredCategories = categories.filter((category) =>
    category.tenDanhMuc.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.moTa?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030304] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#FFD600]" />
          <p className="text-slate-400">Đang tải danh mục...</p>
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
                <Folder className="h-7 w-7 text-[#FFD600]" />
                Quản lý Danh mục
              </h1>
              <p className="mt-1 text-sm text-slate-400">{categories.length} danh mục hiện có.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/30 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4" /> Thêm danh mục
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm danh mục..."
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
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Danh mục</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Mô tả</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-16 text-center">
                      <p className="text-slate-500">Không tìm thấy danh mục nào.</p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((category) => (
                    <tr key={category.id} className="hover:bg-[#141a26] transition">
                      <td className="px-5 py-4 text-sm text-white">{category.tenDanhMuc}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">{category.moTa || 'Chưa có mô tả'}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openForm(category)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:border-[#F7931A]/40 hover:text-white"
                          >
                            <Edit2 className="h-4 w-4" />
                            Sửa
                          </button>
                          <button
                            type="button"
                            onClick={() => setCategoryToDelete(category)}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-xs font-semibold text-rose-300 transition hover:border-rose-500/40 hover:text-white"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-[#0f1117] p-8 text-white shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{selectedCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selectedCategory ? 'Cập nhật thông tin danh mục hiện tại.' : 'Tạo danh mục mới để sử dụng cho sản phẩm.'}
                </p>
              </div>
              <button
                type="button"
                onClick={closeForm}
                className="rounded-full border border-white/10 bg-[#111827] p-2 text-slate-300 transition hover:border-[#F7931A]/40 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              <label className="block text-sm font-medium text-slate-300">
                Tên danh mục
                <input
                  value={formData.tenDanhMuc}
                  onChange={(event) => setFormData((prev) => ({ ...prev, tenDanhMuc: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-white outline-none transition focus:border-[#F7931A]/50 focus:ring-1 focus:ring-[#F7931A]/20"
                  placeholder="Ví dụ: Card đồ họa"
                />
              </label>

              <label className="block text-sm font-medium text-slate-300">
                Mô tả (tùy chọn)
                <textarea
                  value={formData.moTa}
                  onChange={(event) => setFormData((prev) => ({ ...prev, moTa: event.target.value }))}
                  className="mt-2 h-28 w-full rounded-2xl border border-white/10 bg-[#0F1115] px-4 py-3 text-white outline-none transition focus:border-[#F7931A]/50 focus:ring-1 focus:ring-[#F7931A]/20"
                  placeholder="Mô tả ngắn gọn về danh mục"
                />
              </label>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-2xl border border-white/10 bg-[#111827] px-5 py-3 text-sm font-semibold text-slate-300 transition hover:border-[#F7931A]/40 hover:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded-2xl bg-[#F7931A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#ff9f2d]"
                >
                  {selectedCategory ? 'Cập nhật' : 'Tạo danh mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title="Xác nhận xóa danh mục"
        description="Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa danh mục này không?"
        confirmLabel="Xóa"
        cancelLabel="Hủy"
        confirmVariant="destructive"
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null)
        }}
      />
    </main>
  )
}
