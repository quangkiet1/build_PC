'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, BadgePercent, ShoppingCart } from 'lucide-react'
import { animate } from 'animejs'
import { useTranslations } from 'next-intl'
import { useToast } from '@/app/providers/toast-provider'
import { useCart } from '@/app/providers/cart-provider'
import { useAuth } from '@/context/AuthContext'
import type { Product } from './types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => Promise<void> | void
}

const specLabelMap: Record<string, string> = {
  socket: 'Socket',
  ram_type: 'RAM',
  memory: 'Memory',
  type: 'Type',
  wattage: 'PSU',
  vram: 'VRAM',
  chipset: 'Chipset',
  capacity: 'Capacity',
  capacity_storage: 'Storage',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(price)
}

function normalizeSpecLabel(key: string) {
  return specLabelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function getSpecHighlights(product: Product) {
  if (!product.thongSoKyThuat || typeof product.thongSoKyThuat !== 'object' || Array.isArray(product.thongSoKyThuat)) {
    return []
  }

  return Object.entries(product.thongSoKyThuat)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .slice(0, 3)
    .map(([key, value]) => ({
      label: normalizeSpecLabel(key),
      value: String(value),
    }))
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [imageError, setImageError] = useState(false)
  const cardRef = useRef<HTMLElement>(null)
  const { addToast } = useToast()
  const { addItem } = useCart()
  const { requireAuth } = useAuth()
  const t = useTranslations('productCard')

  const brand = product.thuongHieu?.trim() || product.danhMuc?.tenDanhMuc || 'PC Builder'
  const specHighlights = getSpecHighlights(product)
  const originalPrice =
    product.phanTramGiam && product.phanTramGiam > 0
      ? Math.round(product.gia / (1 - product.phanTramGiam / 100))
      : null

  useEffect(() => {
    const node = cardRef.current

    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Reset state for animation
    node.style.opacity = '0'
    node.style.transform = 'translateY(20px) scale(0.98)'

    let animation: ReturnType<typeof animate> | null = null

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) {
          return
        }

        // Smooth entrance animation with spring-like effect
        animation = animate(node, {
          opacity: [0, 1],
          translateY: [20, 0],
          scale: [0.98, 1],
          duration: 600,
          easing: 'spring(1, 80, 10, 0)',
        })

        observer.disconnect()
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(node)

    return () => {
      observer.disconnect()
      animation?.pause()
    }
  }, [])

  const handleAddToCart = async () => {
    setIsAdding(true)

    try {
      await requireAuth(async () => {
        if (onAddToCart) {
          await onAddToCart(product)
        } else {
          await addItem(product.id, 1)
        }

        addToast('Da them vao gio hang', 'success')
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('failed')
      addToast(message, 'error')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <article
      ref={cardRef}
      className="group flex h-full flex-col overflow-hidden rounded-[28px] border border-[#24314a] bg-[linear-gradient(180deg,rgba(14,18,27,0.98),rgba(9,12,18,0.98))] shadow-[0_20px_60px_rgba(2,6,23,0.18)] transition duration-300 hover:-translate-y-1 hover:border-sky-400/35 hover:shadow-[0_24px_70px_rgba(14,165,233,0.12)]"
    >
      <div className="relative overflow-hidden border-b border-white/6 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_46%),linear-gradient(180deg,#0f1724,#0a0f18)]">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-[11px] font-medium text-sky-200">
            {product.danhMuc?.tenDanhMuc || brand}
          </span>
          {product.phanTramGiam ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/15 px-3 py-1 text-[11px] font-medium text-rose-200">
              <BadgePercent className="h-3.5 w-3.5" />
              -{product.phanTramGiam}%
            </span>
          ) : null}
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <div className="relative flex h-56 items-center justify-center px-6 pb-6 pt-14">
            {product.hinhAnh && !imageError ? (
              <img
                src={product.hinhAnh}
                alt={product.tenSanPham}
                className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-slate-700 text-sm text-slate-500">
                {t('noImage')}
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between p-5 overflow-hidden">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
            <span>{brand}</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>{product.soLuongTon > 0 ? t('stock', { count: product.soLuongTon }) : 'Out of stock'}</span>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="mt-3 line-clamp-2 text-lg font-semibold leading-snug text-white transition group-hover:text-sky-200"
          >
            {product.tenSanPham}
          </Link>

          <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">
            {product.moTa || t('descriptionFallback')}
          </p>

          {specHighlights.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {specHighlights.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-slate-300"
                >
                  <span className="text-slate-500">{spec.label}:</span> {spec.value}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-2xl font-bold text-sky-300">{formatPrice(product.gia)}</p>
                {originalPrice ? (
                  <p className="mt-1 text-sm text-slate-500 line-through">{formatPrice(originalPrice)}</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">{brand}</p>
                )}
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium shrink-0 ${
                  product.soLuongTon > 5
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : product.soLuongTon > 0
                      ? 'bg-amber-500/15 text-amber-300'
                      : 'bg-rose-500/15 text-rose-300'
                }`}
              >
                {product.soLuongTon > 5 ? 'Ready' : product.soLuongTon > 0 ? 'Low stock' : 'Out'}
              </span>
            </div>
          </div>

          <div className="grid gap-2">
            <button
              onClick={handleAddToCart}
              disabled={product.soLuongTon <= 0 || isAdding}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#38bdf8,#4f46e5)] px-4 py-3 font-semibold text-white shadow-[0_12px_30px_rgba(56,189,248,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none h-12"
            >
              <ShoppingCart className="h-4 w-4" />
              {isAdding ? t('adding') : t('add')}
            </button>

            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#2a3448] bg-[#121927] px-4 py-3 text-center font-semibold text-slate-200 transition hover:border-sky-400/30 hover:text-sky-200 h-12"
            >
              {t('details')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
