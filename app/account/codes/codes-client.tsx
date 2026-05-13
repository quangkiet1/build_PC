'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, Package, Percent, Wrench } from 'lucide-react'

type OrderCode = {
  id: string
  maDonHang: string
  trangThai: string
  tongTien: number
  ngayTao: string | Date
}

type BuildCode = {
  id: string
  tenCauHinh: string | null
  tongGia: number
  isCompleted: boolean
  ngayTao: string | Date
  items: unknown[]
}

type CouponCode = {
  id: string
  maKhuyenMai: string
  tenKhuyenMai: string
  loaiGiamGia: 'PHAN_TRAM' | 'SO_TIEN'
  giaTriGiam: number
  phanTramGiam: number
  minOrderValue?: number | null
  ngayKetThuc: string | Date
  soLanConLai?: number
}

type TabKey = 'orders' | 'builds' | 'coupons'

const tabs: Array<{ key: TabKey; label: string; icon: typeof Package }> = [
  { key: 'orders', label: 'Ma don hang', icon: Package },
  { key: 'builds', label: 'Ma cau hinh PC', icon: Wrench },
  { key: 'coupons', label: 'Ma khuyen mai', icon: Percent },
]

export function CodesClient({
  orders,
  builds,
  coupons,
}: {
  orders: OrderCode[]
  builds: BuildCode[]
  coupons: CouponCode[]
}) {
  const [activeTab, setActiveTab] = useState<TabKey>('orders')
  const [copied, setCopied] = useState<string | null>(null)

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code)
    setCopied(code)
    window.setTimeout(() => setCopied(null), 1600)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const selected = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                selected
                  ? 'border-[#F7931A]/50 bg-[#F7931A]/10 text-[#FFD600]'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {activeTab === 'orders' && (
        <CodeGrid
          empty="Chua co don hang."
          items={orders.map((order) => ({
            id: order.id,
            code: order.maDonHang,
            title: order.trangThai,
            meta: `${formatPrice(order.tongTien)} - ${formatDate(order.ngayTao)}`,
            href: '/orders',
          }))}
          copied={copied}
          onCopy={copyCode}
        />
      )}

      {activeTab === 'builds' && (
        <CodeGrid
          empty="Chua co cau hinh PC da luu."
          items={builds.map((build) => ({
            id: build.id,
            code: build.id,
            title: build.tenCauHinh || 'Cau hinh PC',
            meta: `${build.items.length} linh kien - ${formatPrice(build.tongGia)} - ${formatDate(build.ngayTao)}`,
            href: '/my-builds',
          }))}
          copied={copied}
          onCopy={copyCode}
        />
      )}

      {activeTab === 'coupons' && (
        <CodeGrid
          empty="Chua co ma khuyen mai kha dung."
          items={coupons.map((coupon) => ({
            id: coupon.id,
            code: coupon.maKhuyenMai,
            title: coupon.tenKhuyenMai,
            meta: `${formatDiscount(coupon)}${coupon.minOrderValue ? ` - don tu ${formatPrice(coupon.minOrderValue)}` : ''} - den ${formatDate(coupon.ngayKetThuc)}`,
            href: '/cart',
          }))}
          copied={copied}
          onCopy={copyCode}
        />
      )}
    </div>
  )
}

function CodeGrid({
  items,
  empty,
  copied,
  onCopy,
}: {
  items: Array<{ id: string; code: string; title: string; meta: string; href: string }>
  empty: string
  copied: string | null
  onCopy: (code: string) => void
}) {
  if (items.length === 0) {
    return <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-10 text-center text-slate-400">{empty}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item) => (
        <article key={item.id} className="rounded-2xl border border-white/10 bg-[#0f1115] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-slate-500">{item.title}</p>
              <p className="mt-2 truncate font-mono text-xl font-bold text-[#FFD600]">{item.code}</p>
            </div>
            <button
              type="button"
              onClick={() => onCopy(item.code)}
              className="rounded-xl border border-white/10 p-2 text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm text-slate-400">{item.meta}</p>
          <Link href={item.href} className="mt-4 inline-flex text-sm font-semibold text-[#F7931A] transition hover:text-[#FFD600]">
            {copied === item.code ? 'Da sao chep' : 'Mo chi tiet'}
          </Link>
        </article>
      ))}
    </div>
  )
}

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })
}

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(value))
}

function formatDiscount(coupon: CouponCode) {
  return coupon.loaiGiamGia === 'SO_TIEN'
    ? coupon.giaTriGiam.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })
    : `${coupon.giaTriGiam || coupon.phanTramGiam}%`
}
