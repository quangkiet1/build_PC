import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AddToCartButton } from '@/components/add-to-cart-button'
import {
  Star,
  ShoppingCart,
  Heart,
  Share2,
  CheckCircle,
  XCircle,
  Cpu,
  HardDrive,
  MemoryStick,
  Monitor,
  Zap,
  Package,
  Wind,
  ChevronLeft
} from 'lucide-react'

interface ProductDetailPageProps {
  params: {
    slug: string
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  let product: any = null

  try {
    // Try to find product by slug first, then by id if slug not found
    product = await prisma.sanPham.findUnique({
      where: { slug: params.slug },
      include: { danhMuc: true }
    })

    // If not found by slug, try by id (for backward compatibility)
    if (!product) {
      product = await prisma.sanPham.findUnique({
        where: { id: params.slug },
        include: { danhMuc: true }
      })
    }
  } catch (error) {
    // If database query fails, log error and continue with mock data
    console.error('Database query failed:', error)
  }

  // If still not found or database failed, use mock data for demo
  if (!product) {
    // Use mock data directly for testing
    const mockProducts: Record<string, any> = {
      'intel-i7-13700k': {
        id: 'intel-i7-13700k',
        tenSanPham: 'Intel Core i7-13700K',
        slug: 'intel-i7-13700k',
        gia: 18500000,
        hinhAnh: '/cpu-intel.jpg',
        hinhAnhs: ['/cpu-intel.jpg', '/cpu-intel-2.jpg'],
        moTa: 'Bộ xử lý Intel thế hệ 13 với 24 nhân (8P+16E), tốc độ boost lên đến 5.4GHz. Hoàn hảo cho gaming và content creation.',
        soLuongTon: 50,
        thongSoKyThuat: {
          cores: '24 (8P+16E)',
          threads: '32',
          baseClock: '3.4GHz',
          boostClock: '5.4GHz',
          cache: '30MB',
          tdp: '125W',
          socket: 'LGA1700',
          lithography: 'Intel 7'
        },
        danhMucId: 'cpu',
        danhMuc: {
          id: 'cpu',
          tenDanhMuc: 'CPU',
          moTa: null
        }
      },
      'amd-ryzen-7-7800x3d': {
        id: 'amd-ryzen-7-7800x3d',
        tenSanPham: 'AMD Ryzen 7 7800X3D',
        slug: 'amd-ryzen-7-7800x3d',
        gia: 16500000,
        hinhAnh: '/cpu-amd.jpg',
        hinhAnhs: ['/cpu-amd.jpg', '/cpu-amd-2.jpg'],
        moTa: 'Bộ xử lý AMD Ryzen 7000 series với 3D V-Cache, hiệu năng gaming vượt trội.',
        soLuongTon: 30,
        thongSoKyThuat: {
          cores: '8',
          threads: '16',
          baseClock: '4.2GHz',
          boostClock: '5.0GHz',
          cache: '96MB (64MB L3 + 32MB L2)',
          tdp: '120W',
          socket: 'AM5',
          lithography: '5nm'
        },
        danhMucId: 'cpu',
        danhMuc: {
          id: 'cpu',
          tenDanhMuc: 'CPU',
          moTa: null
        }
      },
      'rtx-4070-ti': {
        id: 'rtx-4070-ti',
        tenSanPham: 'ASUS ROG Strix RTX 4070 Ti',
        slug: 'rtx-4070-ti',
        gia: 28500000,
        hinhAnh: '/gpu-rtx4070ti.jpg',
        hinhAnhs: ['/gpu-rtx4070ti.jpg', '/gpu-rtx4070ti-2.jpg'],
        moTa: 'Card đồ họa RTX 4070 Ti với 12GB GDDR6X, DLSS 3 và Ray Tracing thế hệ mới.',
        soLuongTon: 20,
        thongSoKyThuat: {
          gpu: 'AD103',
          cudaCores: '7680',
          memory: '12GB GDDR6X',
          memoryBus: '192-bit',
          baseClock: '2310MHz',
          boostClock: '2640MHz',
          tdp: '285W',
          ports: '3x DP 1.4a, 1x HDMI 2.1a'
        },
        danhMucId: 'gpu',
        danhMuc: {
          id: 'gpu',
          tenDanhMuc: 'Card đồ họa',
          moTa: null
        }
      },
      'corsair-ddr5-32gb': {
        id: 'corsair-ddr5-32gb',
        tenSanPham: 'Corsair Vengeance DDR5 32GB',
        slug: 'corsair-ddr5-32gb',
        gia: 4500000,
        hinhAnh: '/ram-corsair.jpg',
        hinhAnhs: ['/ram-corsair.jpg', '/ram-corsair-2.jpg'],
        moTa: 'Kit RAM DDR5 32GB (2x16GB) với tốc độ 6400MHz, độ trễ CL32.',
        soLuongTon: 100,
        thongSoKyThuat: {
          capacity: '32GB (2x16GB)',
          speed: '6400MHz',
          latency: 'CL32-39-39-102',
          voltage: '1.35V',
          heatspreader: 'Aluminum',
          warranty: 'Lifetime'
        },
        danhMucId: 'ram',
        danhMuc: {
          id: 'ram',
          tenDanhMuc: 'RAM',
          moTa: null
        }
      },
      'samsung-990-pro-2tb': {
        id: 'samsung-990-pro-2tb',
        tenSanPham: 'Samsung 990 PRO 2TB',
        slug: 'samsung-990-pro-2tb',
        gia: 8500000,
        hinhAnh: '/ssd-samsung.jpg',
        hinhAnhs: ['/ssd-samsung.jpg', '/ssd-samsung-2.jpg'],
        moTa: 'SSD NVMe Gen4 với tốc độ đọc lên đến 7450MB/s, hoàn hảo cho gaming và workstation.',
        soLuongTon: 75,
        thongSoKyThuat: {
          capacity: '2TB',
          interface: 'PCIe 4.0 x4',
          formFactor: 'M.2 2280',
          readSpeed: '7450MB/s',
          writeSpeed: '6900MB/s',
          warranty: '5 years'
        },
        danhMucId: 'storage',
        danhMuc: {
          id: 'storage',
          tenDanhMuc: 'Ổ cứng',
          moTa: null
        }
      }
    }

    product = mockProducts[params.slug] || mockProducts['intel-i7-13700k']
  }

  if (!product) {
    notFound()
  }

  // Map category to icon
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase()
    if (cat.includes('cpu')) return <Cpu className="w-6 h-6" />
    if (cat.includes('ram') || cat.includes('memory')) return <MemoryStick className="w-6 h-6" />
    if (cat.includes('gpu') || cat.includes('card')) return <Monitor className="w-6 h-6" />
    if (cat.includes('storage') || cat.includes('ssd') || cat.includes('hdd')) return <HardDrive className="w-6 h-6" />
    if (cat.includes('psu') || cat.includes('power')) return <Zap className="w-6 h-6" />
    if (cat.includes('case')) return <Package className="w-6 h-6" />
    if (cat.includes('cooling') || cat.includes('fan')) return <Wind className="w-6 h-6" />
    return <Package className="w-6 h-6" />
  }

