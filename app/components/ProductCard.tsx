// app/components/ProductCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'

import type { Product } from './types'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [imageError, setImageError] = useState(false)

  const handleAddToCart = () => {
    setIsAdding(true)
    if (onAddToCart) {
      onAddToCart(product)
    }
    setTimeout(() => setIsAdding(false), 1000)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="group bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-1">
      {/* Ảnh sản phẩm */}
      <div className="relative h-48 bg-slate-900 overflow-hidden">
        {product.hinhAnh && !imageError ? (
          <img
            src={product.hinhAnh}
            alt={product.tenSanPham}
            className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500 bg-slate-900">
            <div className="text-center">
              <div className="text-4xl mb-2">🖼️</div>
              <span className="text-sm">Không có ảnh</span>
            </div>
          </div>
        )}

        {/* Badge danh mục */}
        {product.danhMuc && (
          <div className="absolute top-3 left-3 bg-blue-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
            {product.danhMuc.tenDanhMuc}
          </div>
        )}

        {/* Badge tình trạng */}
        <div className="absolute top-3 right-3">
          {product.soLuongTon > 0 ? (
            <div className="bg-green-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Còn hàng
            </div>
          ) : (
            <div className="bg-red-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              Hết hàng
            </div>
          )}
        </div>

        {/* Overlay khi hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 hover:text-blue-400 transition-colors cursor-pointer">
            {product.tenSanPham}
          </h3>
        </Link>

        {product.moTa && (
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">
            {product.moTa}
          </p>
        )}

        {/* Giá */}
        <div className="mb-4">
          <span className="text-2xl font-bold text-blue-400">
            {formatPrice(product.gia)}
          </span>
        </div>

        {/* Thông số kỹ thuật (nếu có) */}
        {product.thongSoKyThuat && (
          <div className="mb-4 bg-slate-900/50 p-3 rounded-lg text-xs text-slate-300 max-h-20 overflow-y-auto">
            <div className="font-semibold text-slate-200 mb-2">Thông số:</div>
            {typeof product.thongSoKyThuat === 'object' && product.thongSoKyThuat && (
              <div className="space-y-1">
                {Object.entries(product.thongSoKyThuat).slice(0, 3).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-slate-400">{key}:</span>
                    <span className="text-slate-200 ml-2">{String(value)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={product.soLuongTon === 0 || isAdding}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95"
          >
            {isAdding ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang thêm...
              </span>
            ) : (
              '🛒 Thêm giỏ'
            )}
          </button>
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 border border-blue-500 text-blue-400 hover:bg-blue-500/10 py-2.5 rounded-lg font-semibold transition duration-300 text-center transform hover:scale-105 active:scale-95"
          >
            👁️ Xem chi tiết
          </Link>
        </div>
      </div>
    </div>
  )
}
