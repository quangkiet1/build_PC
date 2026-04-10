'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Cpu,
  Monitor,
  Database,
  HardDrive,
  Zap,
  Package,
  Wind,
  LayoutGrid,
  ArrowRight,
  Star,
  TrendingUp,
  Shield,
  Truck,
  Award,
  ChevronRight,
  Wrench,
  Flame,
  Clock
} from 'lucide-react'
import { ProductCard } from './components/ProductCard'

const HERO_IMG = 'https://images.unsplash.com/photo-1707312900236-12d6fefd2bbb?w=1400&q=85'
const GPU_IMG = 'https://images.unsplash.com/photo-1621164071312-67bb68821b3f?w=800&q=80'
const PC_IMG = 'https://images.unsplash.com/photo-1634003309303-442c7518f9e9?w=800&q=80'

const categoryCards = [
  { id: 'cpu', label: 'CPU', sub: 'Intel & AMD', icon: Cpu, color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', iconColor: 'text-blue-400' },
  { id: 'gpu', label: 'GPU', sub: 'RTX & RX Series', icon: Monitor, color: 'from-purple-500/20 to-purple-600/5', border: 'border-purple-500/20', iconColor: 'text-purple-400' },
  { id: 'ram', label: 'RAM', sub: 'DDR4 & DDR5', icon: Database, color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
  { id: 'mainboard', label: 'Mainboard', sub: 'Intel & AMD', icon: LayoutGrid, color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', iconColor: 'text-amber-400' },
  { id: 'storage', label: 'Ổ cứng', sub: 'SSD & HDD', icon: HardDrive, color: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/20', iconColor: 'text-cyan-400' },
  { id: 'psu', label: 'Nguồn', sub: 'Gold & Platinum', icon: Zap, color: 'from-yellow-500/20 to-yellow-600/5', border: 'border-yellow-500/20', iconColor: 'text-yellow-400' },
  { id: 'case', label: 'Case', sub: 'ATX & ITX', icon: Package, color: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/20', iconColor: 'text-rose-400' },
  { id: 'cooling', label: 'Tản nhiệt', sub: 'Air & AIO', icon: Wind, color: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/20', iconColor: 'text-indigo-400' }
]

const builderSteps = [
  { step: '01', title: 'Chọn mục đích sử dụng', desc: 'Gaming, làm việc, hay đồ họa chuyên nghiệp?' },
  { step: '02', title: 'Chọn linh kiện phù hợp', desc: 'Hệ thống tự động kiểm tra tương thích' },
  { step: '03', title: 'Thêm vào giỏ & thanh toán', desc: 'Giao hàng và lắp ráp tận nơi' }
]

const products = [
  {
    id: 'intel-i9-14900k',
    slug: 'intel-i9-14900k',
    tenSanPham: 'Intel Core i9-14900K',
    gia: 24500000,
    moTa: 'Hiệu năng cao cho gaming và sáng tạo nội dung.',
    hinhAnh: 'https://images.unsplash.com/photo-1611078485960-63a780c1332a?w=800&q=80',
    soLuongTon: 35,
    isSale: false,
    isNew: true,
    isFeatured: true,
    danhMuc: { id: 'cpu', tenDanhMuc: 'CPU' },
    thongSoKyThuat: { cores: '24', threads: '32', socket: 'LGA1700' }
  },
  {
    id: 'asus-rog-rtx-4090',
    slug: 'asus-rog-rtx-4090',
    tenSanPham: 'ASUS ROG Strix RTX 4090',
    gia: 58000000,
    moTa: 'Ray Tracing, DLSS và hiệu năng 4K đỉnh cao.',
    hinhAnh: 'https://images.unsplash.com/photo-1606813906634-35f0c1157ce0?w=800&q=80',
    soLuongTon: 18,
    isSale: true,
    isNew: false,
    isFeatured: true,
    danhMuc: { id: 'gpu', tenDanhMuc: 'GPU' },
    thongSoKyThuat: { memory: '24GB', tdp: '450W' }
  },
  {
    id: 'corsair-ddr5-64gb',
    slug: 'corsair-ddr5-64gb',
    tenSanPham: 'Corsair Vengeance DDR5 64GB',
    gia: 7200000,
    moTa: 'Đa nhiệm mạnh mẽ với tốc độ 7200MHz.',
    hinhAnh: 'https://images.unsplash.com/photo-1618225814288-5beed3df42c0?w=800&q=80',
    soLuongTon: 60,
    isSale: false,
    isNew: true,
    isFeatured: true,
    danhMuc: { id: 'ram', tenDanhMuc: 'RAM' },
    thongSoKyThuat: { speed: '7200MHz', capacity: '64GB' }
  },
  {
    id: 'samsung-990-pro-2tb',
    slug: 'samsung-990-pro-2tb',
    tenSanPham: 'Samsung 990 PRO 2TB',
    gia: 8500000,
    moTa: 'SSD NVMe chuẩn Gen4 cho tốc độ đọc cực nhanh.',
    hinhAnh: 'https://images.unsplash.com/photo-1621522427564-6ac1fd4ba2f1?w=800&q=80',
    soLuongTon: 45,
    isSale: true,
    isNew: false,
    isFeatured: true,
    danhMuc: { id: 'storage', tenDanhMuc: 'Storage' },
    thongSoKyThuat: { capacity: '2TB', interface: 'PCIe 4.0' }
  },
  {
    id: 'corsair-rm850x',
    slug: 'corsair-rm850x',
    tenSanPham: 'Corsair RM850x 850W',
    gia: 3200000,
    moTa: 'Nguồn công suất mạnh mẽ và êm ái.',
    hinhAnh: 'https://images.unsplash.com/photo-1589561084283-930aa7b1f5d5?w=800&q=80',
    soLuongTon: 22,
    isSale: false,
    isNew: false,
    isFeatured: false,
    danhMuc: { id: 'psu', tenDanhMuc: 'PSU' },
    thongSoKyThuat: { watt: '850W', certification: '80+ Gold' }
  }
]

function getFeaturedProducts() {
  return products.filter(product => product.isFeatured)
}

function ImageWithFallback({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [hasError, setHasError] = useState(false)

  return (
    <div className={className}>
      {!hasError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500">
          <span>Ảnh không tải được</span>
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const featured = getFeaturedProducts().slice(0, 8)
  const saleProducts = products.filter(p => p.isSale).slice(0, 4)
  const newProducts = products.filter(p => p.isNew).slice(0, 4)
  const router = useRouter()

  return (
    <div className="text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[580px] flex items-center">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={HERO_IMG}
            alt="Gaming PC Setup"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07080d] via-[#07080d]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-transparent to-transparent" />
        </div>

        {/* Animated glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-xs">
                <Flame className="w-3.5 h-3.5" /> PC Builder 2026 đã ra mắt
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Build PC của bạn<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                theo cách của bạn
              </span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 leading-relaxed">
              Công cụ build PC thông minh nhất Việt Nam. Kiểm tra tương thích tự động, gợi ý linh kiện phù hợp và đặt hàng chỉ trong vài phút.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/builder"
                className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <Wrench className="w-5 h-5" />
                Bắt đầu Build PC
              </Link>
              <Link
                href="/products"
                className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/20 text-white rounded-xl font-medium transition-all"
              >
                Xem tất cả sản phẩm
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-8">
              {[
                { value: '50,000+', label: 'Đơn hàng' },
                { value: '4.9', label: 'Đánh giá' },
                { value: '100%', label: 'Chính hãng' }
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-white font-bold">{stat.value}</p>
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-white font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Danh mục linh kiện</h2>
            <p className="text-slate-500 text-sm mt-0.5">Chọn linh kiện theo từng loại</p>
          </div>
          <Link href="/products" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
            Xem tất cả <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categoryCards.map(cat => {
            const Icon = cat.icon
            return (
              <Link
                key={cat.id}
                href={`/products?category=${cat.id}`}
                className={`group flex flex-col items-center gap-2.5 p-4 rounded-xl bg-gradient-to-b ${cat.color} border ${cat.border} hover:scale-105 transition-all duration-200`}
              >
                <div className={`w-10 h-10 rounded-xl bg-[#0f1117] flex items-center justify-center ${cat.iconColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-center">
                  <p className="text-white text-sm font-medium">{cat.label}</p>
                  <p className="text-slate-500 text-xs">{cat.sub}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 bg-[#0a0b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <TrendingUp className="w-5 h-5 text-indigo-400" />
                Sản phẩm nổi bật
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">Được mua nhiều nhất tháng này</p>
            </div>
            <Link href="/products" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* PC Builder CTA */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl overflow-hidden relative bg-gradient-to-br from-indigo-950 via-[#0f1117] to-[#0f1117] border border-indigo-500/20">
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid lg:grid-cols-2 gap-0 items-center">
            <div className="p-8 lg:p-12">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-xs mb-4">
                <Wrench className="w-3.5 h-3.5" /> PC Builder Tool
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Build PC hoàn hảo<br />
                <span className="text-indigo-400">chỉ trong 5 phút</span>
              </h2>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Công cụ build PC thông minh với kiểm tra tương thích tự động, gợi ý linh kiện theo ngân sách và mục đích sử dụng.
              </p>

              <div className="space-y-3 mb-8">
                {builderSteps.map((s) => (
                  <div key={s.step} className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/30 text-indigo-400 text-sm font-bold flex items-center justify-center shrink-0">
                      {s.step}
                    </span>
                    <div>
                      <p className="text-slate-200 text-sm font-medium">{s.title}</p>
                      <p className="text-slate-500 text-xs">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/builder"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <Wrench className="w-5 h-5" />
                Thử ngay PC Builder
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative h-64 lg:h-full lg:min-h-[320px] overflow-hidden">
              <ImageWithFallback
                src={PC_IMG}
                alt="Gaming PC Build"
                className="absolute inset-0 w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0a0e1a]/60" />

              <div className="absolute bottom-4 left-4 right-4 bg-[#0f1117]/90 backdrop-blur border border-[#1e2535] rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">Tổng giá cấu hình</span>
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Tương thích
                  </span>
                </div>
                <p className="text-indigo-400 font-bold">25.480.000</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {['CPU', 'GPU', 'RAM', 'MB', 'SSD', 'PSU'].map(c => (
                    <span key={c} className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-xs rounded">
                      {c} 
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale */}
      <section className="py-10 bg-[#0a0b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-white font-bold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <Flame className="w-5 h-5 text-red-400" />
                Flash Sale
              </h2>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-red-400" />
                <span className="text-red-400 text-sm font-medium">Kết thúc: 05:23:17</span>
              </div>
            </div>
            <Link href="/products?filter=sale" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors">
              Xem tất cả <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {saleProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-white font-bold flex items-center gap-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <Award className="w-5 h-5 text-emerald-400" />
                Sản phẩm mới nhất
              </h2>
              <p className="text-slate-500 text-sm mt-0.5">Cập nhật linh kiện thế hệ mới nhất</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* GPU Banner */}
      <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <div
            className="relative overflow-hidden rounded-2xl h-48 bg-[#0f1117] border border-[#1e2535] group cursor-pointer"
            onClick={() => router.push('/products?category=gpu')}
          >
            <ImageWithFallback
              src={GPU_IMG}
              alt="GPU"
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/60 to-transparent" />
            <div className="relative p-6 h-full flex flex-col justify-end">
              <p className="text-purple-400 text-sm font-medium mb-1">Card đồ họa mới nhất</p>
              <h3 className="text-white font-bold text-xl mb-2">RTX 40 Series</h3>
              <span className="inline-flex items-center gap-1 text-slate-300 text-sm hover:text-white">
                Khám phá ngay <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
          <div
            className="relative overflow-hidden rounded-2xl h-48 bg-[#0f1117] border border-[#1e2535] group cursor-pointer"
            onClick={() => router.push('/builder')}
          >
            <ImageWithFallback
              src={PC_IMG}
              alt="PC Build"
              className="absolute inset-0 w-full h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/60 to-transparent" />
            <div className="relative p-6 h-full flex flex-col justify-end">
              <p className="text-indigo-400 text-sm font-medium mb-1">Tư vấn cấu hình</p>
              <h3 className="text-white font-bold text-xl mb-2">Build PC theo ngân sách</h3>
              <span className="inline-flex items-center gap-1 text-slate-300 text-sm hover:text-white">
                Build ngay <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-10 bg-[#0a0b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500 text-sm mb-6">Thương hiệu đối tác chính thức</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {['Intel', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Samsung', 'Kingston'].map(brand => (
              <span key={brand} className="text-slate-600 hover:text-slate-400 font-semibold text-sm sm:text-base transition-colors cursor-pointer" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
