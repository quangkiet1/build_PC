import Link from 'next/link'
import { ArrowRight, Cpu, Database, HardDrive, LayoutGrid, Monitor, Package, Wind, Wrench, Zap } from 'lucide-react'
import { ProductCard } from '@/app/components/ProductCard'
import { ProtectedLink } from '@/components/ProtectedLink'
import { getStorefrontData, normalizeCategoryName } from '@/lib/catalog'
import { getTranslator } from '@/i18n/server'

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
  const { categories, featuredProducts, latestProducts } = await getStorefrontData()

  const featured = featuredProducts.slice(0, 4)
  const latest = latestProducts.slice(0, 4)

  return (
    <main className="min-h-screen bg-[#07080d] text-white">
      <section className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.22),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_26%),linear-gradient(180deg,#07080d,#0b1020)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.25em] text-indigo-300">
              {t('eyebrow')}
            </span>
            <h1 className="mt-6 text-5xl font-bold leading-[1.05] sm:text-6xl">
              {t('titleStart')}
              <br />
              <span className="bg-linear-to-r from-indigo-400 via-sky-300 to-fuchsia-400 bg-clip-text text-transparent">
                {t('titleAccent')}
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">{t('description')}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              <ProtectedLink
                href="/builder"
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition-all hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/30"
              >
                <Wrench className="h-5 w-5" />
                {t('startBuilder')}
              </ProtectedLink>
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/15"
              >
                {t('exploreProducts')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid max-w-2xl grid-cols-3 gap-4">
              {[
                { value: `${categories.length}+`, label: t('statCategories') },
                { value: `${featuredProducts.length}+`, label: t('statFeatured') },
                { value: '24/7', label: t('statSupport') },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-xl font-bold text-white sm:text-2xl">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-indigo-400/20 bg-[#0f1117]/90 p-6 shadow-2xl shadow-indigo-950/30">
            <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{t('builderPromoTitle')}</p>
              <p className="mt-4 text-lg font-semibold text-white">{t('builderPromoDescription')}</p>
              <div className="mt-6 space-y-3 text-sm text-slate-300">
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">{t('builderFeatureSave')}</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">{t('builderFeatureCompare')}</div>
                <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">{t('builderFeatureCompatibility')}</div>
              </div>
              <ProtectedLink
                href="/builder"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-500"
              >
                {t('openBuilder')}
                <ArrowRight className="h-4 w-4" />
              </ProtectedLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">{t('categoriesTitle')}</h2>
            <p className="mt-2 text-slate-400">{t('categoriesDescription')}</p>
          </div>
          <Link href="/products" className="text-sm font-medium text-sky-300 transition hover:text-sky-200">
            {t('exploreProducts')}
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const normalized = normalizeCategoryName(category.tenDanhMuc)
            const Icon = iconMap[normalized as keyof typeof iconMap] || Cpu

            return (
              <Link
                key={category.id}
                href={`/products?category=${encodeURIComponent(category.tenDanhMuc)}`}
                className="group rounded-3xl border border-slate-800 bg-[#0f1117] p-5 transition hover:border-indigo-500/30 hover:bg-[#111727]"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-300">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">{category.tenDanhMuc}</h3>
                <p className="mt-2 text-sm text-slate-400">{t('categoryCount', { count: category._count.sanPhams })}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">{t('featuredTitle')}</h2>
          <p className="mt-2 text-slate-400">{t('featuredDescription')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white">{t('latestTitle')}</h2>
          <p className="mt-2 text-slate-400">{t('latestDescription')}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {latest.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0b0f18]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white">{t('brandsTitle')}</h2>
            <p className="mt-2 text-slate-400">{t('brandsDescription')}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {trustedBrands.map((brand) => (
              <div key={brand} className="rounded-2xl border border-slate-800 bg-slate-900/50 px-5 py-4 text-center font-semibold text-slate-200">
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
