import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/app/components/ProductCard'
import { getTranslator } from '@/i18n/server'

type ProductsPageProps = {
  searchParams?: Promise<{
    search?: string
    category?: string
    brand?: string
    sort?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const t = await getTranslator('productsPage')
  const params = (await searchParams) || {}
  const search = params.search?.trim() || ''
  const category = params.category?.trim() || ''
  const brand = params.brand?.trim() || ''
  const sort = params.sort || 'newest'

  const where = {
    ...(search
      ? {
          OR: [
            { tenSanPham: { contains: search, mode: 'insensitive' as const } },
            { moTa: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(category
      ? {
          danhMuc: {
            tenDanhMuc: { equals: category, mode: 'insensitive' as const },
          },
        }
      : {}),
    ...(brand
      ? {
          thuongHieu: { equals: brand, mode: 'insensitive' as const },
        }
      : {}),
  }

  const orderBy =
    sort === 'price-asc'
      ? ({ gia: 'asc' } as const)
      : sort === 'price-desc'
        ? ({ gia: 'desc' } as const)
        : ({ createdAt: 'desc' } as const)

  const [products, categories, brands] = await Promise.all([
    prisma.sanPham.findMany({
      where,
      include: { danhMuc: true },
      orderBy,
    }),
    prisma.danhMuc.findMany({ orderBy: { tenDanhMuc: 'asc' } }),
    prisma.sanPham.findMany({
      select: { thuongHieu: true },
      where: { thuongHieu: { not: null } },
      distinct: ['thuongHieu'],
      orderBy: { thuongHieu: 'asc' },
    }),
  ])

  const featuredProducts = products.slice(0, 4)
  const catalogProducts = products.slice(4)
  const activeFilterCount = [search, category, brand, sort !== 'newest' ? sort : ''].filter(Boolean).length

  return (
    <div className="min-h-screen text-white">
      <div className="border-b border-white/10 bg-[#05070d]/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            <Link href="/" className="transition hover:text-cyan-300">
              {t('breadcrumbHome')}
            </Link>{' '}
            / <span className="text-slate-300">{t('breadcrumbCurrent')}</span>
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-slate-400">{t('description')}</p>

          <form className="glass-card mt-6 grid gap-3 rounded-[28px] p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder={t('searchPlaceholder')}
              className="rounded-2xl border border-white/10 bg-[#08101d]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            />
            <select
              name="category"
              defaultValue={category}
              className="rounded-2xl border border-white/10 bg-[#08101d]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            >
              <option value="">{t('allCategories')}</option>
              {categories.map((item) => (
                <option key={item.id} value={item.tenDanhMuc}>
                  {item.tenDanhMuc}
                </option>
              ))}
            </select>
            <select
              name="brand"
              defaultValue={brand}
              className="rounded-2xl border border-white/10 bg-[#08101d]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            >
              <option value="">Tat ca thuong hieu</option>
              {brands.map((item) => (
                <option key={item.thuongHieu} value={item.thuongHieu!}>
                  {item.thuongHieu}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-2xl border border-white/10 bg-[#08101d]/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
            >
              <option value="newest">{t('sortNewest')}</option>
              <option value="price-asc">{t('sortPriceAsc')}</option>
              <option value="price-desc">{t('sortPriceDesc')}</option>
            </select>
            <button className="rounded-2xl bg-[linear-gradient(135deg,#22d3ee,#8b5cf6)] px-5 py-3 font-semibold text-slate-950 transition hover:brightness-110">
              {t('apply')}
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="font-tech text-sm uppercase tracking-[0.24em] text-slate-500">
            {t('count', {
              count: products.length,
              suffix: category ? t('inCategory', { category }) : '',
            })}
          </p>
          {(search || category || brand || sort !== 'newest') && (
            <Link href="/products" className="text-sm text-cyan-300 transition hover:text-cyan-200">
              {t('clearFilters')}
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="glass-card rounded-[28px] p-10 text-center">
            <h2 className="text-2xl font-semibold">{t('emptyTitle')}</h2>
            <p className="mt-2 text-slate-400">{t('emptyDescription')}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {featuredProducts.length > 0 ? (
              <section className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
                <div className="glass-card rounded-[30px] p-6">
                  <p className="font-tech text-xs uppercase tracking-[0.3em] text-cyan-300/70">Storefront edit</p>
                  <h2 className="mt-3 text-2xl font-semibold text-white">Khong gian mua linh kien gon hon</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    Minh doi khu noi bat sang kieu editorial shelf: nhieu card can nhau, it cam giac phong to,
                    nhin premium hon va de quet hon tren desktop lan mobile.
                  </p>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                      <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-slate-500">Visible now</p>
                      <p className="mt-2 text-xl font-semibold text-white">{products.length}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                      <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-slate-500">Active filters</p>
                      <p className="mt-2 text-xl font-semibold text-white">{activeFilterCount}</p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/4 px-4 py-3">
                      <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-slate-500">Featured shelf</p>
                      <p className="mt-2 text-xl font-semibold text-white">{featuredProducts.length}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-200">
                      compact spotlight
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      balanced cards
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                      cleaner rhythm
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {featuredProducts.map((product, index) => (
                    <ProductCard key={product.id} product={product} featured={index < 2} className="h-full" />
                  ))}
                </div>
              </section>
            ) : null}

            {catalogProducts.length > 0 ? (
              <section className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-tech text-xs uppercase tracking-[0.28em] text-slate-500">Full catalog</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Tat ca san pham</h2>
                    <p className="mt-1 text-sm text-slate-400">Danh sach chinh duoc can lai theo nhip grid deu va thoang hon.</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
                    {catalogProducts.length} more items
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                  {catalogProducts.map((product) => (
                    <ProductCard key={product.id} product={product} className="h-full" />
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