  // Auto-assign image based on category and brand
  const getProductImage = () => {
    if (product.hinhAnh) return product.hinhAnh

    const brand = product.tenSanPham.split(' ')[0].toLowerCase()
    const category = product.danhMuc?.tenDanhMuc.toLowerCase() || ''

    if (category.includes('cpu')) {
      return brand.includes('intel') ? '/images/cpu-i7.svg' : '/images/cpu-amd.svg'
    }
    if (category.includes('mainboard')) {
      if (brand.includes('asus')) return '/images/mb-asus.svg'
      if (brand.includes('msi')) return '/images/mb-msi.svg'
      if (brand.includes('rog')) return '/images/mb-rog.svg'
      return '/images/mb-asus.svg'
    }
    if (category.includes('ram')) {
      if (brand.includes('corsair')) return '/images/ram-corsair.svg'
      if (brand.includes('gskill')) return '/images/ram-gskill.svg'
      if (brand.includes('kingston')) return '/images/ram-kingston.svg'
      return '/images/ram-corsair.svg'
    }
    if (category.includes('gpu')) {
      if (brand.includes('rtx') && brand.includes('4090')) return '/images/gpu-rtx4090.svg'
      if (brand.includes('rtx') && brand.includes('4070')) return '/images/gpu-rtx4070.svg'
      if (brand.includes('rx') && brand.includes('7900')) return '/images/gpu-rx7900.svg'
      return '/images/gpu-rtx4090.svg'
    }
    if (category.includes('storage')) {
      if (brand.includes('samsung')) return '/images/ssd-samsung.svg'
      return '/images/ssd-wd.svg'
    }
    if (category.includes('psu')) {
      if (brand.includes('corsair')) return '/images/psu-corsair.svg'
      if (brand.includes('seasonic')) return '/images/psu-seasonic.svg'
      return '/images/psu-corsair.svg'
    }
    if (category.includes('case')) {
      if (brand.includes('corsair')) return '/images/case-corsair.svg'
      if (brand.includes('fractal')) return '/images/case-fractal.svg'
      return '/images/case-corsair.svg'
    }
    if (category.includes('cooling')) {
      if (brand.includes('noctua')) return '/images/cooler-noctua.svg'
      if (brand.includes('be quiet')) return '/images/cooler-be-quiet.svg'
      return '/images/cooler-noctua.svg'
    }

    return '/images/cpu-i7.svg'
  }

