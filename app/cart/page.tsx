'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/AuthContext'
import { ProtectedLink } from '@/components/ProtectedLink'
import {
  ShoppingCart,
  Minus,
  Plus,
  X,
  Shield,
  Truck,
  Tag,
  ArrowRight,
  CreditCard,
  Banknote,
  CheckCircle2,
  Wrench,
  MapPin,
  Wallet,
  ChevronDown,
  PackageCheck,
  Loader2,
  ArrowLeft
} from 'lucide-react'

const SHIPPING_FREE_THRESHOLD = 5000000

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
  const t = useTranslations('cartPage')
  const locale = useLocale()
  const { requireAuth } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [couponMessage, setCouponMessage] = useState<string | null>(null)

  // Checkout state
  const [shippingAddress, setShippingAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [submitting, setSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null)

  const paymentMethods = [
    { id: 'COD', label: t('paymentMethods.COD.label'), desc: t('paymentMethods.COD.desc'), icon: Banknote },
    { id: 'VNPAY', label: t('paymentMethods.VNPAY.label'), desc: t('paymentMethods.VNPAY.desc'), icon: Wallet },
    { id: 'MOMO', label: t('paymentMethods.MOMO.label'), desc: t('paymentMethods.MOMO.desc'), icon: CreditCard }
  ]

  const formatPrice = (value: number) =>
    value.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 })

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.sanPham.gia * item.soLuong, 0),
    [items]
  )

  const shippingCost = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : 50000
  const discount = couponApplied ? Math.round(subtotal * 0.05) : 0
  const totalPrice = subtotal + shippingCost - discount
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.soLuong, 0),
    [items]
  )

  const canCheckout =
    items.length > 0 &&
    !submitting &&
    !processing &&
    shippingAddress.trim().length >= 10

  const fetchCart = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/cart', { credentials: 'include' })
      const data = await response.json()
      if (!response.ok) {
        if (response.status === 401) {
          setError(t('needLogin'))
          setItems([])
          return
        }
        setError(data.error || t('loadError'))
        setItems([])
      } else {
        setItems(data.cart?.items ?? [])
      }
    } catch {
      setError(t('networkError'))
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || t('updateFailed'))
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === itemId ? { ...item, soLuong: quantity } : item
          )
        )
      }
    } catch {
      setError(t('updateNetwork'))
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
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || t('removeFailed'))
      } else {
        setItems((prev) => prev.filter((item) => item.id !== itemId))
      }
    } catch {
      setError(t('removeNetwork'))
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
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ itemId: item.id })
          })
        )
      )
      setItems([])
      setCouponApplied(false)
      setCouponCode('')
    } catch {
      setError(t('clearFailed'))
    } finally {
      setProcessing(false)
    }
  }

  const handleCoupon = () => {
    const normalized = couponCode.trim().toUpperCase()
    if (normalized === 'COREBUILD5') {
      setCouponApplied(true)
      setCouponMessage(t('couponApplied'))
    } else {
      setCouponApplied(false)
      setCouponMessage(t('couponInvalid'))
    }
  }

  const submitOrder = async () => {
    if (!canCheckout) return
    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shippingAddress: shippingAddress.trim(),
          paymentMethod
        })
      })
      const data = await response.json()

      if (response.status === 401) {
        await requireAuth(submitOrder, { nextUrl: '/cart', reason: 'required' })
        return
      }

      if (!response.ok) {
        setError(data.error || t('createOrderFailed'))
        return
      }

      setOrderSuccess(data.order.maDonHang)
      setItems([])
      setCouponApplied(false)
      setCouponCode('')
      setShippingAddress('')
    } catch {
      setError(t('createOrderNetwork'))
    } finally {
      setSubmitting(false)
    }
  }

  const handlePlaceOrder = async () => {
    await requireAuth(submitOrder, { nextUrl: '/cart', reason: 'required' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center">
          <div className="animate-pulse h-24 w-24 rounded-3xl bg-[#0f1117] border border-[#1e2535] mx-auto mb-6" />
          <div className="h-8 bg-slate-800/60 rounded-xl mx-auto mb-3 w-48" />
          <div className="h-4 bg-slate-800/40 rounded-xl mx-auto mb-4 w-64" />
          <div className="grid gap-3 mt-8">
            <div className="h-20 bg-slate-800/30 rounded-2xl" />
            <div className="h-20 bg-slate-800/30 rounded-2xl" />
            <div className="h-20 bg-slate-800/30 rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 mx-auto mb-6 flex items-center justify-center">
            <PackageCheck className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-3xl font-bold mb-3">{t('orderSuccess')}</h2>
          <p className="text-slate-400 mb-2">{t('orderCreated')}</p>
          <p className="text-lg font-semibold text-indigo-400 mb-8">{t('orderCode', { code: orderSuccess })}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/products" className="w-full sm:w-auto px-6 py-3 gaming-gradient rounded-xl text-white font-semibold transition">
              {t('continueShopping')}
            </Link>
            <Link href="/profile" className="w-full sm:w-auto px-6 py-3 border border-[#1e2535] rounded-xl text-slate-200 hover:border-indigo-500 transition">
              {t('viewAccount')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (error && items.length === 0) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center">
          <div className="w-24 h-24 rounded-3xl bg-[#0f1117] border border-[#1e2535] mx-auto mb-6 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-3xl font-bold mb-3">{t('loadCartTitle')}</h2>
          <p className="text-slate-400 mb-8">{error}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/products" className="w-full sm:w-auto px-5 py-3 gaming-gradient rounded-xl text-white font-semibold transition">
              {t('backToProducts')}
            </Link>
            <ProtectedLink href="/builder" className="w-full sm:w-auto px-5 py-3 border border-[#1e2535] rounded-xl text-slate-200 hover:border-indigo-500 transition flex items-center justify-center gap-2">
              <Wrench className="w-4 h-4" /> {t('builderCta')}
            </ProtectedLink>
          </div>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#07080d] text-white flex items-center justify-center px-4 py-12">
        <div className="max-w-xl w-full text-center">
          <div className="w-24 h-24 rounded-3xl bg-[#0f1117] border border-[#1e2535] mx-auto mb-6 flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-slate-500" />
          </div>
          <h2 className="text-3xl font-bold mb-3">{t('emptyTitle')}</h2>
          <p className="text-slate-400 mb-8">{t('emptyDescription')}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/products" className="w-full sm:w-auto px-6 py-3 gaming-gradient rounded-xl text-white font-semibold transition">
              {t('exploreProducts')}
            </Link>
            <ProtectedLink href="/builder" className="w-full sm:w-auto px-6 py-3 border border-[#1e2535] rounded-xl text-slate-200 hover:border-indigo-500 transition flex items-center justify-center gap-2">
              <Wrench className="w-4 h-4" /> {t('builderCta')}
            </ProtectedLink>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#07080d] text-white">
      {/* Header */}
      <div className="bg-[#0a0b10] border-b border-[#1e2535]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-slate-400 text-sm mt-1">{t('itemCount', { count: totalItems })}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-200 mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Cart items + Checkout form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart items */}
            <div>
              <h2 className="text-lg font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-indigo-400" />
                {t('products', { count: items.length })}
              </h2>
              <div className="grid gap-3">
                {items.map((item) => (
                  <div key={item.id} className="bg-[#0f1117] border border-[#1e2535] rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center hover:border-[#2a3045] transition">
                    <Link href={`/products/${item.sanPham.slug}`} className="w-full md:w-24 h-24 rounded-2xl bg-[#141a26] flex items-center justify-center overflow-hidden shrink-0">
                      {item.sanPham.hinhAnh ? (
                        <img
                          src={item.sanPham.hinhAnh}
                          alt={item.sanPham.tenSanPham}
                          className="h-full w-full object-contain p-2"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-slate-600 text-xs">{t('image')}</div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[10px] uppercase text-indigo-400 tracking-[0.18em] mb-1">
                            {item.sanPham.danhMuc?.tenDanhMuc ?? t('fallbackCategory')}
                          </p>
                          <Link href={`/products/${item.sanPham.slug}`} className="text-sm font-semibold text-white line-clamp-2 hover:text-indigo-300 transition">
                            {item.sanPham.tenSanPham}
                          </Link>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          disabled={processing}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1 rounded-xl border border-[#2a3045] bg-[#141a26] p-0.5">
                          <button
                            onClick={() => updateQuantity(item.id, item.soLuong - 1)}
                            disabled={processing || item.soLuong <= 1}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1e2535] transition disabled:opacity-50"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-white text-sm font-medium">{item.soLuong}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.soLuong + 1)}
                            disabled={processing}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#1e2535] transition disabled:opacity-50"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-indigo-300 font-semibold text-sm">{formatPrice(item.sanPham.gia * item.soLuong)}</p>
                          {item.soLuong > 1 && <p className="text-slate-500 text-xs">{formatPrice(item.sanPham.gia)} {t('unit')}</p>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-4">
                <Link href="/products" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0f1117] border border-[#1e2535] text-slate-400 hover:text-white text-sm transition">
                  <ArrowLeft className="w-3.5 h-3.5" /> {t('continueLink')}
                </Link>
                <button
                  onClick={clearCart}
                  disabled={processing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm text-rose-400/70 hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-50"
                >
                  <X className="w-3.5 h-3.5" /> {t('clearAll')}
                </button>
              </div>
            </div>

            {/* Shipping address */}
            <div className="bg-[#0f1117] border border-[#1e2535] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-400" />
                {t('shippingTitle')}
              </h3>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                className="w-full rounded-xl border border-[#1e2535] bg-[#141a26] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 resize-none"
                placeholder={t('shippingPlaceholder')}
              />
              {shippingAddress.trim().length > 0 && shippingAddress.trim().length < 10 && (
                <p className="mt-2 text-xs text-rose-400">{t('shippingMin')}</p>
              )}
            </div>

            {/* Payment method */}
            <div className="bg-[#0f1117] border border-[#1e2535] rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-indigo-400" />
                {t('paymentTitle')}
              </h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon
                  const isSelected = paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id)}
                      className={`rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? 'border-indigo-500/50 bg-indigo-500/10 ring-1 ring-indigo-500/20'
                          : 'border-[#1e2535] bg-[#141a26] hover:border-[#2a3045]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-500'}`} />
                        <div>
                          <p className={`font-semibold text-sm ${isSelected ? 'text-white' : 'text-slate-300'}`}>{method.label}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{method.desc}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right column - Order summary */}
          <div className="space-y-4">
            <div className="bg-[#0f1117] border border-[#1e2535] rounded-2xl overflow-hidden sticky top-20">
              <div className="p-6 border-b border-[#1e2535]">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-1">{t('summaryEyebrow')}</p>
                <h2 className="text-xl font-semibold text-white">{t('summaryTitle')}</h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{t('subtotal', { count: totalItems })}</span>
                  <span className="text-slate-300">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>{t('shippingFee')}</span>
                  <span className={shippingCost === 0 ? 'text-emerald-400' : 'text-slate-300'}>{shippingCost === 0 ? t('freeShipping') : formatPrice(shippingCost)}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-sm text-emerald-400">
                    <span>{t('discount')}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <Separator className="bg-[#1e2535]" />
                <div className="flex justify-between items-baseline gap-4">
                  <span className="text-slate-300 font-semibold">{t('total')}</span>
                  <span className="text-2xl font-bold text-indigo-400">{formatPrice(totalPrice)}</span>
                </div>

                {subtotal < SHIPPING_FREE_THRESHOLD && (
                  <p className="text-xs text-slate-500">{t('freeShippingHint', { amount: formatPrice(SHIPPING_FREE_THRESHOLD - subtotal) })}</p>
                )}

                <Button
                  size="lg"
                  className="w-full gaming-gradient text-white font-semibold"
                  disabled={!canCheckout}
                  onClick={handlePlaceOrder}
                >
                  {submitting ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> {t('processing')}</>
                  ) : (
                    <><PackageCheck className="w-5 h-5 mr-2" /> {t('placeOrder')}</>
                  )}
                </Button>

                {!canCheckout && items.length > 0 && shippingAddress.trim().length < 10 && (
                  <p className="text-xs text-center text-slate-500">{t('checkoutHint')}</p>
                )}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-[#0f1117] border border-[#1e2535] rounded-2xl p-5 space-y-3">
              <p className="text-sm text-slate-400 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" /> {t('couponTitle')}
              </p>
              <div className="flex gap-2">
                <input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 rounded-xl border border-[#1e2535] bg-[#141a26] py-2.5 px-4 text-sm text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none"
                  placeholder={t('couponPlaceholder')}
                />
                <button
                  onClick={handleCoupon}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition"
                >
                  {t('applyCoupon')}
                </button>
              </div>
              {couponMessage && (
                <p className={`text-xs ${couponApplied ? 'text-emerald-400' : 'text-rose-400'}`}>{couponMessage}</p>
              )}
            </div>

            {/* Trust badges */}
            <div className="bg-[#0f1117] border border-[#1e2535] rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2.5 text-slate-300 text-sm">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('trust.securePayment')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{t('trust.returnPolicy')}</span>
              </div>
              <div className="flex items-center gap-2.5 text-slate-400 text-xs">
                <Truck className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{t('trust.shipping')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
