'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useToast } from '@/app/providers/toast-provider'
import { useCart } from '@/app/providers/cart-provider'
import { useAuth } from '@/context/AuthContext'
import type { Product } from './types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => Promise<void> | void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [imageError, setImageError] = useState(false)
  const { addToast } = useToast()
  const { addItem } = useCart()
  const { requireAuth } = useAuth()
  const t = useTranslations('productCard')

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

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price)

  const specs =
    product.thongSoKyThuat && typeof product.thongSoKyThuat === 'object' && !Array.isArray(product.thongSoKyThuat)
      ? Object.entries(product.thongSoKyThuat).slice(0, 3)
      : []

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 transition hover:border-sky-400/40 hover:shadow-xl hover:shadow-sky-500/5">
      <div className="relative h-52 bg-slate-950">
        {product.hinhAnh && !imageError ? (
          <img
            src={product.hinhAnh}
            alt={product.tenSanPham}
            className="h-full w-full object-contain p-5 transition duration-300 group-hover:scale-105"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">{t('noImage')}</div>
        )}
        {product.danhMuc && (
          <div className="absolute left-3 top-3 rounded-full bg-sky-500/15 px-3 py-1 text-xs font-medium text-sky-300">
            {product.danhMuc.tenDanhMuc}
          </div>
        )}
      </div>

      <div className="space-y-4 p-5">
        <div>
          <Link href={`/products/${product.slug}`} className="line-clamp-2 text-lg font-semibold text-white transition hover:text-sky-300">
            {product.tenSanPham}
          </Link>
          <p className="mt-2 line-clamp-2 text-sm text-slate-400">{product.moTa || t('descriptionFallback')}</p>
        </div>

        <div>
          <p className="text-2xl font-bold text-sky-300">{formatPrice(product.gia)}</p>
          <p className="mt-1 text-xs text-slate-500">{t('stock', { count: product.soLuongTon })}</p>
        </div>

        {specs.length > 0 && (
          <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-300">
            {specs.map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 py-1">
                <span className="text-slate-500">{key}</span>
                <span>{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.soLuongTon <= 0 || isAdding}
            className="rounded-xl bg-sky-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
          >
            {isAdding ? t('adding') : t('add')}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="rounded-xl border border-slate-700 px-4 py-3 text-center font-semibold text-slate-200 transition hover:border-sky-400 hover:text-sky-300"
          >
            {t('details')}
          </Link>
        </div>
      </div>
    </div>
  )
}
