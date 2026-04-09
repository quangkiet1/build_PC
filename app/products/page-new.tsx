'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Search,
  Filter,
  Cpu,
  Monitor,
  Database,
  HardDrive,
  Zap,
  Package,
  Star,
  ShoppingCart,
  HeadphonesIcon
} from 'lucide-react'

const products = [
  {
    id: 'intel-i7-13700k',
    name: 'Intel Core i7-13700K',
    brand: 'Intel',
    category: 'CPU',
    price: 18500000,
    rating: 4.8,
    reviews: 1247,
    image: '/cpu-intel.jpg',
    specs: ['24 cores / 32 threads', '5.4 GHz boost', 'LGA 1700', '125W TDP'],
    inStock: true,
    discount: 5
  },
  {
    id: 'amd-ryzen-7-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    category: 'CPU',
    price: 16500000,
    rating: 4.9,
    reviews: 892,
    image: '/cpu-amd.jpg',
    specs: ['8 cores / 16 threads', '5.0 GHz boost', 'AM5 socket', '120W TDP'],
    inStock: true,
    discount: 6
  },
  {
    id: 'rtx-4070-ti',
    name: 'ASUS ROG Strix RTX 4070 Ti',
    brand: 'ASUS',
    category: 'GPU',
    price: 28500000,
    rating: 4.7,
    reviews: 2156,
    image: '/gpu-rtx4070ti.jpg',
    specs: ['12GB GDDR6X', 'Ray Tracing', 'DLSS 3', '7680 CUDA cores'],
    inStock: true,
    discount: 3
  },
  {
    id: 'corsair-ddr5-32gb',
    name: 'Corsair Vengeance DDR5 32GB',
    brand: 'Corsair',
    category: 'RAM',
    price: 4500000,
    rating: 4.5,
    reviews: 543,
    image: '/ram-corsair.jpg',
    specs: ['DDR5-6400', 'CL32', '1.35V', 'Lifetime warranty'],
    inStock: true,
    discount: 6
  },
  {
    id: 'samsung-990-pro-2tb',
    name: 'Samsung 990 PRO 2TB',
    brand: 'Samsung',
    category: 'Storage',
    price: 8500000,
    rating: 4.9,
    reviews: 1234,
    image: '/ssd-samsung.jpg',
    specs: ['PCIe 4.0', '7450MB/s read', '6900MB/s write', '5-year warranty'],
    inStock: true,
    discount: 6
  },
  {
    id: 'corsair-rm850x',
    name: 'Corsair RM850x 850W',
    brand: 'Corsair',
    category: 'PSU',
    price: 3200000,
    rating: 4.6,
    reviews: 421,
    image: '/psu-corsair.jpg',
    specs: ['850W', '80+ Gold', 'Modular', 'Ultra Quiet'],
    inStock: true,
    discount: 0
  }
]

