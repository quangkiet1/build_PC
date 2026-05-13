'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Scale, X } from 'lucide-react'
import { useCompare } from '@/components/compare-provider'

function formatPrice(value: number) {
  return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })
}

function specsOf(product: ReturnType<typeof useCompare>['products'][number]) {
  if (!product.thongSoKyThuat || typeof product.thongSoKyThuat !== 'object' || Array.isArray(product.thongSoKyThuat)) {
    return {}
  }

  return product.thongSoKyThuat as Record<string, unknown>
}

function valueText(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Khong co'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function different(values: string[]) {
  return new Set(values.map((item) => item.trim().toLowerCase())).size > 1
}

export default function ComparePage() {
  const { products, removeProduct, clear } = useCompare()
  const specKeys = Array.from(new Set(products.flatMap((product) => Object.keys(specsOf(product))))).sort()

  return (
    <main className="min-h-screen bg-[#030304] px-4 pb-32 pt-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/products" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#F7931A]">
              <ArrowLeft className="h-4 w-4" />
              Quay lai san pham
            </Link>
            <h1 className="flex items-center gap-3 text-3xl font-bold">
              <Scale className="h-7 w-7 text-[#FFD600]" />
              So sanh san pham
            </h1>
            <p className="mt-2 text-sm text-slate-400">Chon 2-3 san pham cung danh muc de xem khac biet ve gia, thuong hieu va thong so.</p>
          </div>
          {products.length > 0 && (
            <button
              type="button"
              onClick={clear}
              className="w-fit rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              Xoa tat ca
            </button>
          )}
        </header>

        {products.length < 2 ? (
          <section className="rounded-2xl border border-white/10 bg-[#0f1115] p-10 text-center">
            <Scale className="mx-auto h-10 w-10 text-slate-600" />
            <h2 className="mt-4 text-xl font-semibold">Can it nhat 2 san pham</h2>
            <p className="mt-2 text-sm text-slate-400">Hay quay lai danh sach san pham va bam nut so sanh tren ProductCard.</p>
            <Link href="/products" className="mt-6 inline-flex rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-5 py-3 text-sm font-semibold text-white">
              Chon san pham
            </Link>
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f1115]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] table-fixed">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="w-48 px-5 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Tieu chi</th>
                    {products.map((product) => (
                      <th key={product.id} className="px-5 py-4 text-left align-top">
                        <div className="flex items-start gap-3">
                          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/30">
                            {product.hinhAnh ? (
                              <Image src={product.hinhAnh.replace('via.placeholder.com', 'placehold.co')} alt={product.tenSanPham} fill className="object-contain p-2" />
                            ) : (
                              <div className="h-full w-full" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/products/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-white transition hover:text-[#F7931A]">
                              {product.tenSanPham}
                            </Link>
                            <p className="mt-1 text-xs text-slate-500">{product.danhMuc?.tenDanhMuc}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeProduct(product.id)}
                            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  <CompareRow label="Gia" values={products.map((product) => formatPrice(product.gia))} />
                  <CompareRow label="Thuong hieu" values={products.map((product) => product.thuongHieu || 'Khong co')} />
                  {specKeys.map((key) => (
                    <CompareRow key={key} label={key.replace(/_/g, ' ')} values={products.map((product) => valueText(specsOf(product)[key]))} />
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}

function CompareRow({ label, values }: { label: string; values: string[] }) {
  const hasDifference = different(values)

  return (
    <tr>
      <td className="px-5 py-4 text-sm font-medium capitalize text-slate-400">
        {label}
        {hasDifference && <span className="ml-2 rounded bg-[#F7931A]/10 px-2 py-0.5 text-[10px] uppercase tracking-widest text-[#FFD600]">Khac</span>}
      </td>
      {values.map((value, index) => (
        <td key={`${label}-${index}`} className={`px-5 py-4 text-sm ${hasDifference ? 'bg-[#F7931A]/5 text-white' : 'text-slate-300'}`}>
          {value}
        </td>
      ))}
    </tr>
  )
}
