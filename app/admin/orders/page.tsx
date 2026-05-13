'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Search, Loader2, ClipboardList } from 'lucide-react'
import { useToast } from '@/app/providers/toast-provider'

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

const statusOptions = [
  { value: 'CHO_XAC_NHAN', label: 'Chờ xác nhận' },
  { value: 'DA_XAC_NHAN', label: 'Đã xác nhận' },
  { value: 'DANG_GIAO', label: 'Đang giao' },
  { value: 'DA_GIAO', label: 'Đã giao' },
  { value: 'DA_HUY', label: 'Đã hủy' },
]

export default function AdminOrdersPage() {
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
      addToast('Không thể tải danh sách đơn hàng', 'error')
    } finally {
      setLoading(false)
    }
  }, [router, addToast])

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
        throw new Error(data.error || 'Lỗi khi cập nhật trạng thái')
      }

      setOrders((current) => current.map((order) => order.id === orderId ? data.order : order))
      addToast('Cập nhật trạng thái đơn hàng thành công', 'success')
    } catch (error) {
      console.error('Error updating order status:', error)
      addToast(error instanceof Error ? error.message : 'Lỗi khi cập nhật đơn hàng', 'error')
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
      <main className="min-h-screen bg-[#07080d] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
          <p className="text-slate-400">Đang tải đơn hàng...</p>
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
                <ClipboardList className="h-7 w-7 text-indigo-400" />
                Quản lý Đơn hàng
              </h1>
              <p className="mt-1 text-sm text-slate-400">{orders.length} đơn hàng đã được tạo.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
            <p className="text-sm text-slate-400">Tổng doanh thu</p>
            <p className="mt-4 text-3xl font-bold text-white">{totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
            <p className="text-sm text-slate-400">Đơn chờ xử lý</p>
            <p className="mt-4 text-3xl font-bold text-white">{pending}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
            <p className="text-sm text-slate-400">Đơn đã giao</p>
            <p className="mt-4 text-3xl font-bold text-white">{delivered}</p>
          </div>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách hàng hoặc email..."
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
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Mã đơn</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Khách hàng</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Tổng tiền</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Trạng thái</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Thanh toán</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Ngày tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-slate-500">
                      Không có đơn hàng phù hợp.
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
                      <td className="px-5 py-4 text-sm text-white">{order.tongTien.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                      <td className="px-5 py-4 text-sm text-white">
                        <select
                          value={order.trangThai}
                          onChange={(event) => updateStatus(order.id, event.target.value)}
                          className="w-full rounded-xl border border-slate-700 bg-[#111827] px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500/50"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {order.thanhToans[0]?.phuongThuc || 'COD'} - {order.thanhToans[0]?.trangThai || 'PENDING'}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-300">{new Date(order.ngayTao).toLocaleString('vi-VN')}</td>
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
