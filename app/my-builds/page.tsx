'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trash2, Eye, Copy, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BuildItem {
  id: string
  soLuong: number
  sanPham: {
    id: string
    tenSanPham: string
    gia: number
    hinhAnh?: string
  }
}

interface Build {
  id: string
  tenCauHinh: string
  tongGia: number
  ngayTao: string
  isCompleted: boolean
  isPublic: boolean
  itemCount: number
  items: BuildItem[]
}

export default function MyBuildsPage() {
  const router = useRouter()
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all')

  const fetchBuilds = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filter === 'completed') {
        params.append('isCompleted', 'true')
      } else if (filter === 'incomplete') {
        params.append('isCompleted', 'false')
      }

      const res = await fetch(`/api/build/my?${params.toString()}`)
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Lỗi khi tải danh sách')
        return
      }

      setBuilds(data.builds)
    } catch (err) {
      setError('Lỗi khi kết nối đến server')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBuilds()
  }, [filter])

  const handleDelete = async (buildId: string, buildName: string) => {
    if (!window.confirm(`Xác nhận xóa cấu hình "${buildName}"?`)) {
      return
    }

    try {
      const res = await fetch(`/api/build/${buildId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        alert('Lỗi khi xóa cấu hình')
        return
      }

      setBuilds(builds.filter((b) => b.id !== buildId))
      alert('Đã xóa cấu hình')
    } catch (err) {
      alert('Lỗi khi xóa cấu hình')
      console.error(err)
    }
  }

  const handleLoadBuild = (buildId: string) => {
    // Load build để chỉnh sửa
    router.push(`/builder?loadId=${buildId}`)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0d1117] to-[#161b22] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Cấu Hình Của Tôi</h1>
          <p className="text-slate-400">Quản lý các cấu hình PC đã lưu</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {(['all', 'completed', 'incomplete'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#1e2535] text-slate-300 hover:bg-[#2d3748]'
              }`}
            >
              {f === 'all' && 'Tất cả'}
              {f === 'completed' && 'Hoàn thành'}
              {f === 'incomplete' && 'Chưa hoàn thành'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-rose-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && builds.length === 0 && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">Không có cấu hình nào</h3>
            <p className="text-slate-500 mb-6">Bạn chưa lưu cấu hình PC nào. Hãy tạo một cấu hình mới.</p>
            <Link
              href="/builder"
              className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Tạo Cấu Hình Mới
            </Link>
          </div>
        )}

        {/* Builds List */}
        {!loading && builds.length > 0 && (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {builds.map((build) => (
              <div
                key={build.id}
                className="bg-[#1e2535] rounded-lg border border-[#2d3748] overflow-hidden hover:border-indigo-500/50 transition"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-[#2d3748]">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <h3 className="text-lg font-semibold text-white truncate">{build.tenCauHinh}</h3>
                      <p className="text-sm text-slate-400 mt-1">{build.itemCount} linh kiện</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {build.isCompleted && (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">Hoàn thành</span>
                      )}
                      {build.isPublic && (
                        <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">Public</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3">
                  {/* Price */}
                  <div>
                    <p className="text-sm text-slate-400">Tổng giá</p>
                    <p className="text-xl font-bold text-indigo-400">{formatPrice(build.tongGia)}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-sm text-slate-400">Ngày tạo</p>
                    <p className="text-sm text-slate-300">{formatDate(build.ngayTao)}</p>
                  </div>

                  {/* Items Preview */}
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Linh kiện</p>
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {build.items.map((item) => (
                        <div key={item.id} className="text-xs text-slate-400">
                          <span className="text-slate-300">{item.sanPham.tenSanPham}</span>
                          {item.soLuong > 1 && <span> x{item.soLuong}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 border-t border-[#2d3748] flex gap-2">
                  <button
                    onClick={() => handleLoadBuild(build.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    Load
                  </button>
                  <Link
                    href={`/api/build/${build.id}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Xem
                  </Link>
                  <button
                    onClick={() => handleDelete(build.id, build.tenCauHinh)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
