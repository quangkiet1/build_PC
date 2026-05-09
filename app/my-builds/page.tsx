'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trash2, Eye, Copy, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

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
        toast.error('Lỗi khi xóa cấu hình')
        return
      }

      setBuilds((prev) => prev.filter((b) => b.id !== buildId))
      toast.success('Đã xóa cấu hình')
    } catch (err) {
      toast.error('Lỗi khi xóa cấu hình')
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
    <div className="min-h-screen bg-[#07080d] text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Cấu Hình Của Tôi</h1>
          <p className="text-slate-400">Quản lý các cấu hình PC đã lưu của bạn</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {(['all', 'completed', 'incomplete'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-[12px] font-medium transition-all backdrop-blur-md border ${
                filter === f
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-[0_0_15px_rgba(79,70,229,0.2)]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
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
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 bg-rose-500/10 border border-rose-500/30 rounded-[16px] flex gap-3 items-center backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <p className="text-rose-300 font-medium">{error}</p>
          </motion.div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && builds.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl border border-white/10 rounded-[24px] shadow-xl">
            <AlertCircle className="w-16 h-16 text-indigo-400/50 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-2">Không có cấu hình nào</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Bạn chưa lưu cấu hình PC nào. Hãy trải nghiệm ngay công cụ xây dựng PC để tạo ra bộ máy mơ ước của bạn.</p>
            <Link
              href="/builder"
              className="inline-block px-8 py-3 bg-[linear-gradient(135deg,#6366f1,#a855f7)] text-white font-semibold rounded-[16px] hover:brightness-110 transition shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              Tạo Cấu Hình Mới
            </Link>
          </motion.div>
        )}

        {/* Builds List */}
        {!loading && builds.length > 0 && (
          <motion.div 
            initial="hidden" 
            animate="visible" 
            variants={{
              visible: { transition: { staggerChildren: 0.05 } }
            }}
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {builds.map((build, index) => (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
                }}
                key={build.id}
                className="bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl rounded-[24px] border border-white/10 overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(79,70,229,0.15)] hover:-translate-y-1 flex flex-col"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-white/5 bg-white/5">
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
                <div className="p-5 space-y-4 flex-1">
                  {/* Price */}
                  <div className="bg-black/20 rounded-[12px] p-3 border border-white/5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Tổng giá</p>
                    <p className="text-2xl font-bold text-indigo-400">{formatPrice(build.tongGia)}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Ngày tạo</p>
                    <p className="text-sm font-medium text-slate-300">{formatDate(build.ngayTao)}</p>
                  </div>

                  {/* Items Preview */}
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Linh kiện ({build.itemCount})</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {build.items.map((item) => (
                        <div key={item.id} className="text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-[8px] border border-white/5 flex justify-between items-center">
                          <span className="text-slate-300 truncate mr-2">{item.sanPham.tenSanPham}</span>
                          {item.soLuong > 1 && <span className="text-indigo-300 font-bold bg-indigo-500/20 px-1.5 py-0.5 rounded">x{item.soLuong}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 border-t border-white/5 flex gap-2 bg-black/20">
                  <button
                    onClick={() => handleLoadBuild(build.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-[12px] transition text-sm font-medium"
                  >
                    <Copy className="w-4 h-4" />
                    Load
                  </button>
                  <Link
                    href={`/api/build/${build.id}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-[12px] transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    Xem
                  </Link>
                  <button
                    onClick={() => handleDelete(build.id, build.tenCauHinh)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-[12px] transition text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
