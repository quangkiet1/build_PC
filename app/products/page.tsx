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
    id: 'rx-7900-xtx',
    name: 'AMD Radeon RX 7900 XTX',
    brand: 'AMD',
    category: 'GPU',
    price: 26500000,
    originalPrice: 27500000,
    rating: 4.6,
    reviews: 1876,
    image: '/gpu-rx7900xtx.jpg',
    specs: ['24GB GDDR6', 'RDNA 3', 'FSR 3', '6144 stream processors'],
    inStock: true,
    discount: 4
  },
  {
    id: 'corsair-ddr5-32gb',
    name: 'Corsair Vengeance DDR5 32GB',
    brand: 'Corsair',
    category: 'RAM',
    price: 4500000,
    originalPrice: 4800000,
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
    originalPrice: 9000000,
    rating: 4.9,
    reviews: 1234,
    image: '/ssd-samsung.jpg',
    specs: ['PCIe 4.0', '7450MB/s read', '6900MB/s write', '5-year warranty'],
    inStock: true,
    discount: 6
  }
]

const categories = [
  { id: 'all', name: 'Tất cả sản phẩm', icon: Package },
  { id: 'cpu', name: 'CPU', icon: Cpu },
  { id: 'gpu', name: 'Card đồ họa', icon: Monitor },
  { id: 'ram', name: 'RAM', icon: Database },
  { id: 'storage', name: 'Ổ cứng', icon: HardDrive },
  { id: 'psu', name: 'Nguồn', icon: Zap },
  { id: 'case', name: 'Case', icon: Package }
]

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [filteredProducts, setFilteredProducts] = useState(products)

  useEffect(() => {
    let filtered = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' ||
                            product.category.toLowerCase() === selectedCategory.toLowerCase()
      return matchesSearch && matchesCategory
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        case 'rating':
          return b.rating - a.rating
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

    setFilteredProducts(filtered)
  }, [searchTerm, selectedCategory, sortBy])

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category.toLowerCase())
    return cat ? cat.icon : Package
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
              <Link href="/products" className="text-blue-400 font-semibold">Sản phẩm</Link>
              <Link href="/" className="text-slate-300 hover:text-blue-400 transition">Trang chủ</Link>
              <Link href="/builder" className="gaming-gradient px-4 py-2 rounded-lg font-semibold hover:scale-105 transition">
                ⚙️ PC Builder
              </Link>
              <Link href="/cart" className="text-slate-300 hover:text-blue-400 transition flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Giỏ hàng
              </Link>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Hỗ trợ
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🛍️ Linh kiện máy tính <span className="gaming-text-gradient">chất lượng cao</span>
          </h1>
          <p className="text-xl text-slate-300">
            Khám phá bộ sưu tập linh kiện từ các thương hiệu hàng đầu với giá cả cạnh tranh
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-700 text-white"
              />
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {categories.map((category) => {
                  const Icon = category.icon
                  return (
                    <SelectItem key={category.id} value={category.id} className="text-white hover:bg-slate-700">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {category.name}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="name" className="text-white hover:bg-slate-700">Tên sản phẩm</SelectItem>
                <SelectItem value="price-low" className="text-white hover:bg-slate-700">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-high" className="text-white hover:bg-slate-700">Giá cao đến thấp</SelectItem>
                <SelectItem value="rating" className="text-white hover:bg-slate-700">Đánh giá cao nhất</SelectItem>
              </SelectContent>
            </Select>

            {/* Results count */}
            <div className="flex items-center text-slate-300">
              <span>{filteredProducts.length} sản phẩm</span>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            const Icon = getCategoryIcon(product.category)
            return (
              <Card key={product.id} className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition group">
                <CardHeader className="pb-3">
                  <div className="relative aspect-square bg-slate-800 rounded-lg mb-3 overflow-hidden">
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                      <Icon className="w-16 h-16 text-slate-400" />
                    </div>
                    {product.discount && (
                      <Badge className="absolute top-2 left-2 bg-red-500/20 text-red-400 border-red-500/30">
                        -{product.discount}%
                      </Badge>
                    )}
                    {!product.inStock && (
                      <Badge className="absolute top-2 right-2 bg-slate-500/20 text-slate-400 border-slate-500/30">
                        Hết hàng
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-slate-700 text-slate-300">
                        {product.category}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500/30 text-blue-400">
                        {product.brand}
                      </Badge>
                    </div>
                    <CardTitle className="text-white group-hover:text-blue-400 transition line-clamp-2">
                      {product.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Specs */}
                  <div className="space-y-1">
                    {product.specs.slice(0, 2).map((spec, index) => (
                      <div key={index} className="text-sm text-slate-400 flex items-center gap-2">
                        <div className="w-1 h-1 bg-blue-400 rounded-full" />
                        {spec}
                      </div>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-white">{product.rating}</span>
                    </div>
                    <span className="text-sm text-slate-400">({product.reviews} đánh giá)</span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xl font-bold gaming-text-gradient">
                        {product.price.toLocaleString()} ₫
                      </div>
                      {product.originalPrice > product.price && (
                        <div className="text-sm text-slate-400 line-through">
                          {product.originalPrice.toLocaleString()} ₫
                        </div>
                      )}
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="gaming-gradient hover:scale-105 transition"
                      disabled={!product.inStock}
                    >
                      <Link href={`/products/${product.id}`}>
                        Xem chi tiết
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-slate-400 mb-4">Thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác</p>
            <Button
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
              }}
              variant="outline"
              className="border-slate-700 hover:bg-slate-800"
            >
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}