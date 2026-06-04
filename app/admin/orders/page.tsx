'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Loader2, ClipboardList } from 'lucide-react'
import { useToast } from '@/app/providers/toast-provider'
import { useLocale, useTranslations } from 'next-intl'
import type { AppLocale } from '@/i18n/config'
import { formatCurrency, toIntlLocale } from '@/lib/format'

interface OrderItem {
  id: string
  soLuong: number
  giaBanLucMua: number
  sanPham: { tenSanPham: string }
}

interface User {
  hoTen: string
  email: string
}

interface Order {
  id: string
  maDonHang: string
  trangThai: string
  tongTien: number
  ngayTao: string
  nguoiDung: User
  chiTietDonHangs: OrderItem[]
  thanhToans: { phuongThuc: string; trangThai: string }[]
}

const statusOptions = ['CHO_XAC_NHAN', 'DA_XAC_NHAN', 'DANG_GIAO', 'DA_GIAO', 'DA_HUY'] as const

export default function AdminOrdersPage() {
  const t = useTranslations('admin.orders')
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const { addToast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders', { credentials: 'include' })
      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/orders')
        return
      }
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
      addToast(t('loadError'), 'error')
    } finally {
      setLoading(false)
    }
  }, [router, addToast, t])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ trangThai: status }),
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/orders')
        return
      }

      const data = await response.json()
      if (!response.ok) {
        throw new Error(t('updateError'))
      }

      setOrders((current) => current.map((order) => order.id === orderId ? data.order : order))
      addToast(t('updateSuccess'), 'success')
    } catch (error) {
      console.error('Error updating order status:', error)
      addToast(error instanceof Error ? error.message : t('orderUpdateError'), 'error')
    }
  }

  const filteredOrders = orders.filter((order) =>
    order.maDonHang.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.nguoiDung.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.nguoiDung.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalRevenue = orders.reduce((sum, order) => sum + order.tongTien, 0)
  const pending = orders.filter((order) => order.trangThai === 'CHO_XAC_NHAN').length
  const delivered = orders.filter((order) => order.trangThai === 'DA_GIAO').length

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
                <ClipboardList className="h-7 w-7 text-[#FFD600]" />
                {t('title')}
              </h1>
              <p className="mt-1 text-sm text-slate-400">{t('count', { count: orders.length })}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
            <p className="text-sm text-slate-400">{t('revenue')}</p>
            <p className="mt-4 text-3xl font-bold text-white">{formatCurrency(totalRevenue, locale)}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
            <p className="text-sm text-slate-400">{t('pending')}</p>
            <p className="mt-4 text-3xl font-bold text-white">{pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
            <p className="text-sm text-slate-400">{t('delivered')}</p>
            <p className="mt-4 text-3xl font-bold text-white">{delivered}</p>
          </div>
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
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.code')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.customer')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.total')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.status')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.payment')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.created')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                      {t('empty')}
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#141a26] transition">
                      <td className="px-5 py-4 text-sm font-medium text-white">{order.maDonHang}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        <div>{order.nguoiDung.hoTen}</div>
                        <div className="text-xs text-slate-500">{order.nguoiDung.email}</div>
                      </td>
                      <td className="px-5 py-4 text-sm text-white">{formatCurrency(order.tongTien, locale)}</td>
                      <td className="px-5 py-4 text-sm text-white">
                        <select
                          value={order.trangThai}
                          onChange={(event) => updateStatus(order.id, event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-[#111827] px-3 py-2 text-sm text-white outline-none transition focus:border-[#F7931A]/50"
                        >
                          {statusOptions.map((option) => (
                            <option key={option} value={option}>
                              {t(`status.${option}`)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {order.thanhToans[0]?.phuongThuc || 'COD'} - {order.thanhToans[0]?.trangThai || 'PENDING'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{new Date(order.ngayTao).toLocaleString(toIntlLocale(locale))}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
