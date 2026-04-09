'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CreditCard,
  Truck,
  Shield,
  CheckCircle,
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  User,
  Package,
  Clock,
  Star,
  HeadphonesIcon
} from 'lucide-react'

// Mock cart data - in real app this would come from context/state
const cartItems = [
  {
    id: 1,
    name: 'Intel Core i7-13700K',
    category: 'CPU',
    price: 18500000,
    quantity: 1,
    image: '/cpu-intel.jpg',
    warranty: '3 năm'
  },
  {
    id: 2,
    name: 'ASUS ROG Strix RTX 4070 Ti',
    category: 'GPU',
    price: 28500000,
    quantity: 1,
    image: '/gpu-rtx4070ti.jpg',
    warranty: '3 năm'
  },
  {
    id: 3,
    name: 'Corsair Vengeance DDR5 32GB',
    category: 'RAM',
    price: 4500000,
    quantity: 2,
    image: '/ram-corsair.jpg',
    warranty: 'Lifetime'
  }
]

const shippingOptions = [
  {
    id: 'standard',
    name: 'Giao hàng tiêu chuẩn',
    price: 50000,
    time: '3-5 ngày',
    description: 'Giao hàng trong khu vực nội thành'
  },
  {
    id: 'express',
    name: 'Giao hàng nhanh',
    price: 100000,
    time: '1-2 ngày',
    description: 'Giao hàng ưu tiên, theo dõi realtime'
  },
  {
    id: 'pickup',
    name: 'Nhận tại cửa hàng',
    price: 0,
    time: 'Ngay lập tức',
    description: 'Nhận hàng tại showroom Hà Nội'
  }
]

export default function CheckoutPage() {
  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: ''
  })

  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const shippingCost = shippingOptions.find(opt => opt.id === selectedShipping)?.price || 0
  const total = subtotal + shippingCost - promoDiscount

  const handlePromoApply = () => {
    if (promoCode.toLowerCase() === 'pcbuild2024') {
      setPromoDiscount(500000)
    } else {
      setPromoDiscount(0)
    }
  }

  const handleSubmitOrder = () => {
    // In real app, this would submit to backend
    alert('Đơn hàng đã được đặt thành công! Chúng tôi sẽ liên hệ với bạn sớm.')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl font-bold gaming-text-gradient">⚙️ PC BUILDER</div>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/products" className="text-slate-300 hover:text-blue-400 transition">Sản phẩm</Link>
              <Link href="/builder" className="text-slate-300 hover:text-blue-400 transition">PC Builder</Link>
              <Link href="/cart" className="text-blue-400 font-semibold">Giỏ hàng</Link>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Hỗ trợ
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/cart" className="text-slate-400 hover:text-blue-400 transition flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" />
            Giỏ hàng
          </Link>
          <span className="text-slate-600">→</span>
          <span className="text-blue-400 font-semibold">Thanh toán</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Customer Information */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-blue-400" />
                  Thông tin khách hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Họ và tên *</label>
                    <Input
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      placeholder="Nhập họ và tên"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                    <Input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      placeholder="email@example.com"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Số điện thoại *</label>
                    <Input
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      placeholder="0123 456 789"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Thành phố</label>
                    <Input
                      value={customerInfo.city}
                      onChange={(e) => setCustomerInfo({...customerInfo, city: e.target.value})}
                      placeholder="Hà Nội"
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Địa chỉ giao hàng *</label>
                  <Input
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    placeholder="Số nhà, đường, phường/xã"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Options */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Truck className="w-5 h-5 text-blue-400" />
                  Phương thức giao hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {shippingOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setSelectedShipping(option.id)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedShipping === option.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedShipping === option.id
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-slate-600'
                        }`}>
                          {selectedShipping === option.id && (
                            <div className="w-full h-full rounded-full bg-blue-500 scale-50" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{option.name}</div>
                          <div className="text-sm text-slate-400">{option.description}</div>
                          <div className="text-sm text-blue-400 flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {option.time}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-white">
                          {option.price === 0 ? 'Miễn phí' : `${option.price.toLocaleString()} ₫`}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  Phương thức thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-green-500 bg-green-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      paymentMethod === 'cod'
                        ? 'border-green-500 bg-green-500'
                        : 'border-slate-600'
                    }`}>
                      {paymentMethod === 'cod' && (
                        <div className="w-full h-full rounded-full bg-green-500 scale-50" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-slate-400">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 border rounded-lg cursor-pointer transition ${
                    paymentMethod === 'bank'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      paymentMethod === 'bank'
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-slate-600'
                    }`}>
                      {paymentMethod === 'bank' && (
                        <div className="w-full h-full rounded-full bg-blue-500 scale-50" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-white">Chuyển khoản ngân hàng</div>
                      <div className="text-sm text-slate-400">Thanh toán qua chuyển khoản online</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Cart Items */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="w-5 h-5 text-blue-400" />
                  Sản phẩm trong giỏ ({cartItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">{item.name}</div>
                      <div className="text-xs text-slate-400">{item.category} • SL: {item.quantity}</div>
                      <div className="text-sm font-semibold text-blue-400">
                        {(item.price * item.quantity).toLocaleString()} ₫
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Promo Code */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-sm">Mã giảm giá</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Nhập mã giảm giá"
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <Button onClick={handlePromoApply} variant="outline" className="border-slate-700">
                    Áp dụng
                  </Button>
                </div>
                {promoDiscount > 0 && (
                  <div className="mt-2 text-green-400 text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Đã áp dụng mã giảm giá: -{promoDiscount.toLocaleString()} ₫
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Total */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Tổng đơn hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Tạm tính:</span>
                  <span className="text-white">{subtotal.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300">Phí vận chuyển:</span>
                  <span className="text-white">
                    {shippingCost === 0 ? 'Miễn phí' : `${shippingCost.toLocaleString()} ₫`}
                  </span>
                </div>
                {promoDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-400">Giảm giá:</span>
                    <span className="text-green-400">-{promoDiscount.toLocaleString()} ₫</span>
                  </div>
                )}
                <Separator className="bg-slate-700" />
                <div className="flex justify-between text-lg font-bold">
                  <span className="text-white">Tổng cộng:</span>
                  <span className="gaming-text-gradient">{total.toLocaleString()} ₫</span>
                </div>
              </CardContent>
            </Card>

            {/* Trust Badges */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Shield className="w-4 h-4 text-green-400" />
                Thanh toán bảo mật 100%
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                Bảo hành chính hãng
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Truck className="w-4 h-4 text-purple-400" />
                Giao hàng tận nơi
              </div>
            </div>

            {/* Place Order Button */}
            <Button
              onClick={handleSubmitOrder}
              size="lg"
              className="w-full gaming-gradient hover:scale-105 transition text-lg py-6"
            >
              🛍️ Đặt hàng ngay
            </Button>

            <div className="text-center text-xs text-slate-400">
              Bằng việc đặt hàng, bạn đồng ý với{' '}
              <Link href="/terms" className="text-blue-400 hover:underline">
                điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link href="/privacy" className="text-blue-400 hover:underline">
                chính sách bảo mật
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}