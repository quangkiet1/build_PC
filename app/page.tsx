import Link from 'next/link'
import {
  ArrowRight,
  Award,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Flame,
  HardDrive,
  LayoutGrid,
  Monitor,
  Package,
  Shield,
  TrendingUp,
  Wind,
  Wrench,
  Zap
} from 'lucide-react'
import { ProductCard } from './components/ProductCard'
import { getStorefrontData, normalizeCategoryName } from '@/lib/catalog'

const HERO_IMG = 'https://images.unsplash.com/photo-1707312900236-12d6fefd2bbb?w=1400&q=85'
const GPU_IMG = 'https://images.unsplash.com/photo-1621164071312-67bb68821b3f?w=800&q=80'
const PC_IMG = 'https://images.unsplash.com/photo-1634003309303-442c7518f9e9?w=800&q=80'

const categoryCards = [
  {
    id: 'cpu',
    label: 'CPU',
    sub: 'Intel va AMD',
    icon: Cpu,
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400'
  },
  {
    id: 'gpu',
    label: 'GPU',
    sub: 'RTX va RX Series',
    icon: Monitor,
    color: 'from-fuchsia-500/20 to-purple-600/5',
    border: 'border-fuchsia-500/20',
    iconColor: 'text-fuchsia-400'
  },
  {
    id: 'ram',
    label: 'RAM',
    sub: 'DDR4 va DDR5',
    icon: Database,
    color: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400'
  },
  {
    id: 'mainboard',
    label: 'Mainboard',
    sub: 'Intel va AMD',
    icon: LayoutGrid,
    color: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400'
  },
  {
    id: 'storage',
    label: 'O cung',
    sub: 'SSD va HDD',
    icon: HardDrive,
    color: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400'
  },
  {
    id: 'psu',
    label: 'PSU',
    sub: 'Gold va Platinum',
    icon: Zap,
    color: 'from-yellow-500/20 to-yellow-600/5',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-400'
  },
  {
    id: 'case',
    label: 'Case',
    sub: 'ATX va ITX',
    icon: Package,
    color: 'from-rose-500/20 to-rose-600/5',
    border: 'border-rose-500/20',
    iconColor: 'text-rose-400'
  },
  {
    id: 'cooling',
    label: 'Tan nhiet',
    sub: 'Air va AIO',
    icon: Wind,
    color: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20',
    iconColor: 'text-indigo-400'
  }
] as const

const builderSteps = [
  {
    step: '01',
    title: 'Chon muc dich su dung',
    desc: 'Gaming, workstation, streaming hoac do hoa chuyen nghiep.'
  },
  {
    step: '02',
    title: 'Chon linh kien phu hop',
    desc: 'He thong doi chieu socket, RAM type va cong suat PSU.'
  },
  {
    step: '03',
    title: 'Luu build va dat hang',
    desc: 'Them vao gio, thanh toan va theo doi don hang tren cung mot he thong.'
  }
]

