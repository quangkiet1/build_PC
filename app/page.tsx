import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Cpu,
  Monitor,
  Zap,
  Package,
  Wind,
  HardDrive,
  Database,
  LayoutGrid,
  Star,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Users,
  Award,
  Shield,
  Truck,
  HeadphonesIcon
} from 'lucide-react'

export default function HomePage() {
  const features = [
    {
      icon: Cpu,
      title: 'CPU Hiệu năng cao',
      description: 'Bộ xử lý Intel và AMD thế hệ mới nhất với hiệu năng vượt trội'
    },
    {
      icon: Monitor,
      title: 'Card đồ họa RTX 40-series',
      description: 'Trải nghiệm gaming đỉnh cao với công nghệ ray tracing'
    },
    {
      icon: Database,
      title: 'RAM DDR5 tốc độ cao',
      description: 'Bộ nhớ nhanh chóng cho đa nhiệm mượt mà'
    },
    {
      icon: HardDrive,
      title: 'SSD NVMe Gen4',
      description: 'Tốc độ đọc/ghi lên đến 7000MB/s'
    },
    {
      icon: Zap,
      title: 'Nguồn công suất 80+ Gold',
      description: 'Độ ổn định cao, tiết kiệm điện năng'
    },
    {
      icon: Package,
      title: 'Case Gaming cao cấp',
      description: 'Thiết kế RGB, tản nhiệt tối ưu'
    }
  ]

  const stats = [
    { label: 'Khách hàng hài lòng', value: '50,000+', icon: Users },
    { label: 'Sản phẩm chất lượng', value: '10,000+', icon: Package },
    { label: 'Năm kinh nghiệm', value: '15+', icon: Award },
    { label: 'Đánh giá 5 sao', value: '4.9/5', icon: Star }
  ]

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
              <Link href="/" className="text-blue-400 font-semibold">Trang chủ</Link>
              <Link href="/builder" className="gaming-gradient px-4 py-2 rounded-lg font-semibold hover:scale-105 transition">
                ⚙️ PC Builder
              </Link>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Hỗ trợ
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-orange-600/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30">
                  🚀 Công nghệ tiên tiến 2026
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                  Xây dựng
                  <span className="gaming-text-gradient block">PC Gaming</span>
                  hoàn hảo của bạn
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed max-w-lg">
                  Khám phá bộ sưu tập linh kiện máy tính chất lượng cao từ các thương hiệu hàng đầu.
                  Trải nghiệm PC Builder thông minh với kiểm tra tương thích tức thời.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="gaming-gradient hover:scale-105 transition text-lg px-8 py-4">
                  <Link href="/builder">
                    ⚙️ Bắt đầu Build PC
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-slate-700 hover:bg-slate-800 text-lg px-8 py-4">
                  <Link href="/products">
                    🛍️ Xem sản phẩm
                  </Link>
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-slate-300">Bảo hành chính hãng</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-blue-400" />
                  <span className="text-slate-300">Giao hàng tận nơi</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-400" />
                  <span className="text-slate-300">Thanh toán bảo mật</span>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <Cpu className="w-8 h-8 text-blue-400 mb-2" />
                      <div className="text-sm font-medium text-white">Intel Core i9</div>
                      <div className="text-xs text-slate-400">24 cores / 32 threads</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <Monitor className="w-8 h-8 text-green-400 mb-2" />
                      <div className="text-sm font-medium text-white">RTX 4090</div>
                      <div className="text-xs text-slate-400">24GB GDDR6X</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <Database className="w-8 h-8 text-purple-400 mb-2" />
                      <div className="text-sm font-medium text-white">DDR5 32GB</div>
                      <div className="text-xs text-slate-400">6400MHz</div>
                    </div>
                    <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                      <HardDrive className="w-8 h-8 text-orange-400 mb-2" />
                      <div className="text-sm font-medium text-white">SSD 2TB</div>
                      <div className="text-xs text-slate-400">NVMe Gen4</div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 text-center">
                  <div className="text-2xl font-bold gaming-text-gradient">45,000,000 ₫</div>
                  <div className="text-sm text-slate-400">Cấu hình Gaming Ultimate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-4">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold gaming-text-gradient mb-1">{stat.value}</div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Linh kiện <span className="gaming-text-gradient">cao cấp</span> từ thương hiệu uy tín
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Chúng tôi cung cấp đầy đủ các linh kiện máy tính từ CPU, GPU, Mainboard đến Case,
              PSU với chất lượng đảm bảo và giá cả cạnh tranh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition group">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 group-hover:bg-blue-500/30 transition">
                      <Icon className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-orange-600/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Sẵn sàng xây dựng <span className="gaming-text-gradient">PC mơ ước</span>?
            </h2>
            <p className="text-xl text-slate-300 mb-8">
              Với công cụ PC Builder thông minh, bạn có thể dễ dàng tạo ra cấu hình hoàn hảo
              phù hợp với nhu cầu gaming, work hoặc content creation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="gaming-gradient hover:scale-105 transition text-lg px-8 py-4">
                <Link href="/builder">
                  🚀 Bắt đầu Build PC ngay
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-slate-700 hover:bg-slate-800 text-lg px-8 py-4">
                <Link href="/products">
                  📦 Khám phá sản phẩm
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="text-2xl font-bold gaming-text-gradient mb-4">⚙️ PC BUILDER</div>
              <p className="text-slate-400 mb-4 max-w-md">
                Nơi uy tín để xây dựng và mua linh kiện máy tính chất lượng cao.
                Chúng tôi cam kết mang đến trải nghiệm mua sắm tốt nhất cho cộng đồng gaming và công nghệ.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800">
                  <Users className="w-4 h-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" size="sm" className="border-slate-700 hover:bg-slate-800">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  YouTube
                </Button>
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Sản phẩm</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/products?category=cpu" className="hover:text-blue-400 transition">CPU</Link></li>
                <li><Link href="/products?category=gpu" className="hover:text-blue-400 transition">GPU</Link></li>
                <li><Link href="/products?category=ram" className="hover:text-blue-400 transition">RAM</Link></li>
                <li><Link href="/products?category=storage" className="hover:text-blue-400 transition">Ổ cứng</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">Hỗ trợ</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link href="/builder" className="hover:text-blue-400 transition">PC Builder</Link></li>
                <li><Link href="/support" className="hover:text-blue-400 transition">Hỗ trợ kỹ thuật</Link></li>
                <li><Link href="/warranty" className="hover:text-blue-400 transition">Bảo hành</Link></li>
                <li><Link href="/contact" className="hover:text-blue-400 transition">Liên hệ</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 PC Builder. Tất cả quyền được bảo lưu. | Thiết kế bởi Senior UI/UX Team</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
