'use client'

import { ProductDetail } from './ProductDetail'

interface ProductDetailClientProps {
  product: any
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  return <ProductDetail product={product} />
}