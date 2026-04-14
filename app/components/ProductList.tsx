// app/components/ProductList.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ProductCard } from './ProductCard'
import { useCart } from '@/app/providers/cart-provider'
import { Skeleton } from '@/components/Skeleton'
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
          setError(data.error || t('fetchError'))
        }
      } catch (err) {
        setError(t('networkError'))
        console.error('Error fetching products:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [page, limit])

  const handleAddToCart = async (product: Product) => {
    await addItem(product.id, 1)
  }

  if (loading && products.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-4 rounded-xl border border-slate-700 bg-slate-800/30 p-4">
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
      <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
        {error}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
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
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition"
          >
            {t('previous')}
          </button>
          <div className="text-slate-300">
            {t('page', { page, totalPages })}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition"
          >
            {t('next')}
          </button>
        </div>
      )}
    </div>
  )
}
