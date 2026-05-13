'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Percent, Copy, CheckCircle2, Tag, Clock, Sparkles } from 'lucide-react'

interface Promotion {
  id: string
  maKhuyenMai: string
  tenKhuyenMai: string
  phanTramGiam: number
  ngayBatDau: string
  ngayKetThuc: string
  isActive: boolean
}

interface ProductPromotion {
  id: string
  sanPhamId: string
  tenSanPham: string
  gia: number
  phanTramGiam: number
  giaSauGiam: number
  ngayBatDau: string
  ngayKetThuc: string
  isActive: boolean
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [productPromotions, setProductPromotions] = useState<ProductPromotion[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/promotions')
      const data = await response.json()
      setPromotions(data.promotions || [])
      setProductPromotions(data.productPromotions || [])
    } catch (error) {
      console.error('Error fetching promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const isPromotionActive = (promo: Promotion) => {
    const now = new Date()
    return promo.isActive && now >= new Date(promo.ngayBatDau) && now <= new Date(promo.ngayKetThuc)
  }

  const isProductPromotionActive = (promo: ProductPromotion) => {
    const now = new Date()
    return promo.isActive && now >= new Date(promo.ngayBatDau) && now <= new Date(promo.ngayKetThuc)
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN')

  const formatPrice = (value: number) =>
    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-16 w-16 rounded-2xl bg-[#0f1117] border border-[#1e2535] mx-auto mb-4" />
          <p className="text-slate-400">Đang tải khuyến mãi...</p>
        </div>
      </div>
    )
  }

  const activePromotions = promotions.filter(isPromotionActive)
  const activeProductPromotions = productPromotions.filter(isProductPromotionActive)

  return (
    <div className="min-h-screen bg-[#07080d] text-white">
      {/* Header */}
      <div className="bg-[#0a0b10] border-b border-[#1e2535]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Khuyến mãi</h1>
              <p className="text-slate-400 text-sm">Mã giảm giá và ưu đãi đặc biệt dành cho bạn</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Global Promotion Codes */}
        {activePromotions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <Tag className="w-5 h-5 text-indigo-400" />
              Mã khuyến mãi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-[#0f1117] border border-[#1e2535] rounded-2xl p-6 hover:border-indigo-500/30 transition group"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Mã khuyến mãi</p>
                      <p className="text-xl font-bold font-mono text-indigo-400 tracking-wider">
                        {promo.maKhuyenMai}
                      </p>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <span className="text-2xl font-bold text-emerald-400">{promo.phanTramGiam}%</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium text-white mb-3">{promo.tenKhuyenMai}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDate(promo.ngayBatDau)} - {formatDate(promo.ngayKetThuc)}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(promo.maKhuyenMai)}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition flex items-center justify-center gap-2"
                  >
                    {copiedCode === promo.maKhuyenMai ? (
                      <><CheckCircle2 className="w-4 h-4" /> Đã sao chép!</>
                    ) : (
                      <><Copy className="w-4 h-4" /> Sao chép mã</>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Product-Specific Promotions */}
        {activeProductPromotions.length > 0 && (
          <section>
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <Percent className="w-5 h-5 text-rose-400" />
              Sản phẩm đang giảm giá
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeProductPromotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-[#0f1117] border border-[#1e2535] rounded-2xl overflow-hidden hover:border-rose-500/30 transition group relative"
                >
                  <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-lg bg-rose-500/90 text-white text-xs font-bold">
                    -{promo.phanTramGiam}%
                  </div>

                  <div className="bg-[#141a26] h-44 flex items-center justify-center">
                    <span className="text-slate-600 text-sm">Sản phẩm</span>
                  </div>

                  <div className="p-4 space-y-3">
                    <h3 className="font-semibold text-sm text-white line-clamp-2 leading-snug">
                      {promo.tenSanPham}
                    </h3>

                    <div>
                      <p className="text-xs text-slate-500 line-through">{formatPrice(promo.gia)}</p>
                      <p className="text-lg font-bold text-rose-400">{formatPrice(Math.round(promo.giaSauGiam))}</p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      Đến {formatDate(promo.ngayKetThuc)}
                    </div>

                    <Link
                      href="/products"
                      className="block w-full py-2 rounded-xl border border-[#1e2535] text-center text-sm text-slate-300 hover:border-indigo-500/50 hover:text-white transition"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {activePromotions.length === 0 && activeProductPromotions.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-[#0f1117] border border-[#1e2535] mx-auto mb-5 flex items-center justify-center">
              <Percent className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Chưa có khuyến mãi</h3>
            <p className="text-slate-400 mb-6">Hiện tại chưa có chương trình khuyến mãi nào đang hoạt động.</p>
            <Link href="/products" className="inline-flex px-6 py-3 gaming-gradient rounded-xl text-white font-semibold transition">
              Khám phá sản phẩm
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
