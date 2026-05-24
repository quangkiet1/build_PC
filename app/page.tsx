import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
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
import { AnimatedSection } from '@/components/motion/AnimatedSection'
import { getStorefrontData, normalizeCategoryName } from '@/lib/catalog'
import { getTranslator } from '@/i18n/server'
import { InfiniteSlider } from '@/app/components/InfiniteSlider'
import { Hero3DWrapper } from '@/app/components/webgl/Hero3DWrapper'

const HERO_IMG = 'https://images.unsplash.com/photo-1621164071312-67bb68821b3f?auto=format&fit=crop&w=1400&q=75&fm=webp'
const PC_IMG = 'https://images.unsplash.com/photo-1634003309303-442c7518f9e9?auto=format&fit=crop&w=1000&q=75&fm=webp'

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

const trustedBrands = ['Intel', 'AMD', 'ASUS', 'MSI', 'Gigabyte', 'Corsair', 'Samsung', 'Kingston']

export default async function HomePage() {
  const t = await getTranslator('home')
  const headerT = await getTranslator('header')
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
    <main className="min-h-screen overflow-x-hidden bg-[#030304] text-white font-body selection:bg-[#F7931A] selection:text-white">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-radial-blur pointer-events-none"></div>
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-radial-blur pointer-events-none"></div>
      </div>

      {/* HERO SECTION */}
      <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden border-b border-white/5 pb-8 pt-14 z-10 lg:min-h-[700px] lg:pb-10 lg:pt-16">
        <Hero3DWrapper />
        <div className="absolute inset-0 z-[1] pointer-events-none bg-[radial-gradient(circle_at_72%_42%,rgba(247,147,26,0.18),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(56,189,248,0.12),transparent_30%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <AnimatedSection className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10" staggerSelector="[data-animate-item]">
            <div className="max-w-3xl" data-animate-item>
              <span className="inline-flex items-center gap-2 rounded-full border border-[#F7931A]/30 bg-[#F7931A]/10 px-4 py-1.5 text-xs font-mono font-medium text-[#FFD600] shadow-[0_0_15px_-5px_rgba(247,147,26,0.3)]">
                <Flame className="h-3.5 w-3.5" />
                {t('launchBadge')}
              </span>
              
              <h1 className="mt-6 text-5xl sm:text-6xl md:text-7xl font-heading font-bold leading-[1.1] tracking-tight">
                {t('titleStart')}
                <br />
                <span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">{t('titleAccent')}</span>
              </h1>
              
              <p className="mt-6 text-lg md:text-xl leading-relaxed text-muted max-w-2xl">
                {t('description')}
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <ProtectedLink
                  href="/builder"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-8 py-4 font-semibold text-white shadow-[0_0_20px_-5px_rgba(247,147,26,0.6)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(247,147,26,0.8)]"
                >
                  <Wrench className="h-5 w-5" />
                  {t('startBuilder')}
                </ProtectedLink>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                >
                  {t('exploreProducts')}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-8 border-t border-white/10 pt-5 md:gap-12">
                {heroStats.map((stat) => (
                  <div key={stat.label} data-animate-item className="flex flex-col gap-1">
                    <p className="text-3xl md:text-4xl font-heading font-bold text-white">{stat.value}</p>
                    <p className="text-xs font-mono text-muted uppercase tracking-wider">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>


          </AnimatedSection>
        </div>
      </section>

      {/* CATEGORIES GRID */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16 relative z-10">
        <AnimatedSection staggerSelector="[data-animate-item]">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6" data-animate-item>
            <div>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">
                {t('categoriesTitle')}
              </h2>
              <p className="mt-2 text-muted max-w-xl">{t('categoriesDescription')}</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-mono text-[#F7931A] transition-all hover:text-[#FFD600] group">
              {t('exploreProducts')}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category) => {
              const normalized = normalizeCategoryName(category.tenDanhMuc)
              const Icon = iconMap[normalized as keyof typeof iconMap] || Cpu

              return (
                <Link
                  key={category.id}
                  href={`/products?category=${encodeURIComponent(category.tenDanhMuc)}`}
                  data-animate-item
                  className="group flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-[#0F1115] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#F7931A]/40 hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.15)] relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#F7931A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white group-hover:text-[#F7931A] group-hover:border-[#F7931A]/30 transition-all">
                    <Icon className="h-6 w-6" strokeWidth={1.5} />
                  </div>
                  <div className="text-center relative z-10">
                    <p className="text-sm font-semibold text-white">{category.tenDanhMuc}</p>
                    <p className="text-xs font-mono text-muted mt-1">{t(`categorySubtitles.${normalized as keyof typeof iconMap}`)}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </AnimatedSection>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-[#0F1115] py-16 lg:py-20 border-y border-white/5 relative z-10">
        <AnimatedSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" staggerSelector="[data-animate-item]">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6" data-animate-item>
            <div>
              <h2 className="flex items-center gap-3 text-3xl md:text-4xl font-heading font-bold text-white">
                <TrendingUp className="h-6 w-6 text-[#F7931A]" />
                {t('featuredTitle')}
              </h2>
              <p className="mt-2 text-muted">{t('featuredDescription')}</p>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-mono text-[#F7931A] transition-all hover:text-[#FFD600] group">
              {t('exploreProducts')}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product) => (
              <div key={product.id} data-animate-item>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </AnimatedSection>
      </section>

      {/* BUILDER SECTION */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:py-20 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="relative rounded-[2rem] border border-white/10 bg-[#0F1115] overflow-hidden shadow-[0_0_50px_-10px_rgba(247,147,26,0.05)]" staggerSelector="[data-animate-item]">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#F7931A]/10 to-transparent pointer-events-none" />
          
          <div className="relative grid items-center gap-8 lg:grid-cols-2 p-8 md:p-16">
            <div data-animate-item>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-white">
                <Wrench className="h-3.5 w-3.5 text-[#F7931A]" />
                {t('builderBadge')}
              </span>
              <h2 className="mt-6 text-4xl md:text-5xl font-heading font-bold text-white leading-tight">
                {t('builderHeadline')}
                <br />
                <span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">{t('builderHeadlineAccent')}</span>
              </h2>
              <p className="mt-6 text-lg text-muted max-w-xl">
                {t('builderDescription')}
              </p>

              <div className="mt-10 relative">
                {/* Blockchain vertical line */}
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-[#F7931A] via-[#F7931A]/50 to-transparent" />
                
                <div className="space-y-8 relative">
                  {builderSteps.map((item) => (
                    <div key={item.step} className="flex gap-6 relative">
                      <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-full bg-[#030304] border-2 border-[#F7931A] font-mono text-xs font-bold text-[#FFD600] shadow-[0_0_10px_rgba(247,147,26,0.5)] z-10">
                        {item.step}
                      </div>
                      <div className="pt-1">
                        <p className="text-base font-semibold text-white mb-1">{item.title}</p>
                        <p className="text-sm text-muted">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <ProtectedLink
                href="/builder"
                className="mt-12 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-8 py-4 font-semibold text-white shadow-[0_0_20px_-5px_rgba(247,147,26,0.5)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(247,147,26,0.7)]"
              >
                {t('startBuilder')}
                <ArrowRight className="h-5 w-5" />
              </ProtectedLink>
            </div>

            <div className="relative h-[400px] lg:h-full min-h-[400px] rounded-2xl border border-white/10 overflow-hidden" data-animate-item>
              <Image
                src={PC_IMG}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover opacity-45"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#030304] via-[#030304]/60 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 glass-panel rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono text-muted uppercase tracking-widest">{t('mockupLabel')}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#FFD600] bg-[#FFD600]/10 px-2 py-1 rounded border border-[#FFD600]/20 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FFD600]"></span>
                    {t('mockupStatus')}
                  </span>
                </div>
                <p className="text-3xl font-heading font-bold text-white mb-4">25.480.000 VND</p>
                <div className="flex flex-wrap gap-2">
                  {['CPU', 'GPU', 'RAM', 'MB', 'SSD', 'PSU'].map((item) => (
                    <span key={item} className="rounded bg-black/50 border border-white/10 px-2 py-1 text-[10px] font-mono text-white">
                      {item} <span className="text-[#F7931A]">OK</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* PROMO CARDS */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="grid gap-6 sm:grid-cols-2" staggerSelector="[data-animate-item]">
          <Link
            href="/products"
            data-animate-item
            className="group relative h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#0F1115]"
          >
            <Image
              src={HERO_IMG}
              alt=""
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover opacity-30 transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030304] to-transparent" />
            <div className="relative flex h-full flex-col justify-end p-8">
              <p className="text-xs font-mono text-[#F7931A] uppercase tracking-widest mb-2">{t('promoCards.gpuEyebrow')}</p>
              <h3 className="text-3xl font-heading font-bold text-white mb-4">
                {t('promoCards.gpuTitle')}
              </h3>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-[#F7931A] transition-colors">
                {t('promoCards.gpuCta')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>

          <ProtectedLink
            href="/builder"
            data-animate-item
            className="group relative h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-[#0F1115]"
          >
            <div className="absolute inset-0 bg-grid-pattern opacity-50 transition-opacity duration-500 group-hover:opacity-70" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="relative flex h-full flex-col justify-end p-8">
              <p className="text-xs font-mono text-[#FFD600] uppercase tracking-widest mb-2">{t('promoCards.builderEyebrow')}</p>
              <h3 className="text-3xl font-heading font-bold text-white mb-4">
                {t('promoCards.builderTitle')}
              </h3>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-[#FFD600] transition-colors">
                {t('promoCards.builderCta')}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </ProtectedLink>
        </AnimatedSection>
      </section>

      {/* TRUST FACTORS */}
      <section className="mx-auto max-w-7xl px-4 py-8 lg:py-12 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="grid gap-6 md:grid-cols-3" staggerSelector="[data-animate-item]">
          {trustItems.map((item) => (
            <div key={item.title} data-animate-item className="rounded-2xl border border-white/10 bg-[#0F1115] p-8 transition-all hover:border-[#F7931A]/30 hover:-translate-y-1">
              <div className="mb-6 inline-flex rounded-xl bg-white/5 border border-white/10 p-3 text-[#F7931A]">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-white mb-3">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.description}</p>
            </div>
          ))}
        </AnimatedSection>
      </section>

      {/* LATEST/BRANDS SECTION */}
      <section className="bg-[#0F1115] border-t border-white/5 pt-12 pb-6 relative z-10 overflow-hidden">
        <AnimatedSection className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" staggerSelector="[data-animate-item]">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6" data-animate-item>
            <div className="flex flex-wrap items-center gap-4">
              <h2 className="flex items-center gap-3 text-3xl font-heading font-bold text-white">
                <Flame className="h-6 w-6 text-[#EA580C]" />
                {t('latestTitle')}
              </h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#EA580C]/30 bg-[#EA580C]/10 px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-ping" />
                <span className="text-xs font-mono font-medium text-[#EA580C]">{t('countdownLabel')}</span>
              </div>
            </div>
            <Link href="/products" className="inline-flex items-center gap-2 text-sm font-mono text-[#F7931A] transition-all hover:text-[#FFD600] group">
              {t('exploreProducts')}
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8" data-animate-item>
            <InfiniteSlider speed={50}>
              {latest.map((product) => (
                <div key={product.id} className="w-[280px] md:w-[320px]">
                  <ProductCard product={product} />
                </div>
              ))}
            </InfiniteSlider>
          </div>
          
          <div className="mt-10 pt-6 border-t border-white/10" data-animate-item>
            <p className="text-center text-xs font-mono text-muted uppercase tracking-widest mb-6">{t('brandsTitle')}</p>
            <InfiniteSlider speed={80} reverse>
              {trustedBrands.map((brand) => (
                <span
                  key={brand}
                  className="mx-8 text-3xl md:text-5xl font-heading font-bold text-white/10 transition-colors hover:text-white/30"
                >
                  {brand}
                </span>
              ))}
            </InfiniteSlider>
          </div>
        </AnimatedSection>
      </section>

      <footer className="relative z-10 border-t border-white/10 bg-[#07080D]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
          <div>
            <div className="inline-flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#F7931A]/30 bg-[#F7931A]/10 text-[#FFD600]">
                <Cpu className="h-5 w-5" />
              </span>
              <span className="text-2xl font-heading font-bold text-white">PC Builder</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
              {t('description')}
            </p>
          </div>

          <nav className="grid gap-3 text-sm font-mono uppercase tracking-widest text-muted">
            <Link href="/products" className="transition hover:text-[#F7931A]">
              {headerT('products')}
            </Link>
            <ProtectedLink href="/builder" className="transition hover:text-[#F7931A]">
              {headerT('builder')}
            </ProtectedLink>
            <Link href="/promotions" className="transition hover:text-[#F7931A]">
              {headerT('promotions')}
            </Link>
          </nav>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {trustItems.map((item) => (
              <div key={item.title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <item.icon className="h-4 w-4 shrink-0 text-[#F7931A]" />
                <span className="text-xs font-mono uppercase tracking-wider text-white/80">{item.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-white/10 px-4 py-4 text-center text-[11px] font-mono uppercase tracking-widest text-muted">
          (c) 2026 PC Builder. {t('brandsTitle')}.
        </div>
      </footer>
    </main>
  )
}