const categories = [
  { id: 'all', name: 'Tất cả', icon: Package },
  { id: 'CPU', name: 'CPU', icon: Cpu },
  { id: 'GPU', name: 'Card đồ họa', icon: Monitor },
  { id: 'RAM', name: 'RAM', icon: Database },
  { id: 'Storage', name: 'Ổ cứng', icon: HardDrive },
  { id: 'PSU', name: 'Nguồn', icon: Zap }
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch =
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.brand.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
        return matchesSearch && matchesCategory
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price
          case 'price-high':
            return b.price - a.price
          case 'rating':
            return b.rating - a.rating
          default:
            return a.name.localeCompare(b.name)
        }
      })
  }, [searchTerm, selectedCategory, sortBy])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Sản phẩm</p>
            <h1 className="mt-2 text-4xl font-bold text-white">Bộ sưu tập linh kiện PC</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/builder" className="gaming-gradient rounded-3xl px-5 py-3 text-sm font-semibold">Build PC</Link>
            <Link href="/" className="text-slate-200 hover:text-blue-400 transition">Về trang chủ</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white">Mua linh kiện ngay hôm nay</h2>
              <p className="mt-2 text-slate-400">Lọc, so sánh và chọn cấu hình phù hợp với nhu cầu gaming hoặc workstation của bạn.</p>
            </div>
            <Button className="rounded-3xl bg-blue-500 hover:bg-blue-400">Liên hệ tư vấn</Button>
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.5fr_0.5fr]">
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="relative rounded-3xl bg-slate-950/90 border border-slate-800 p-4">
                  <Search className="absolute left-4 top-4 text-slate-500" />
                  <Input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Tìm kiếm linh kiện..."
                    className="pl-10 bg-slate-900 border-slate-800 text-white"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                    <SelectValue placeholder="Danh mục" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800">
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-slate-950 border-slate-800 text-white">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 border-slate-800">
                    <SelectItem value="name">Theo tên</SelectItem>
                    <SelectItem value="price-low">Giá tăng dần</SelectItem>
                    <SelectItem value="price-high">Giá giảm dần</SelectItem>
                    <SelectItem value="rating">Đánh giá cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="rounded-[2rem] border border-slate-800 bg-slate-950/90">
                    <CardHeader className="p-6 pb-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-400">{product.brand}</p>
                          <CardTitle className="text-lg text-white">{product.name}</CardTitle>
                        </div>
                        <Badge className="bg-blue-500/10 text-blue-300 border border-blue-500/20">{product.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0">
                      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                        <div className="relative h-32 w-full overflow-hidden rounded-3xl bg-slate-800">
                          <Image src={product.image} alt={product.name} fill className="object-cover" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-white">{product.price.toLocaleString('vi-VN')} ₫</p>
                              <p className="text-sm text-slate-400">{product.rating} ⭐ · {product.reviews} đánh giá</p>
                            </div>
                            {product.discount > 0 && (
                              <Badge className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                                Giảm {product.discount}%
                              </Badge>
                            )}
                          </div>
                          <ul className="grid gap-2 text-sm text-slate-400">
                            {product.specs.map((spec) => (
                              <li key={spec} className="flex items-center gap-2">
                                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-400" />
                                {spec}
                              </li>
                            ))}
                          </ul>
                          <div className="flex flex-wrap gap-2 pt-4">
                            <Button className="rounded-full bg-blue-500 hover:bg-blue-400 px-4 py-2">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Thêm vào giỏ
                            </Button>
                            <Button variant="outline" className="rounded-full px-4 py-2 border-slate-700 text-slate-200">
                              Chi tiết
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <aside className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6 space-y-6">
              <div className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <Filter className="h-5 w-5 text-cyan-300" />
                  <p className="text-sm uppercase tracking-[0.3em]">Bộ lọc thông minh</p>
                </div>
                <p className="mt-3 text-slate-400">Lọc theo thương hiệu, loại linh kiện hoặc giá để tìm cấu hình phù hợp nhanh chóng.</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <HeadphonesIcon className="h-5 w-5 text-violet-300" />
                  <p className="text-sm uppercase tracking-[0.3em]">Hỗ trợ kỹ thuật</p>
                </div>
                <p className="mt-3 text-slate-400">Đội ngũ hỗ trợ sẵn sàng tư vấn phần cứng, tối ưu cấu hình và lắp đặt.</p>
              </div>
              <div className="rounded-3xl bg-slate-900/80 p-5">
                <div className="flex items-center gap-3 text-slate-300">
                  <Star className="h-5 w-5 text-amber-300" />
                  <p className="text-sm uppercase tracking-[0.3em]">Lợi ích đặc biệt</p>
                </div>
                <ul className="mt-3 space-y-3 text-slate-400 text-sm">
                  <li>• Giao hàng nội thành nhanh chóng</li>
                  <li>• Bảo hành chính hãng từng linh kiện</li>
                  <li>• Hỗ trợ lắp đặt online miễn phí</li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  )
}
