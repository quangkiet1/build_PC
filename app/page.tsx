import Link from 'next/link'
import {
  ArrowRight,
  Award,
  BadgeCheck,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Flame,
  HardDrive,
  LayoutGrid,
  Monitor,
  Package,
  ShieldCheck,
  TrendingUp,
  Truck,
  Wind,
  Wrench,
  Zap,
} from 'lucide-react'
import { ProductCard } from '@/app/components/ProductCard'
import { ProtectedLink } from '@/components/ProtectedLink'
import { getStorefrontData, normalizeCategoryName } from '@/lib/catalog'
import { getTranslator } from '@/i18n/server'

const HERO_IMG = 'https://images.unsplash.com/photo-1707312900236-12d6fefd2bbb?w=1400&q=85'
const GPU_IMG = 'https://images.unsplash.com/photo-1621164071312-67bb68821b3f?w=800&q=80'
const PC_IMG = 'https://images.unsplash.com/photo-1634003309303-442c7518f9e9?w=800&q=80'

const iconMap = {
  cpu: Cpu,
  gpu: Monitor,
  ram: Database,
  mainboard: LayoutGrid,
  storage: HardDrive,
  psu: Zap,
  case: Package,
  cooling: Wind,
} as const

const categoryStyles = {
  cpu: {
    gradient: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  gpu: {
    gradient: 'from-violet-500/20 to-violet-600/5',
    border: 'border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  ram: {
    gradient: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  mainboard: {
    gradient: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  storage: {
    gradient: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  psu: {
    gradient: 'from-yellow-500/20 to-yellow-600/5',
    border: 'border-yellow-500/20',
    iconColor: 'text-yellow-400',
  },
  case: {
    gradient: 'from-rose-500/20 to-rose-600/5',
    border: 'border-rose-500/20',
    iconColor: 'text-rose-400',
  },
  cooling: {
    gradient: 'from-indigo-500/20 to-indigo-600/5',
    border: 'border-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
} as const

const trustedBrands = ['Intel', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Samsung', 'Kingston']

export default async function HomePage() {
  const t = await getTranslator('home')
  const { categories, featuredProducts, latestProducts } = await getStorefrontData()

  const featured = featuredProducts.slice(0, 4)
  const latest = latestProducts.slice(0, 4)
  const heroStats = [
    { value: `${featuredProducts.length}+`, label: t('heroMetricOrders') },
    { value: '4.9/5', label: t('heroMetricRating') },
    { value: '100%', label: t('heroMetricAuthentic') },
  ]
  const trustItems = [
    { icon: ShieldCheck, title: t('trust.authenticTitle'), description: t('trust.authenticDescription') },
    { icon: Truck, title: t('trust.shippingTitle'), description: t('trust.shippingDescription') },
    { icon: BadgeCheck, title: t('trust.supportTitle'), description: t('trust.supportDescription') },
  ]
  const builderSteps = [
    { step: '01', title: t('builderSteps.step1Title'), description: t('builderSteps.step1Description') },
    { step: '02', title: t('builderSteps.step2Title'), description: t('builderSteps.step2Description') },
    { step: '03', title: t('builderSteps.step3Title'), description: t('builderSteps.step3Description') },
  ]

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07080d] text-white">
      <section className="relative flex min-h-[620px] items-center overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#07080d] via-[#07080d]/85 to-[#07080d]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07080d] via-[#07080d]/45 to-transparent" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/20 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
              <Flame className="h-3.5 w-3.5" />
              {t('launchBadge')}
            </span>
            <h1 className="mt-5 text-5xl font-bold leading-tight sm:text-6xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {t('titleStart')}
              <br />
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">{t('titleAccent')}</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-slate-400">{t('description')}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ProtectedLink
                href="/builder"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <Wrench className="h-5 w-5" />
                {t('startBuilder')}
              </ProtectedLink>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-medium text-white transition-all hover:bg-white/15"
              >
                {t('exploreProducts')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <p className="text-lg font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950/70 via-[#0f1117]/95 to-[#0f1117]/95 p-6 shadow-[0_30px_100px_rgba(79,70,229,0.18)] backdrop-blur-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-indigo-300">{t('builderPromoTitle')}</p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {t('builderPromoDescription')}
                  </h2>
                </div>
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/15 p-3 text-indigo-300">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {builderSteps.map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/20 text-sm font-bold text-indigo-300">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-100">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#1e2535] bg-[#0b1020]/90 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{t('mockupLabel')}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('mockupStatus')}
                  </span>
                </div>
                <p className="mt-2 text-2xl font-bold text-indigo-300">25.480.000 VND</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {['CPU', 'GPU', 'RAM', 'MB', 'SSD', 'PSU'].map((item) => (
                    <span key={item} className="rounded bg-indigo-500/15 px-2 py-1 text-xs text-indigo-300">
                      {item} OK
                    </span>
                  ))}
                </div>
              </div>

              <ProtectedLink
                href="/builder"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                {t('openBuilder')}
                <ArrowRight className="h-4 w-4" />
              </ProtectedLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {t('categoriesTitle')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t('categoriesDescription')}</p>
          </div>
          <Link href="/products" className="inline-flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:text-indigo-300">
            {t('exploreProducts')}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {categories.map((category) => {
            const normalized = normalizeCategoryName(category.tenDanhMuc)
            const Icon = iconMap[normalized as keyof typeof iconMap] || Cpu
            const accent = categoryStyles[normalized as keyof typeof categoryStyles] || categoryStyles.cpu

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.tenDanhMuc)}`}
                className={`group flex flex-col items-center gap-2.5 rounded-xl border bg-gradient-to-b ${accent.gradient} ${accent.border} p-4 transition-all duration-200 hover:scale-105`}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f1117] transition-transform group-hover:scale-110 ${accent.iconColor}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white">{category.tenDanhMuc}</p>
                  <p className="text-xs text-slate-500">{t(`categorySubtitles.${normalized as keyof typeof iconMap}`)}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="bg-[#0a0b10] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <TrendingUp className="h-5 w-5 text-indigo-400" />
                {t('featuredTitle')}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{t('featuredDescription')}</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:text-indigo-300">
              {t('exploreProducts')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-950 via-[#0f1117] to-[#0f1117]">
          <div className="absolute left-1/4 top-0 h-64 w-64 rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-violet-600/20 blur-3xl" />

          <div className="relative grid items-center gap-0 lg:grid-cols-2">
            <div className="p-8 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-xs text-indigo-300">
                <Wrench className="h-3.5 w-3.5" />
                {t('builderBadge')}
              </span>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {t('builderHeadline')}
                <br />
                <span className="text-indigo-400">{t('builderHeadlineAccent')}</span>
              </h2>
              <p className="mt-4 max-w-xl leading-relaxed text-slate-400">{t('builderDescription')}</p>

              <div className="mt-8 space-y-4">
                {builderSteps.map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-600/25 text-sm font-bold text-indigo-300">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <ProtectedLink
                href="/builder"
                className="mt-8 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-medium text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <Wrench className="h-5 w-5" />
                {t('startBuilder')}
                <ArrowRight className="h-4 w-4" />
              </ProtectedLink>
            </div>

            <div className="relative h-72 overflow-hidden lg:h-full lg:min-h-[24rem]">
              <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: `url(${PC_IMG})` }} />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-[#0a0e1a]/70" />

              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-[#1e2535] bg-[#0f1117]/90 p-4 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-400">{t('mockupLabel')}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {t('mockupStatus')}
                  </span>
                </div>
                <p className="mt-2 text-xl font-bold text-indigo-300">25.480.000 VND</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {['CPU', 'GPU', 'RAM', 'MB', 'SSD', 'PSU'].map((item) => (
                    <span key={item} className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-xs text-indigo-300">
                      {item} OK
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0a0b10] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <Flame className="h-5 w-5 text-red-400" />
                {t('latestTitle')}
              </h2>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1">
                <Clock className="h-3.5 w-3.5 text-red-400" />
                <span className="text-sm font-medium text-red-400">{t('countdownLabel')}</span>
              </div>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm text-indigo-400 transition-colors hover:text-indigo-300">
              {t('exploreProducts')}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/products"
            className="group relative block h-52 overflow-hidden rounded-3xl border border-[#1e2535] bg-[#0f1117]"
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-500 group-hover:scale-105 group-hover:opacity-50" style={{ backgroundImage: `url(${GPU_IMG})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <p className="text-sm font-medium text-purple-400">{t('promoCards.gpuEyebrow')}</p>
              <h3 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {t('promoCards.gpuTitle')}
              </h3>
              <span className="mt-2 inline-flex items-center gap-1 text-sm text-slate-300 transition-colors group-hover:text-white">
                {t('promoCards.gpuCta')}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </Link>

          <ProtectedLink
            href="/builder"
            className="group relative block h-52 overflow-hidden rounded-3xl border border-[#1e2535] bg-[#0f1117]"
          >
            <div className="absolute inset-0 bg-cover bg-center opacity-40 transition-all duration-500 group-hover:scale-105 group-hover:opacity-50" style={{ backgroundImage: `url(${PC_IMG})` }} />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/70 to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <p className="text-sm font-medium text-indigo-400">{t('promoCards.builderEyebrow')}</p>
              <h3 className="mt-1 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                {t('promoCards.builderTitle')}
              </h3>
              <span className="mt-2 inline-flex items-center gap-1 text-sm text-slate-300 transition-colors group-hover:text-white">
                {t('promoCards.builderCta')}
                <ArrowRight className="h-4 w-4" />
              </span>
            </div>
          </ProtectedLink>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/8 bg-white/5 p-5">
              <div className="mb-4 inline-flex rounded-2xl border border-white/10 bg-white/5 p-3 text-indigo-300">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#0a0b10] py-10">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="flex items-center gap-2 text-2xl font-bold text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <Award className="h-5 w-5 text-emerald-400" />
              {t('brandsTitle')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">{t('brandsDescription')}</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {trustedBrands.map((brand) => (
              <span
                key={brand}
                className="cursor-pointer text-sm font-semibold text-slate-600 transition-colors hover:text-slate-400 sm:text-base"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
