// app/components/ProductList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { ProductCard } from './ProductCard'
import { useCart } from '@/app/providers/cart-provider'
import { Skeleton } from '@/components/Skeleton'
import { getLocalizedApiError } from '@/lib/localized-api-error'
import type { Product } from './types'

interface ProductListProps {
  limit?: number
  showPagination?: boolean
}

export function ProductList({ limit = 12, showPagination = false }: ProductListProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { addItem } = useCart()
  const t = useTranslations('productList')
  const locale = useLocale()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/products?page=${page}&limit=${limit}`)
        const data = await response.json()

        if (data.success) {
          setProducts(data.data)
          setTotalPages(data.pagination.totalPages)
        } else {
          setError(getLocalizedApiError(data, locale, t('fetchError')))
        }
      } catch (err) {
        setError(t('networkError'))
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [page, limit, locale, t])

  const handleAddToCart = async (product: Product) => {
    await addItem(product.id, 1)
  }

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4 rounded-2xl border border-white/10 bg-[#0F1115]/70 p-4 shadow-[0_18px_45px_rgba(0,0,0,0.2)]">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-red-200">
        {error}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="py-12 text-center text-[#94A3B8]">
        <p className="text-lg">{t('empty')}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Grid sản phẩm */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      {/* Phân trang */}
      {showPagination && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[#CBD5E1] transition hover:border-[#F7931A]/40 hover:text-[#FFD600] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('previous')}
          </button>
          <div className="rounded-full border border-white/10 bg-[#0F1115]/80 px-4 py-2 text-sm font-medium text-[#CBD5E1]">
            {t('page', { page, totalPages })}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[#CBD5E1] transition hover:border-[#F7931A]/40 hover:text-[#FFD600] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  )
}
