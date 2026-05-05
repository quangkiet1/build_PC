'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BadgePercent, ShoppingCart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/app/providers/toast-provider'
import { useCart } from '@/app/providers/cart-provider'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import type { Product } from './types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => Promise<void> | void
  className?: string
  featured?: boolean
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

function getCategoryTone(category?: string | null) {
  const key = category?.toLowerCase() || ''

  if (key.includes('cpu')) {
    return {
      ring: 'from-cyan-400/55 via-cyan-300/10 to-transparent',
      glow: 'neon-cyan',
      accent: 'text-cyan-300',
      badge: 'border-cyan-400/25 bg-cyan-400/10 text-cyan-200',
    }
  }

  if (key.includes('gpu') || key.includes('vga')) {
    return {
      ring: 'from-fuchsia-400/55 via-fuchsia-300/10 to-transparent',
      glow: 'neon-magenta',
      accent: 'text-fuchsia-300',
      badge: 'border-fuchsia-400/25 bg-fuchsia-400/10 text-fuchsia-200',
    }
  }

  return {
    ring: 'from-sky-400/45 via-sky-300/10 to-transparent',
    glow: '',
    accent: 'text-sky-300',
    badge: 'border-sky-400/20 bg-sky-400/10 text-sky-200',
  }
}

export function ProductCard({ product, onAddToCart, className, featured = false }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { addToast } = useToast()
  const { addItem } = useCart()
  const { requireAuth } = useAuth()
  const t = useTranslations('productCard')

  const brand = product.thuongHieu?.trim() || product.danhMuc?.tenDanhMuc || 'PC Builder'
  const specHighlights = getSpecHighlights(product)
  const tone = getCategoryTone(product.danhMuc?.tenDanhMuc)
  const originalPrice =
    product.phanTramGiam && product.phanTramGiam > 0
      ? Math.round(product.gia / (1 - product.phanTramGiam / 100))
      : null

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
    <motion.article
      initial={{ opacity: 0, y: 22, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      whileHover={{ scale: 1.02, y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={cn(
        'glass-card group relative flex h-full flex-col overflow-hidden rounded-[28px] transition-all duration-300',
        'border-white/10 hover:border-white/20',
        featured && 'border-cyan-300/12 bg-[linear-gradient(180deg,rgba(12,18,32,0.82),rgba(7,11,20,0.92))]',
        className
      )}
    >
      <div className={cn('absolute inset-x-0 top-0 h-px bg-linear-to-r', tone.ring)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] opacity-70" />

      <div className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4">
          <span className={cn('rounded-full border px-3 py-1 text-[11px] font-medium', tone.badge)}>
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
          <div className={cn('relative flex items-center justify-center px-6 pb-6 pt-14', featured ? 'h-56' : 'h-52')}>
            {product.hinhAnh && !imageError ? (
              <Image
                src={product.hinhAnh}
                alt={product.tenSanPham}
                fill
                sizes={featured ? '(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 100vw' : '(min-width: 1280px) 18vw, (min-width: 640px) 40vw, 100vw'}
                className={cn(
                  'object-contain transition duration-500 group-hover:scale-[1.05]',
                  tone.glow
                )}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-2xl border border-dashed border-white/10 text-sm text-slate-500">
                {t('noImage')}
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="relative flex flex-1 flex-col justify-between overflow-hidden p-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-slate-500">
            <span>{brand}</span>
            <span className="h-1 w-1 rounded-full bg-slate-700" />
            <span>{product.soLuongTon > 0 ? t('stock', { count: product.soLuongTon }) : 'Out of stock'}</span>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-white transition group-hover:text-slate-100 md:text-lg"
          >
            {product.tenSanPham}
          </Link>

          <p className={cn('mt-2 text-sm leading-6 text-slate-400', featured ? 'line-clamp-2' : 'line-clamp-2')}>
            {product.moTa || t('descriptionFallback')}
          </p>

          {specHighlights.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {specHighlights.map((spec) => (
                <div
                  key={spec.label}
                  className="font-tech rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-[11px] text-slate-300"
                >
                  <span className="text-slate-500">{spec.label}:</span> {spec.value}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-5 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className={cn('font-tech text-2xl font-bold', tone.accent)}>{formatPrice(product.gia)}</p>
                {originalPrice ? (
                  <p className="mt-1 text-sm text-slate-500 line-through">{formatPrice(originalPrice)}</p>
                ) : (
                  <p className="mt-1 text-sm text-slate-500">{brand}</p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
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
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#06b6d4,#8b5cf6)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_34px_rgba(34,211,238,0.18)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400 disabled:shadow-none"
            >
              <ShoppingCart className="h-4 w-4" />
              {isAdding ? t('adding') : t('add')}
            </button>

            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-white/20 hover:bg-white/8"
            >
              {t('details')}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
