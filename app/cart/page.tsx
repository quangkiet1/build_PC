'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  CreditCard,
  ArrowLeft,
  Shield,
  Truck,
  RefreshCw,
  Star
} from 'lucide-react'

// Mock cart data - in real app this would come from context/state management
const cartItems = [
  {
    id: '1',
    name: 'Intel Core i7-13700K',
    brand: 'Intel',
    price: 12500000,
    image: '/images/cpu-i7.svg',
    quantity: 1,
    category: 'CPU'
  },
  {
    id: '2',
    name: 'ASUS ROG STRIX Z790-E',
    brand: 'ASUS',
    price: 8500000,
    image: '/images/mb-rog.svg',
    quantity: 1,
    category: 'Mainboard'
  },
  {
    id: '3',
    name: 'CORSAIR Vengeance DDR5 32GB',
    brand: 'CORSAIR',
    price: 2800000,
    image: '/images/ram-corsair.svg',
    quantity: 2,
    category: 'RAM'
  }
]

const shippingOptions = [
  { id: 'standard', name: 'Giao hàng tiêu chuẩn', price: 30000, days: '3-5 ngày' },
  { id: 'express', name: 'Giao hàng nhanh', price: 50000, days: '1-2 ngày' },
  { id: 'pickup', name: 'Nhận tại cửa hàng', price: 0, days: 'Ngay lập tức' }
]

export default function CartPage() {
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shipping = 30000
  const tax = Math.round(subtotal * 0.08) // 8% VAT
  const total = subtotal + shipping + tax

  const updateQuantity = (id: string, newQuantity: number) => {
    // In real app, this would update the cart state
    console.log(`Update ${id} to quantity ${newQuantity}`)
  }

  const removeItem = (id: string) => {
    // In real app, this would remove from cart
    console.log(`Remove item ${id}`)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-2xl font-bold gaming-text-gradient">⚙️ PC BUILDER</div>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/products" className="text-slate-300 hover:text-blue-400 transition">Sản phẩm</Link>
              <Link href="/" className="text-blue-400 font-semibold">Trang chủ</Link>
              <Link href="/builder" className="gaming-gradient px-4 py-2 rounded-lg font-semibold hover:scale-105 transition">
                ⚙️ PC Builder
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-6">
          <Link href="/" className="hover:text-blue-400 transition">Trang chủ</Link>
          <ArrowLeft className="w-4 h-4 rotate-180" />
          <span className="text-white">Giỏ hàng</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white">Giỏ hàng của bạn</h1>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {cartItems.length} sản phẩm
              </Badge>
            </div>

            {cartItems.length === 0 ? (
              <Card className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Giỏ hàng trống</h3>
                  <p className="text-slate-400 mb-6">Hãy thêm một số sản phẩm vào giỏ hàng của bạn</p>
                  <Button asChild className="gaming-gradient">
                    <Link href="/products">Tiếp tục mua sắm</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id} className="bg-slate-900/50 border-slate-800">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center shrink-0">
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={80}
                            height={80}
                            className="object-contain"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <Badge variant="outline" className="mb-2 border-slate-700 text-slate-300">
                                {item.category}
                              </Badge>
                              <h3 className="text-lg font-semibold text-white line-clamp-2">
                                {item.name}
                              </h3>
                              <p className="text-slate-400 text-sm">{item.brand}</p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          {/* Rating */}
                          <div className="flex items-center gap-1 mb-3">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <span className="text-xs text-slate-400 ml-1">4.8</span>
                          </div>

                          {/* Quantity and Price */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                className="w-8 h-8 p-0 border-slate-700 hover:bg-slate-800"
                              >
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-8 text-center text-white">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-8 h-8 p-0 border-slate-700 hover:bg-slate-800"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold gaming-text-gradient">
                                {(item.price * item.quantity).toLocaleString('vi-VN')} ₫
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-xs text-slate-400">
                                  {item.price.toLocaleString('vi-VN')} ₫ / cái
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Continue Shopping */}
            <div className="flex justify-between items-center pt-4">
              <Button variant="outline" asChild className="border-slate-700 hover:bg-slate-800">
                <Link href="/products">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Tiếp tục mua sắm
                </Link>
              </Button>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <RefreshCw className="w-4 h-4 mr-2" />
                Cập nhật giỏ hàng
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Summary Card */}
            <Card className="bg-slate-900/50 border-slate-800 sticky top-24">
              <CardHeader>
                <CardTitle>Tóm tắt đơn hàng</CardTitle>
                <CardDescription>
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tạm tính</span>
                    <span className="text-white">{subtotal.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Phí vận chuyển</span>
                    <span className="text-white">{shipping.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Thuế VAT (8%)</span>
                    <span className="text-white">{tax.toLocaleString('vi-VN')} ₫</span>
                  </div>
                  <Separator className="bg-slate-800" />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="gaming-text-gradient">Tổng cộng</span>
                    <span className="gaming-text-gradient">{total.toLocaleString('vi-VN')} ₫</span>
                  </div>
                </div>

                <Button size="lg" className="w-full gaming-gradient hover:scale-105 transition">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Tiến hành thanh toán
                </Button>

                <div className="text-xs text-slate-400 text-center">
                  Bảo mật thanh toán với SSL 256-bit
                </div>
              </CardContent>
            </Card>

            {/* Shipping Options */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Phương thức giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-slate-700 hover:border-blue-500/50 transition cursor-pointer"
                  >
                    <div>
                      <p className="text-white font-medium">{option.name}</p>
                      <p className="text-xs text-slate-400">{option.days}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">
                        {option.price === 0 ? 'Miễn phí' : `${option.price.toLocaleString('vi-VN')} ₫`}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="flex flex-col items-center">
                    <Shield className="w-8 h-8 text-green-400 mb-2" />
                    <span className="text-xs text-slate-400">Bảo hành chính hãng</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Truck className="w-8 h-8 text-blue-400 mb-2" />
                    <span className="text-xs text-slate-400">Giao hàng tận nơi</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <RefreshCw className="w-8 h-8 text-purple-400 mb-2" />
                    <span className="text-xs text-slate-400">Đổi trả dễ dàng</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle>Mã giảm giá</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá"
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                    Áp dụng
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Nhập WELCOME để được giảm 5% cho đơn hàng đầu tiên
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}