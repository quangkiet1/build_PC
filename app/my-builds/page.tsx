'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Trash2, Eye, Copy, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import type { AppLocale } from '@/i18n/config'
import { formatCurrency, formatDate } from '@/lib/format'
import { getLocalizedApiError } from '@/lib/localized-api-error'

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
  const t = useTranslations('myBuilds')
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'completed' | 'incomplete'>('all')

  const fetchBuilds = useCallback(async () => {
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
        setError(getLocalizedApiError(data, locale, t('loadError')))
        return
      }

      setBuilds(data.builds)
    } catch (err) {
      setError(t('networkError'))
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filter, locale, t])

  useEffect(() => {
    fetchBuilds()
  }, [fetchBuilds])

  const handleDelete = async (buildId: string, buildName: string) => {
    if (!window.confirm(t('deleteConfirm', { name: buildName }))) {
      return
    }

    try {
      const res = await fetch(`/api/build/${buildId}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        toast.error(t('deleteError'))
        return
      }

      setBuilds((prev) => prev.filter((b) => b.id !== buildId))
      toast.success(t('deleteSuccess'))
    } catch (err) {
      toast.error(t('deleteError'))
      console.error(err)
    }
  }

  const handleLoadBuild = (buildId: string) => {
    // Load build để chỉnh sửa
    router.push(`/builder?loadId=${buildId}`)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#030304] text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-3/4 w-3/4 bg-radial-blur" />
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-3/4 w-3/4 bg-radial-blur" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{t('title')}</h1>
          <p className="text-slate-400">{t('description')}</p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex gap-3 flex-wrap">
          {(['all', 'completed', 'incomplete'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-[12px] font-medium transition-all backdrop-blur-md border ${
                filter === f
                  ? 'border-[#F7931A]/45 bg-[#F7931A]/10 text-[#FFD600] shadow-[0_0_15px_rgba(247,147,26,0.18)]'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              {t(`filters.${f}`)}
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
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#F7931A]"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && builds.length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl border border-white/10 rounded-[24px] shadow-xl">
            <AlertCircle className="mx-auto mb-6 h-16 w-16 text-[#F7931A]/55" />
            <h3 className="text-2xl font-bold text-white mb-2">{t('emptyTitle')}</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">{t('emptyDescription')}</p>
            <Link
              href="/builder"
              className="inline-block rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-8 py-3 font-semibold text-white shadow-[0_0_20px_rgba(247,147,26,0.28)] transition hover:brightness-110"
            >
              {t('create')}
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
            {builds.map((build) => (
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
                }}
                key={build.id}
                className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0F1115]/85 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F7931A]/35 hover:shadow-[0_10px_30px_rgba(247,147,26,0.14)]"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-white/5 bg-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 pr-2">
                      <h3 className="text-lg font-semibold text-white truncate">{build.tenCauHinh}</h3>
                      <p className="text-sm text-slate-400 mt-1">{t('componentCount', { count: build.itemCount })}</p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {build.isCompleted && (
                        <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded">{t('completed')}</span>
                      )}
                      {build.isPublic && (
                        <span className="rounded bg-[#F7931A]/15 px-2 py-1 text-xs text-[#FFD600]">{t('public')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Price */}
                  <div className="bg-black/20 rounded-[12px] p-3 border border-white/5">
                    <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">{t('total')}</p>
                    <p className="text-2xl font-bold text-[#FFD600]">{formatCurrency(build.tongGia, locale)}</p>
                  </div>

                  {/* Date */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">{t('created')}</p>
                    <p className="text-sm font-medium text-slate-300">{formatDate(build.ngayTao, locale)}</p>
                  </div>

                  {/* Items Preview */}
                  <div>
                    <p className="text-xs text-slate-500 mb-2">{t('components', { count: build.itemCount })}</p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {build.items.map((item) => (
                        <div key={item.id} className="text-xs text-slate-400 bg-white/5 px-3 py-2 rounded-[8px] border border-white/5 flex justify-between items-center">
                          <span className="text-slate-300 truncate mr-2">{item.sanPham.tenSanPham}</span>
                          {item.soLuong > 1 && <span className="rounded bg-[#F7931A]/15 px-1.5 py-0.5 font-bold text-[#FFD600]">x{item.soLuong}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer - Actions */}
                <div className="p-4 border-t border-white/5 flex gap-2 bg-black/20">
                  <button
                    onClick={() => handleLoadBuild(build.id)}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#F7931A]/30 bg-[#F7931A]/10 px-3 py-2.5 text-sm font-medium text-[#FFD600] transition hover:bg-[#F7931A]/20"
                  >
                    <Copy className="w-4 h-4" />
                    {t('load')}
                  </button>
                  <Link
                    href={`/api/build/${build.id}`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-[12px] transition text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    {t('view')}
                  </Link>
                  <button
                    onClick={() => handleDelete(build.id, build.tenCauHinh)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-[12px] transition text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    {t('delete')}
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
