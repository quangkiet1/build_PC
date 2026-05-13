'use client'

import type { Product } from './types'
import { ProductCard } from './ProductCard'

interface ProductDetailProps {
  product: Product
  relatedProducts?: Product[]
}

export function ProductDetail({ product, relatedProducts = [] }: ProductDetailProps) {
  return (
    <div className="space-y-8">
      <ProductCard product={product} />
      {relatedProducts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  )
}
