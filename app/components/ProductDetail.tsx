'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Product {
  id: string
  tenSanPham: string
  slug: string
  gia: number
  hinhAnh?: string | null
  hinhAnhs?: string[]
  moTa?: string | null
  soLuongTon: number
  thongSoKyThuat?: any
  danhMuc?: {
    id: string
    tenDanhMuc: string
    moTa?: string | null
  }
  createdAt?: Date
  updatedAt?: Date
}

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdding, setIsAdding] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleAddToCart = () => {
    setIsAdding(true)
    // TODO: Implement add to cart logic
    setTimeout(() => setIsAdding(false), 1000)
  }

  const increaseQuantity = () => {
    if (quantity < product.soLuongTon) {
      setQuantity(quantity + 1)
    }
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold text-blue-500">⚙️ PC BUILDER</div>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/products" className="text-slate-300 hover:text-white transition">Sản phẩm</Link>
              <Link href="/" className="text-slate-300 hover:text-white transition">Trang chủ</Link>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition">
                Đăng nhập
              </button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li><Link href="/" className="text-slate-400 hover:text-white">Trang chủ</Link></li>
            <li className="text-slate-600">/</li>
            <li><Link href="/products" className="text-slate-400 hover:text-white">Sản phẩm</Link></li>
            <li className="text-slate-600">/</li>
            <li className="text-white">{product.tenSanPham}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden">
              {product.hinhAnh ? (
                <img
                  src={product.hinhAnh}
                  alt={product.tenSanPham}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <div className="text-center">
                    <div className="text-8xl mb-4">🖼️</div>
                    <span className="text-xl">Không có ảnh</span>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Images */}
            {product.hinhAnhs && product.hinhAnhs.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {product.hinhAnhs.map((image, index) => (
                  <div key={index} className="aspect-square bg-slate-800 rounded-lg overflow-hidden">
                    <img
                      src={image}
                      alt={`${product.tenSanPham} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category Badge */}
            {product.danhMuc && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600/20 text-blue-400 border border-blue-600/30">
                {product.danhMuc.tenDanhMuc}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-white">{product.tenSanPham}</h1>

            {/* Price */}
            <div className="text-4xl font-bold text-blue-400">
              {formatPrice(product.gia)}
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.soLuongTon > 0 ? (
                <>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-green-400">Còn hàng ({product.soLuongTon})</span>
                </>
              ) : (
                <>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-red-400">Hết hàng</span>
                </>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="space-y-2">
              <label className="text-white font-semibold">Số lượng:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="text-white text-xl font-semibold min-w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={increaseQuantity}
                  disabled={quantity >= product.soLuongTon}
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-900 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.soLuongTon === 0 || isAdding}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-4 rounded-lg font-semibold transition duration-300 transform hover:scale-105 active:scale-95"
            >
              {isAdding ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang thêm vào giỏ...
                </span>
              ) : product.soLuongTon > 0 ? (
                '🛒 Thêm vào giỏ hàng'
              ) : (
                'Hết hàng'
              )}
            </button>

            {/* Description */}
            {product.moTa && (
              <div className="space-y-2">
                <h3 className="text-white font-semibold">Mô tả sản phẩm:</h3>
                <p className="text-slate-300 leading-relaxed">{product.moTa}</p>
              </div>
            )}
          </div>
        </div>

        {/* Specifications */}
        {product.thongSoKyThuat && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-6">Thông số kỹ thuật</h2>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(product.thongSoKyThuat).map(([key, value]: [string, any]) => (
                  <div key={key} className="flex justify-between py-2 border-b border-slate-800 last:border-b-0">
                    <span className="text-slate-400 font-medium">{key}:</span>
                    <span className="text-white">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-6">Sản phẩm liên quan</h2>
          <div className="text-center py-8">
            <p className="text-slate-400">Đang phát triển...</p>
          </div>
        </div>
      </div>
    </div>
  )
}