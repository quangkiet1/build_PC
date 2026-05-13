'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, BadgePercent, Scale, ShoppingCart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useToast } from '@/app/providers/toast-provider'
import { useCart } from '@/app/providers/cart-provider'
import { useAuth } from '@/context/AuthContext'
import { useCompare } from '@/components/compare-provider'
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

export function ProductCard({ product, onAddToCart, className, featured = false }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { addToast } = useToast()
  const { addItem } = useCart()
  const { requireAuth } = useAuth()
  const { toggleProduct, isSelected } = useCompare()
  const t = useTranslations('productCard')
  const compared = isSelected(product.id)

  const brand = product.thuongHieu?.trim() || product.danhMuc?.tenDanhMuc || 'PC Builder'
  const specHighlights = getSpecHighlights(product)
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

  const handleCompare = () => {
    const result = toggleProduct(product)
    addToast(result.message, result.ok ? 'success' : 'error')
  }

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col bg-[#0F1115] border border-white/10 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-[#F7931A]/50 hover:shadow-[0_0_30px_-10px_rgba(247,147,26,0.2)] overflow-hidden',
        className
      )}
    >
      <div className="relative border-b border-white/10 bg-black/40">
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4 z-10">
          <span className="rounded-md border border-white/10 bg-black/50 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-white">
            {product.danhMuc?.tenDanhMuc || brand}
          </span>
          {product.phanTramGiam ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-[#F7931A]/50 bg-[#F7931A]/20 backdrop-blur-md px-2.5 py-1 text-[10px] font-mono text-[#FFD600] shadow-[0_0_10px_rgba(247,147,26,0.3)]">
              <BadgePercent className="h-3 w-3" />
              -{product.phanTramGiam}%
            </span>
          ) : null}
        </div>

        <Link href={`/products/${product.slug}`} className="block">
          <div className={cn('relative flex items-center justify-center p-8', featured ? 'h-64' : 'h-56')}>
            {product.hinhAnh && !imageError ? (
              <Image
                src={product.hinhAnh.replace('via.placeholder.com', 'placehold.co')}
                alt={product.tenSanPham}
                fill
                sizes={featured ? '(min-width: 1280px) 24vw, (min-width: 768px) 40vw, 100vw' : '(min-width: 1280px) 18vw, (min-width: 640px) 40vw, 100vw'}
                className="object-contain p-8 transition-transform duration-500 group-hover:scale-110"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center border border-dashed border-white/10 rounded-xl bg-white/5 text-xs font-mono text-muted">
                {t('noImage')}
              </div>
            )}
          </div>
        </Link>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-muted mb-3 uppercase tracking-wider">
            <span>{brand}</span>
            <span className="h-1 w-1 rounded-full bg-white/20" />
            <span className={product.soLuongTon > 0 ? "text-[#F7931A]" : "text-red-400"}>
              {product.soLuongTon > 0 ? t('stock', { count: product.soLuongTon }) : 'Out of stock'}
            </span>
          </div>

          <Link
            href={`/products/${product.slug}`}
            className="block text-lg font-heading font-semibold leading-tight text-white hover:text-[#F7931A] transition-colors"
          >
            <span className="line-clamp-2">{product.tenSanPham}</span>
          </Link>

          {specHighlights.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {specHighlights.map((spec) => (
                <div
                  key={spec.label}
                  className="rounded border border-white/5 bg-white/5 px-2 py-1 text-[10px] font-mono text-muted"
                >
                  <span className="opacity-60">{spec.label}:</span> <span className="text-white">{spec.value}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-end justify-between gap-4 mb-5">
            <div>
              <p className="text-xl font-heading font-bold text-white tracking-tight">{formatPrice(product.gia)}</p>
              {originalPrice && (
                <p className="mt-1 text-[11px] font-mono text-muted line-through">{formatPrice(originalPrice)}</p>
              )}
            </div>
            <span
              className={`shrink-0 rounded flex items-center justify-center border px-2 py-1 text-[10px] font-mono uppercase ${
                product.soLuongTon > 5
                  ? 'border-[#FFD600]/30 bg-[#FFD600]/10 text-[#FFD600]'
                  : product.soLuongTon > 0
                    ? 'border-[#F7931A]/30 bg-[#F7931A]/10 text-[#F7931A]'
                    : 'border-red-500/30 bg-red-500/10 text-red-400'
              }`}
            >
              {product.soLuongTon > 5 ? 'Ready' : product.soLuongTon > 0 ? 'Low stock' : 'Out'}
            </span>
          </div>

          <div className="grid grid-cols-[1fr_auto_auto] gap-3">
            <button
              onClick={handleAddToCart}
              disabled={product.soLuongTon <= 0 || isAdding}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-4 text-sm font-semibold text-white shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.7)] disabled:cursor-not-allowed disabled:bg-none disabled:bg-white/5 disabled:text-muted disabled:border disabled:border-white/10 disabled:shadow-none disabled:hover:scale-100"
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="font-mono text-xs uppercase tracking-wider">{isAdding ? t('adding') : t('add')}</span>
            </button>

            <Link
              href={`/products/${product.slug}`}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 hover:border-white/20"
              aria-label={t('details')}
            >
              <ArrowRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={handleCompare}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
                compared
                  ? 'border-[#F7931A]/50 bg-[#F7931A]/15 text-[#FFD600]'
                  : 'border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20'
              }`}
              aria-label="So sanh"
              title="So sanh"
            >
              <Scale className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
