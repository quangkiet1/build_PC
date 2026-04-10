'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ShoppingCart,
  Minus,
  Plus,
  X,
  ChevronRight,
  Shield,
  Truck,
  Tag,
  ArrowRight,
  CreditCard,
  Banknote,
  CheckCircle2,
  Wrench
} from 'lucide-react'

const SHIPPING_FREE_THRESHOLD = 5000000
const SHIPPING_COST = 50000

const shippingOptions = [
  { id: 'standard', name: 'Giao hàng tiêu chuẩn', price: 30000, days: '3-5 ngày' },
  { id: 'express', name: 'Giao hàng nhanh', price: 50000, days: '1-2 ngày' },
  { id: 'pickup', name: 'Nhận tại cửa hàng', price: 0, days: 'Ngay lập tức' }
]

const formatPrice = (value: number) =>
  value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })

type CartProduct = {
  id: string
  slug: string
  tenSanPham: string
  gia: number
  hinhAnh?: string | null
  danhMuc?: { tenDanhMuc: string } | null
}

type CartItem = {
  id: string
  soLuong: number
  sanPham: CartProduct
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [selectedShipping, setSelectedShipping] = useState(shippingOptions[0].id)
  const [processing, setProcessing] = useState(false)
  const [couponMessage, setCouponMessage] = useState<string | null>(null)

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.sanPham.gia * item.soLuong, 0),
    [items]
  )

  const shippingValue = useMemo(() => {
    const option = shippingOptions.find((option) => option.id === selectedShipping)
    return option?.price ?? SHIPPING_COST
  }, [selectedShipping])

  const shippingCost = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : shippingValue
  const discount = couponApplied ? Math.round(subtotal * 0.05) : 0
  const totalPrice = subtotal + shippingCost - discount
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.soLuong, 0),
    [items]
  )

  const fetchCart = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/cart')
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Không thể tải giỏ hàng. Vui lòng thử lại sau.')
        setItems([])
      } else {
        setItems(data.cart?.items ?? [])
      }
    } catch {
      setError('Không thể kết nối đến server. Vui lòng kiểm tra lại mạng.')
      setItems([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [])

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return
    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Cập nhật số lượng thất bại.')
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, soLuong: quantity } : item
          )
        )
      }
    } catch {
      setError('Không thể cập nhật giỏ hàng. Vui lòng thử lại.')
    } finally {
      setProcessing(false)
    }
  }

  const removeItem = async (itemId: string) => {
    setProcessing(true)
    setError(null)

    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Xóa sản phẩm thất bại.')
      } else {
        setItems((prev) => prev.filter((item) => item.id !== itemId))
      }
    } catch {
      setError('Không thể xóa sản phẩm khỏi giỏ hàng.')
    } finally {
      setProcessing(false)
    }
  }

  const clearCart = async () => {
    if (items.length === 0) return
    setProcessing(true)
    setError(null)

    try {
      await Promise.all(
        items.map((item) =>
          fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id })
          })
        )
      )
      setItems([])
      setCouponApplied(false)
      setCouponCode('')
    } catch {
      setError('Không thể xóa toàn bộ giỏ hàng.')
    } finally {
      setProcessing(false)
    }
  }

  const handleCoupon = () => {
    const normalized = couponCode.trim().toUpperCase()
    if (normalized === 'COREBUILD5') {
      setCouponApplied(true)
      setCouponMessage('Mã giảm giá đã được áp dụng.')
    } else {
      setCouponApplied(false)
      setCouponMessage('Mã giảm giá không hợp lệ.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center">
          <div className="animate-pulse h-24 w-24 rounded-3xl bg-[#0f1117] border border-[#1e2535] mx-auto mb-6" />
          <div className="h-8 bg-slate-800 rounded-xl mx-auto mb-3 w-48" />
          <div className="h-4 bg-slate-800 rounded-xl mx-auto mb-4 w-64" />
          <div className="grid gap-3 mt-8">
            <div className="h-20 bg-slate-800 rounded-3xl" />
            <div className="h-20 bg-slate-800 rounded-3xl" />
            <div className="h-20 bg-slate-800 rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center">
          <div className="w-24 h-24 rounded-3xl bg-[#0f1117] border border-[#1e2535] mx-auto mb-6 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Không thể tải giỏ hàng</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/products" className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-semibold transition">
              Quay lại sản phẩm
            </Link>
            <Link href="/builder" className="w-full sm:w-auto px-5 py-3 border border-[#1e2535] rounded-xl text-slate-200 hover:border-indigo-500 transition flex items-center justify-center gap-2">
              <Wrench className="w-4 h-4" /> PC Builder
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="bg-[#0a0b10] border-b border-[#1e2535] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Giỏ hàng</h1>
            <p className="text-slate-400 text-sm mt-1">{totalItems} sản phẩm trong giỏ của bạn</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="text-indigo-400">Giỏ hàng</span>
              <ChevronRight className="w-4 h-4" />
              <span>Thanh toán</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 mb-6">
            {error}
          </div>
        ) : null}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="grid gap-4">
              {items.map((item) => (
                <div key={item.id} className="bg-[#0f1117] border border-[#1e2535] rounded-3xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <Link href={`/products/${item.sanPham.slug}`} className="w-full md:w-28 h-28 rounded-3xl bg-[#141827] flex items-center justify-center overflow-hidden">
                    {item.sanPham.hinhAnh ? (
                      <Image
                        src={item.sanPham.hinhAnh}
                        alt={item.sanPham.tenSanPham}
                        width={112}
                        height={112}
                        className="object-contain"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-slate-500">Ảnh</div>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase text-indigo-400 tracking-[0.18em] mb-2">
                          {item.sanPham.danhMuc?.tenDanhMuc ?? 'Phụ kiện'}
                        </p>
                        <Link href={`/products/${item.sanPham.slug}`} className="text-lg font-semibold text-white line-clamp-2 hover:text-indigo-300 transition">
                          {item.sanPham.tenSanPham}
                        </Link>
                        <p className="text-slate-500 text-sm mt-2">ID: {item.sanPham.id}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        disabled={processing}
                        className="text-slate-500 hover:text-red-400 transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-2 rounded-full border border-[#2a3045] bg-[#141827] p-1">
                        <button
                          onClick={() => updateQuantity(item.id, item.soLuong - 1)}
                          disabled={processing || item.soLuong <= 1}
                          className="w-10 h-10 rounded-full bg-[#1a1d26] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#252b3b] transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center text-white font-medium">{item.soLuong}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.soLuong + 1)}
                          disabled={processing}
                          className="w-10 h-10 rounded-full bg-[#1a1d26] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#252b3b] transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="text-indigo-300 font-semibold">{formatPrice(item.sanPham.gia * item.soLuong)}</p>
                        <p className="text-slate-500 text-xs">{formatPrice(item.sanPham.gia)} / cái</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#141827] border border-[#1e2535] text-slate-300 hover:text-white transition">
                <ArrowRight className="w-4 h-4 rotate-180" /> Tiếp tục mua sắm
              </Link>
              <button
                onClick={clearCart}
                disabled={processing}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-red-500/20 text-red-400 hover:bg-red-500/10 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="w-4 h-4" /> Xóa tất cả
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0f1117] border border-[#1e2535] rounded-3xl overflow-hidden sticky top-6">
              <div className="p-6 border-b border-[#1e2535]">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Tóm tắt đơn hàng</p>
                <h2 className="text-2xl font-semibold text-white">Thanh toán nhanh</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Phí vận chuyển</span>
                  <span className={shippingCost === 0 ? 'text-emerald-400' : 'text-slate-300'}>{shippingCost === 0 ? 'Miễn phí' : formatPrice(shippingCost)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>Giảm giá COREBUILD5</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator className="bg-[#1e2535]" />
                <div className="flex justify-between items-baseline gap-4">
                  <span className="text-slate-300 font-semibold">Tổng</span>
                  <span className="text-3xl font-bold text-indigo-400">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-slate-500">Mua thêm {formatPrice(Math.max(0, SHIPPING_FREE_THRESHOLD - subtotal))} để được miễn phí vận chuyển</p>
                <Button size="lg" className="w-full gaming-gradient" disabled={processing || items.length === 0}>
                  <CreditCard className="w-5 h-5 mr-2" /> Xác nhận thanh toán
                </Button>
              </div>
            </div>

            <div className="bg-[#0f1117] border border-[#1e2535] rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Mã giảm giá</p>
                  <p className="text-xs text-slate-500">Dùng COREBUILD5 để giảm 5%</p>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="w-full rounded-2xl border border-[#2a3045] bg-[#141827] py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
                    placeholder="Nhập mã giảm giá"
                  />
                </div>
                <button
                  onClick={handleCoupon}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white transition"
                >
                  Áp dụng
                </button>
              </div>
              {couponMessage ? (
                <p className={`text-sm ${couponApplied ? 'text-emerald-400' : 'text-rose-400'}`}>{couponMessage}</p>
              ) : null}
            </div>

            <div className="bg-[#0f1117] border border-[#1e2535] rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Shield className="w-5 h-5 text-emerald-400" />
                <span>Bảo mật thanh toán và giao dịch nhanh chóng.</span>
              </div>
              <div className="grid gap-3">
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Chính sách đổi trả 30 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <Truck className="w-4 h-4 text-slate-400" />
                  <span>Vận chuyển nhanh và theo dõi đơn hàng miễn phí</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-sm">
                  <Banknote className="w-4 h-4 text-slate-400" />
                  <span>Thanh toán khi nhận hàng hoặc chuyển khoản</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