const trustedBrands = ['Intel', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Samsung', 'Kingston']

export default async function HomePage() {
  const { categories, featuredProducts, latestProducts } = await getStorefrontData()

  const featured = featuredProducts.slice(0, 8)
  const spotlightProducts = featuredProducts.slice(0, 4)
  const newProducts = latestProducts.slice(0, 4)

  const resolvedCategories = categoryCards.map((card) => ({
    ...card,
    data: categories.find((category) => normalizeCategoryName(category.tenDanhMuc) === card.id)
  }))

  return (
    <div className="bg-[#07080d] text-white">
      <section className="relative isolate overflow-hidden border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080d] via-[#07080d]/85 to-[#07080d]/50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.22),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(236,72,153,0.14),_transparent_30%)]" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-indigo-300">
                <Flame className="h-3.5 w-3.5" />
                PC Builder 2026
              </span>
              <h1 className="mt-6 text-5xl font-bold leading-[1.05] sm:text-6xl">
                Build PC cua ban
                <br />
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
                  theo cach thong minh hon
                </span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
                Cong cu build PC thong minh, giao dien ecommerce ro rang va he thong kiem tra tuong thich linh kien
                ngay tren website. Chon cau hinh, luu build, dat hang va nhan AI tu van trong cung mot trai nghiem.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
                >
                  <Wrench className="h-5 w-5" />
                  Bat dau Build PC
                </Link>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
                >
                  Xem tat ca san pham
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
                {[
                  { value: `${categories.length}+`, label: 'Danh muc' },
                  { value: `${featured.length}+`, label: 'San pham noi bat' },
                  { value: '24/7', label: 'Ho tro build' }
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-[28px] border border-indigo-400/20 bg-[#0f1117]/90 p-5 shadow-2xl shadow-indigo-950/30">
                <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr]">
                  <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Builder status</p>
                    <div className="mt-4 flex items-center gap-2 text-emerald-400">
                      <Shield className="h-5 w-5" />
                      <span className="font-medium">Tuong thich tot</span>
                    </div>
                    <div className="mt-5 space-y-2">
                      {['CPU / Mainboard', 'RAM / Mainboard', 'GPU / PSU'].map((item) => (
                        <div key={item} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-sm">
                          <span className="text-slate-300">{item}</span>
                          <span className="text-emerald-400">OK</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div
                    className="relative min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-cover bg-center"
                    style={{ backgroundImage: `url(${PC_IMG})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-[#0f1117]/88 p-4 backdrop-blur">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-[0.18em] text-slate-500">Tong gia cau hinh</span>
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                          <Shield className="h-3.5 w-3.5" />
                          Checked
                        </span>
                      </div>
                      <p className="mt-3 text-3xl font-bold text-indigo-300">25.480.000 VND</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {['CPU', 'GPU', 'RAM', 'MB', 'SSD', 'PSU'].map((part) => (
                          <span
                            key={part}
                            className="rounded-lg bg-indigo-500/15 px-2 py-1 text-xs font-medium text-indigo-300"
                          >
                            {part}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Danh muc linh kien</h2>
            <p className="mt-1 text-sm text-slate-500">Chon linh kien theo tung nhom de build nhanh hon.</p>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
          >
            Xem tat ca
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {resolvedCategories.map((card) => {
            const Icon = card.icon
            return (
              <Link
                key={card.id}
                href={`/products?category=${encodeURIComponent(card.data?.tenDanhMuc || card.label)}`}
                className={`group rounded-2xl border bg-gradient-to-b p-4 transition-all duration-200 hover:-translate-y-1 hover:scale-[1.02] ${card.color} ${card.border}`}
              >
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f1117] transition-transform group-hover:scale-110 ${card.iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-3">
                  <p className="text-sm font-semibold text-white">{card.data?.tenDanhMuc || card.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{card.data?.moTa || card.sub}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#0a0b10] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                San pham noi bat
              </h2>
              <p className="mt-1 text-sm text-slate-500">Nhung linh kien dang duoc quan tam nhieu trong he thong.</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
            >
              Xem tat ca
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-[#0f1117] to-[#0f1117]">
          <div className="pointer-events-none absolute left-1/4 top-0 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="p-8 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-indigo-300">
                <Wrench className="h-3.5 w-3.5" />
                PC Builder Tool
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight sm:text-4xl">
                Build PC hoan hao
                <br />
                <span className="text-indigo-300">chi trong 5 phut</span>
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-300">
                Cong cu build PC la trung tam cua he thong: chon linh kien theo nhu cau, kiem tra tuong thich tu dong
                va luu cau hinh de mua ngay khi san sang.
              </p>

              <div className="mt-8 space-y-3">
                {builderSteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-indigo-400/20 bg-indigo-500/20 text-sm font-bold text-indigo-300">
                      {step.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-100">{step.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                href="/builder"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <Wrench className="h-5 w-5" />
                Thu ngay PC Builder
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="p-6 lg:p-8">
              <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0c1020]">
                <div
                  className="relative min-h-[360px] bg-cover bg-center"
                  style={{ backgroundImage: `url(${PC_IMG})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c1020] via-[#0c1020]/25 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-[#0f1117]/85 p-4 backdrop-blur">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Build preview</p>
                        <p className="mt-2 text-2xl font-bold text-white">Gaming 2K / Creator</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                        <Shield className="h-3.5 w-3.5" />
                        Compatible
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {['CPU', 'GPU', 'RAM', 'Mainboard', 'Storage', 'PSU'].map((item) => (
                        <span key={item} className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300">
                          {item}
                        </span>
                      ))}
                    </div>
                    <p className="mt-4 text-3xl font-bold text-indigo-300">25.480.000 VND</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#0a0b10] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <Flame className="h-5 w-5 text-rose-400" />
                Spotlight Picks
              </h2>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1">
                <Clock className="h-3.5 w-3.5 text-rose-400" />
                <span className="text-sm font-medium text-rose-400">Update lien tuc</span>
              </div>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-300 transition hover:text-indigo-200"
            >
              Xem them
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {spotlightProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Award className="h-5 w-5 text-emerald-400" />
            Moi cap nhat
          </h2>
          <p className="mt-1 text-sm text-slate-500">Nhung san pham vua duoc them de cap nhat cau hinh moi nhat.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/products?category=GPU"
            className="group relative h-56 overflow-hidden rounded-3xl border border-[#1e2535] bg-[#0f1117]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-50"
              style={{ backgroundImage: `url(${GPU_IMG})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-950/70 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <p className="text-sm font-medium text-fuchsia-300">Card do hoa moi nhat</p>
              <h3 className="mt-1 text-2xl font-bold text-white">RTX va Radeon cao cap</h3>
              <span className="mt-2 inline-flex items-center gap-2 text-sm text-slate-200">
                Kham pha ngay
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <Link
            href="/builder"
            className="group relative h-56 overflow-hidden rounded-3xl border border-[#1e2535] bg-[#0f1117]"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40 transition duration-500 group-hover:scale-105 group-hover:opacity-50"
              style={{ backgroundImage: `url(${PC_IMG})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-950/70 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <p className="text-sm font-medium text-indigo-300">Tu van cau hinh</p>
              <h3 className="mt-1 text-2xl font-bold text-white">Build PC theo ngan sach</h3>
              <span className="mt-2 inline-flex items-center gap-2 text-sm text-slate-200">
                Mo Builder
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section className="border-t border-white/5 bg-[#0a0b10] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-6 text-center text-sm text-slate-500">Thuong hieu doi tac duoc nhieu builder lua chon</p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {trustedBrands.map((brand) => (
              <span
                key={brand}
                className="cursor-default text-sm font-semibold text-slate-600 transition hover:text-slate-400 sm:text-base"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
