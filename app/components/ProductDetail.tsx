'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useToast } from '@/app/providers/toast-provider'
import { useCart } from '@/app/providers/cart-provider'
import {
  ShoppingCart,
  Star,
  Shield,
  Truck,
  RotateCcw,
  ChevronRight,
  Minus,
  Plus,
  Heart,
  Zap,
  Check
} from 'lucide-react'

interface Product {
  id: string
  tenSanPham: string
  slug: string
  gia: number
  giaBan?: number
  hinhAnh?: string | null
  hinhAnhs?: string[]
  moTa?: string | null
  soLuongTon: number
  rating?: number
  reviewCount?: number
  thongSoKyThuat?: any
  danhMuc?: {
    id: string
    tenDanhMuc: string
    moTa?: string | null
  }
  isSale?: boolean
  isNew?: boolean
  brand?: string
  createdAt?: Date
  updatedAt?: Date
}

interface ProductDetailProps {
  product: Product
  relatedProducts?: Product[]
}

const mockReviews = [
  {
    id: 1,
    user: 'Nguyễn Văn A',
    avatar: 'NA',
    rating: 5,
    date: '15/03/2026',
    comment: 'Sản phẩm chất lượng tốt, đúng như mô tả. Giao hàng nhanh, đóng gói cẩn thận. Hiệu năng vượt mong đợi!'
  },
  {
    id: 2,
    user: 'Trần Thị B',
    avatar: 'TB',
    rating: 4,
    date: '10/03/2026',
    comment: 'Sản phẩm ổn, nhiệt độ thấp khi gaming. Giá cả hợp lý so với hiệu năng.'
  },
  {
    id: 3,
    user: 'Lê Minh C',
    avatar: 'LC',
    rating: 5,
    date: '05/03/2026',
    comment: 'Rất hài lòng với sản phẩm! PC Builder phục vụ tốt, sẽ quay lại mua thêm.'
  }
]

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs')
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [inCart, setInCart] = useState(false)
  const { addToast } = useToast()
  const { addItem, fetchCartCount } = useCart()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price)
  }

  const discount = product.giaBan
    ? Math.round((1 - product.gia / product.giaBan) * 100)
    : 0

  const rating = product.rating || 4.5
  const reviewCount = product.reviewCount || 100

  const ratingDistribution = [
    { stars: 5, count: 70 },
    { stars: 4, count: 20 },
    { stars: 3, count: 7 },
    { stars: 2, count: 2 },
    { stars: 1, count: 1 }
  ]

  const handleAddToCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Lỗi khi thêm vào giỏ hàng')
      }

      addToast('✓ Đã thêm vào giỏ hàng', 'success')
      setInCart(true)
      addItem(product.id)
      fetchCartCount()
      setTimeout(() => setInCart(false), 2000)
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Lỗi khi thêm vào giỏ hàng', 'error')
    }
  }

  const specs = product.thongSoKyThuat || {}

  return (
    <div className="min-h-screen text-white">
      {/* Breadcrumb */}
      <div className="bg-[#0a0b10] border-b border-[#1e2535] py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 overflow-x-auto">
            <Link href="/" className="hover:text-indigo-400 transition-colors whitespace-nowrap">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            <Link href="/products" className="hover:text-indigo-400 transition-colors whitespace-nowrap">
              Sản phẩm
            </Link>
            <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            {product.danhMuc && (
              <>
                <Link
                  href={`/products?category=${product.danhMuc.id}`}
                  className="hover:text-indigo-400 transition-colors whitespace-nowrap capitalize"
                >
                  {product.danhMuc.tenDanhMuc}
                </Link>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </>
            )}
            <span className="text-slate-300 truncate max-w-xs">{product.tenSanPham}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Product Image */}
          <div>
            <div className="bg-[#0f1117] border border-[#1e2535] rounded-2xl overflow-hidden aspect-square relative group">
              {product.hinhAnh ? (
                <img
                  src={product.hinhAnh}
                  alt={product.tenSanPham}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🖼️</div>
                    <span className="text-xl">Không có ảnh</span>
                  </div>
                </div>
              )}

              {product.isSale && discount > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-lg">
                  -{discount}%
                </div>
              )}
              {product.isNew && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500 text-white text-sm font-bold rounded-lg">
                  MỚI
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.hinhAnhs && product.hinhAnhs.length > 0 ? (
              <div className="flex gap-2 mt-3">
                {product.hinhAnhs.slice(0, 4).map((img, i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      i === 0 ? 'border-indigo-500' : 'border-[#1e2535] hover:border-indigo-500/50'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-2 mt-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`w-16 h-16 rounded-lg overflow-hidden border cursor-pointer transition-all ${
                      i === 0 ? 'border-indigo-500' : 'border-[#1e2535] hover:border-indigo-500/50'
                    }`}
                  >
                    <img
                      src={product.hinhAnh || '/placeholder.png'}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand & Badges */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-indigo-400 font-medium">{product.brand || 'Chính hãng'}</span>
              {product.isNew && (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs rounded-full">
                  Mới
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-white font-bold text-2xl sm:text-3xl mb-3 leading-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              {product.tenSanPham}
            </h1>

            {/* Rating */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.floor(rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-amber-400 font-medium">{rating.toFixed(1)}</span>
              <span className="text-slate-500 text-sm">({reviewCount} đánh giá)</span>
              <span
                className={`text-sm font-medium ${
                  product.soLuongTon > 10
                    ? 'text-emerald-400'
                    : product.soLuongTon > 0
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {product.soLuongTon > 10
                  ? '✓ Còn hàng'
                  : product.soLuongTon > 0
                  ? `⚠ Còn ${product.soLuongTon} sản phẩm`
                  : '✗ Hết hàng'}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 p-4 bg-[#0f1117] border border-[#1e2535] rounded-xl">
              <span className="text-3xl font-bold text-indigo-400">{formatPrice(product.gia)}</span>
              {product.giaBan && (
                <>
                  <span className="text-slate-500 line-through text-lg">{formatPrice(product.giaBan)}</span>
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-sm rounded-lg font-medium">
                    Tiết kiệm {formatPrice(product.giaBan - product.gia)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            {product.moTa && (
              <p className="text-slate-400 text-sm leading-relaxed mb-6">{product.moTa}</p>
            )}

            {/* Key Specs */}
            {Object.keys(specs).length > 0 && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                {Object.entries(specs)
                  .slice(0, 4)
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-[#0f1117] border border-[#1e2535] rounded-lg p-2.5"
                    >
                      <p className="text-slate-500 text-xs mb-0.5">{key}</p>
                      <p className="text-slate-200 text-sm font-medium">{String(value)}</p>
                    </div>
                  ))}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-4">
              <span className="text-slate-400 text-sm">Số lượng:</span>
              <div className="flex items-center border border-[#1e2535] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 bg-[#0f1117] text-slate-400 hover:text-white hover:bg-[#1a1d26] transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 bg-[#0f1117] text-white border-x border-[#1e2535] min-w-[3rem] text-center font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.soLuongTon, q + 1))}
                  className="px-3 py-2 bg-[#0f1117] text-slate-400 hover:text-white hover:bg-[#1a1d26] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-6 flex-wrap">
              <button
                onClick={handleAddToCart}
                disabled={product.soLuongTon === 0}
                className={`flex-1 min-w-40 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                  inCart
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : product.soLuongTon === 0
                    ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-lg hover:shadow-indigo-500/30'
                }`}
              >
                <ShoppingCart className="w-5 h-5" />
                {inCart ? 'Đã thêm vào giỏ' : 'Thêm vào giỏ hàng'}
              </button>
              <Link
                href="/cart"
                onClick={handleAddToCart}
                className="px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-medium transition-all"
              >
                Mua ngay
              </Link>
              <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-3 rounded-xl transition-all ${
                  isWishlisted
                    ? 'bg-red-500/20 border border-red-500/30 text-red-400'
                    : 'bg-[#0f1117] border border-[#1e2535] text-slate-400 hover:text-red-400 hover:border-red-500/50'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Shield, text: 'Chính hãng 100%' },
                { icon: Truck, text: 'Miễn phí vận chuyển' },
                { icon: RotateCcw, text: 'Đổi trả 7 ngày' }
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex flex-col items-center gap-1.5 p-2 bg-[#0f1117] border border-[#1e2535] rounded-lg"
                >
                  <Icon className="w-4 h-4 text-indigo-400" />
                  <span className="text-slate-400 text-xs text-center">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs: Specs & Reviews */}
        <div className="mb-10">
          <div className="flex border-b border-[#1e2535] mb-6 overflow-x-auto">
            {(['specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap -mb-px ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-500 hover:text-white'
                }`}
              >
                {tab === 'specs'
                  ? 'Thông số kỹ thuật'
                  : `Đánh giá (${reviewCount})`}
              </button>
            ))}
          </div>

          {activeTab === 'specs' ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {Object.entries(specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 bg-[#0f1117] border border-[#1e2535] rounded-xl"
                >
                  <span className="text-slate-500 text-sm">{key}</span>
                  <span className="text-slate-200 text-sm font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Rating Overview */}
              <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-5">
                <div className="text-center mb-4">
                  <p className="text-5xl font-bold text-indigo-400">
                    {rating.toFixed(1)}
                  </p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= Math.floor(rating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-600'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-500 text-sm">{reviewCount} đánh giá</p>
                </div>
                <div className="space-y-2">
                  {ratingDistribution.map(({ stars, count }) => (
                    <div key={stars} className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs w-4">{stars}</span>
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <div className="flex-1 h-1.5 bg-[#1a1d26] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full"
                          style={{ width: `${count}%` }}
                        />
                      </div>
                      <span className="text-slate-500 text-xs w-6">{count}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review List */}
              <div className="lg:col-span-2 space-y-4">
                {mockReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                          {review.avatar}
                        </div>
                        <div>
                          <p className="text-slate-200 text-sm font-medium">
                            {review.user}
                          </p>
                          <p className="text-slate-500 text-xs">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2
              className="text-white font-bold text-xl mb-4"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Sản phẩm tương tự
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.slug}`}
                  className="group bg-[#0f1117] border border-[#1e2535] rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all"
                >
                  <div className="relative h-40 bg-slate-900 overflow-hidden">
                    {p.hinhAnh && (
                      <img
                        src={p.hinhAnh}
                        alt={p.tenSanPham}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-indigo-400 mb-1">
                      {p.brand || 'Chính hãng'}
                    </p>
                    <h3 className="text-slate-200 font-medium text-sm line-clamp-2 mb-2">
                      {p.tenSanPham}
                    </h3>
                    <p className="text-indigo-400 font-bold text-sm">
                      {formatPrice(p.gia)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