  const specs = product.thongSoKyThuat as any || {}

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
          <span className="text-slate-600">→</span>
          <Link href="/products" className="hover:text-blue-400 transition">Sản phẩm</Link>
          <span className="text-slate-600">→</span>
          <span className="text-slate-300">{product.tenSanPham}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-slate-900/50 rounded-2xl overflow-hidden border border-slate-800">
              <Image
                src={getProductImage()}
                alt={product.tenSanPham}
                fill
                className="object-contain p-8"
                priority
              />
            </div>

            {/* Image Gallery Placeholder */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-slate-900/50 rounded-lg border border-slate-800 flex items-center justify-center">
                  <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
                    {getCategoryIcon(product.danhMuc?.tenDanhMuc || '')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {getCategoryIcon(product.danhMuc?.tenDanhMuc || '')}
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {product.danhMuc?.tenDanhMuc || 'Sản phẩm'}
                </Badge>
                {product.soLuongTon > 0 ? (
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Còn hàng
                  </Badge>
                ) : (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                    <XCircle className="w-3 h-3 mr-1" />
                    Hết hàng
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                {product.tenSanPham}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="text-3xl font-bold gaming-text-gradient">
                  {product.gia.toLocaleString()} ₫
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="text-slate-300">4.8</span>
                  <span className="text-slate-400">(1,247 đánh giá)</span>
                </div>
              </div>

              <p className="text-slate-300 leading-relaxed mb-6">
                {product.moTa || 'Mô tả sản phẩm sẽ được cập nhật sớm.'}
              </p>
            </div>

            {/* Specifications */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Thông số kỹ thuật</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-slate-800 last:border-b-0">
                      <span className="text-slate-400 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-white font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="flex-1">
                  <AddToCartButton productId={product.id} />
                </div>
                <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-800 w-full sm:w-auto">
                  <Heart className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-slate-700 hover:bg-slate-800 w-full sm:w-auto">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              <div className="text-center text-sm text-slate-400">
                🚚 Giao hàng tận nơi • 🛡️ Bảo hành chính hãng • 💳 Thanh toán bảo mật
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Placeholder */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-white mb-8">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition">
                <CardContent className="p-4">
                  <div className="aspect-square bg-slate-800 rounded-lg mb-3 flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-white mb-2">Sản phẩm mẫu {i}</h3>
                  <p className="text-slate-400 text-sm mb-3">Mô tả sản phẩm mẫu</p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 font-bold">0 ₫</span>
                    <Button size="sm" variant="outline" className="border-slate-700">
                      Xem chi tiết
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}