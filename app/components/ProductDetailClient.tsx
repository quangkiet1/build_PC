'use client'

import type { Product } from './types'
import { ProductDetail } from './ProductDetail'

interface ProductDetailClientProps {
  product: Product
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  return <ProductDetail product={product} />
}
