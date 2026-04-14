'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Plus, Edit2, Trash2, X, ArrowLeft, Search, Percent, Loader2 } from 'lucide-react'
import { useToast } from '@/app/providers/toast-provider'
import { ConfirmDialog } from '@/components/confirm-dialog'

interface Promotion {
  id: string
  maKhuyenMai: string
  tenKhuyenMai: string
  phanTramGiam: number
  ngayBatDau: string
  ngayKetThuc: string
  isActive: boolean
}

export default function AdminPromotions() {
  const router = useRouter()
  const { addToast } = useToast()
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    maKhuyenMai: '',
    tenKhuyenMai: '',
    phanTramGiam: 10,
    ngayBatDau: '',
    ngayKetThuc: '',
    isActive: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/promotions', { credentials: 'include' })

      if (response.status === 401) {
        router.push('/?auth=required&next=/admin/promotions')
        return
      }

      const data = await response.json()
      setPromotions(data.promotions || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
      addToast('Không thể tải dữ liệu khuyến mãi', 'error')
    } finally {
      setLoading(false)
    }
  }

  const openForm = (promotion?: Promotion) => {
    if (promotion) {
      setSelectedPromotion(promotion)
      setFormData({
        maKhuyenMai: promotion.maKhuyenMai,
        tenKhuyenMai: promotion.tenKhuyenMai,
        phanTramGiam: promotion.phanTramGiam,
        ngayBatDau: promotion.ngayBatDau.substring(0, 16),
        ngayKetThuc: promotion.ngayKetThuc.substring(0, 16),
        isActive: promotion.isActive,
      })
    } else {
      setSelectedPromotion(null)
      const now = new Date().toISOString().substring(0, 16)
      setFormData({
        maKhuyenMai: '',
        tenKhuyenMai: '',
        phanTramGiam: 10,
        ngayBatDau: now,
        ngayKetThuc: now,
        isActive: true,
      })
    }
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setSelectedPromotion(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.maKhuyenMai || !formData.tenKhuyenMai) {
      addToast('Vui lòng điền mã và tên khuyến mãi', 'error')
      return
    }

    if (formData.phanTramGiam < 1 || formData.phanTramGiam > 100) {
      addToast('Phần trăm giảm phải từ 1 đến 100', 'error')
      return
    }

    try {
      const method = selectedPromotion ? 'PUT' : 'POST'
      const url = selectedPromotion
        ? `/api/admin/promotions/${selectedPromotion.id}`
        : '/api/admin/promotions'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          ngayBatDau: new Date(formData.ngayBatDau).toISOString(),
          ngayKetThuc: new Date(formData.ngayKetThuc).toISOString(),
        }),
      })

      if (response.status === 401) {
        router.push('/?auth=required&next=/admin/promotions')
        return
      }

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to save promotion')
      await fetchData()
      closeForm()
      addToast(selectedPromotion ? 'Đã cập nhật khuyến mãi' : 'Đã tạo khuyến mãi mới', 'success')
    } catch (error) {
      console.error('Error saving promotion:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi lưu khuyến mãi', 'error')
    }
  }

  const handleDelete = async () => {
    if (!promotionToDelete) return

    try {
      const response = await fetch(`/api/admin/promotions/${promotionToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401) {
        router.push('/?auth=required&next=/admin/promotions')
        return
      }

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to delete promotion')
      await fetchData()
      addToast('Đã xóa khuyến mãi', 'success')
      setPromotionToDelete(null)
    } catch (error) {
      console.error('Error deleting promotion:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi xóa khuyến mãi', 'error')
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString('vi-VN')

  const filtered = promotions.filter((p) =>
    p.maKhuyenMai.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tenKhuyenMai.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Đang tải khuyến mãi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-white">
      {/* Header */}
      <div className="bg-[#0a0b10] border-b border-[#1e2535]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-300 transition mb-4">
            <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Percent className="w-6 h-6 text-indigo-400" />
                Quản lý Khuyến mãi
              </h1>
              <p className="text-slate-400 text-sm mt-1">{promotions.length} khuyến mãi trong hệ thống</p>
            </div>
            <button
              onClick={() => openForm()}
              className="inline-flex items-center gap-2 px-4 py-2.5 gaming-gradient rounded-xl text-white text-sm font-semibold transition hover:opacity-90"
            >
              <Plus className="w-4 h-4" /> Thêm khuyến mãi
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="mb-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã hoặc tên..."
              className="w-full rounded-xl border border-[#1e2535] bg-[#0f1117] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f1117] border border-[#1e2535] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#1e2535]">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Mã</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Tên</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Giảm</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Bắt đầu</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hidden md:table-cell">Kết thúc</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                  <th className="text-center px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                      <Percent className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                      Không có khuyến mãi nào
                    </td>
                  </tr>
                ) : (
                  filtered.map((promo) => (
                    <tr key={promo.id} className="border-b border-[#1e2535] last:border-b-0 hover:bg-[#141a26] transition">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-sm text-indigo-400 font-medium">{promo.maKhuyenMai}</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-white">{promo.tenKhuyenMai}</td>
                      <td className="px-5 py-3.5">
                        <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-semibold">{promo.phanTramGiam}%</span>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">{formatDate(promo.ngayBatDau)}</td>
                      <td className="px-5 py-3.5 text-xs text-slate-400 hidden md:table-cell">{formatDate(promo.ngayKetThuc)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                          promo.isActive
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {promo.isActive ? 'Hoạt động' : 'Tắt'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openForm(promo)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPromotionToDelete(promo)}
                            className="p-2 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f1117] border border-[#1e2535] rounded-2xl shadow-2xl shadow-indigo-950/20 max-w-md w-full">
            <div className="flex items-center justify-between p-5 border-b border-[#1e2535]">
              <h2 className="text-lg font-semibold text-white">
                {selectedPromotion ? 'Sửa Khuyến mãi' : 'Thêm Khuyến mãi'}
              </h2>
              <button onClick={closeForm} className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Mã khuyến mãi</label>
                <input
                  type="text"
                  value={formData.maKhuyenMai}
                  onChange={(e) => setFormData({ ...formData, maKhuyenMai: e.target.value })}
                  placeholder="VD: SALE2024"
                  className="w-full rounded-xl border border-[#1e2535] bg-[#141a26] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none disabled:opacity-50"
                  disabled={!!selectedPromotion}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Tên khuyến mãi</label>
                <input
                  type="text"
                  value={formData.tenKhuyenMai}
                  onChange={(e) => setFormData({ ...formData, tenKhuyenMai: e.target.value })}
                  placeholder="VD: Giảm giá mùa hè"
                  className="w-full rounded-xl border border-[#1e2535] bg-[#141a26] px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Phần trăm giảm (%)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.phanTramGiam}
                  onChange={(e) => setFormData({ ...formData, phanTramGiam: parseInt(e.target.value) })}
                  className="w-full rounded-xl border border-[#1e2535] bg-[#141a26] px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Ngày bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formData.ngayBatDau}
                    onChange={(e) => setFormData({ ...formData, ngayBatDau: e.target.value })}
                    className="scheme-dark w-full rounded-xl border border-[#1e2535] bg-[#141a26] px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Ngày kết thúc</label>
                  <input
                    type="datetime-local"
                    value={formData.ngayKetThuc}
                    onChange={(e) => setFormData({ ...formData, ngayKetThuc: e.target.value })}
                    className="scheme-dark w-full rounded-xl border border-[#1e2535] bg-[#141a26] px-4 py-2.5 text-sm text-white focus:border-indigo-500/50 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-600 bg-[#141a26] text-indigo-500 focus:ring-indigo-500/20"
                  id="isActive"
                />
                <label htmlFor="isActive" className="text-sm text-slate-300">
                  Kích hoạt khuyến mãi
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl gaming-gradient text-white font-semibold text-sm transition hover:opacity-90"
                >
                  {selectedPromotion ? 'Cập nhật' : 'Thêm'}
                </button>
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl border border-[#1e2535] text-slate-300 text-sm font-medium hover:bg-[#141a26] transition"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(promotionToDelete)}
        title="Xóa khuyến mãi"
        description={promotionToDelete ? `Bạn có chắc muốn xóa mã ${promotionToDelete.maKhuyenMai}?` : ''}
        confirmLabel="Xóa khuyến mãi"
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) {
            setPromotionToDelete(null)
          }
        }}
      />
    </div>
  )
}
