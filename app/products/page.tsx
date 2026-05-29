import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/app/components/ProductCard'
import { getTranslator } from '@/i18n/server'
import { AnimatedSection } from '@/components/motion/AnimatedSection'
import { ShieldCheck, SlidersHorizontal } from 'lucide-react'
import { aggregateProductBrands } from '@/lib/brands'

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
  const brandOptions = aggregateProductBrands(brands)

  const featuredProducts = products.slice(0, 4)
  const catalogProducts = products.slice(4)
  const activeFilterCount = [search, category, brand, sort !== 'newest' ? sort : ''].filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#030304] text-white font-body selection:bg-[#F7931A] selection:text-white pb-24">
      {/* BACKGROUND ELEMENTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-0 left-[10%] w-[40%] h-[40%] bg-radial-blur pointer-events-none"></div>
      </div>

      {/* HEADER SECTION */}
      <div className="relative z-10 border-b border-white/5 bg-[#0F1115]/80 backdrop-blur-xl pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <p className="text-xs font-mono text-[#F7931A] uppercase tracking-widest mb-4">
            <Link href="/" className="hover:text-[#FFD600] transition-colors">
              {t('breadcrumbHome')}
            </Link>{' '}
            <span className="text-white/50">/</span> <span className="text-white">{t('breadcrumbCurrent')}</span>
          </p>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-4 text-white">
            {t('title')}
          </h1>
          <p className="text-sm md:text-base text-muted max-w-2xl leading-relaxed">
            {t('description')}
          </p>
        </div>
        
        {/* FILTER BAR */}
        <div className="mt-8 mx-auto max-w-7xl px-4 md:px-8">
          <form className="flex flex-col md:flex-row gap-3 bg-[#030304]/50 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <div className="flex-1 relative">
              <input
                type="text"
                name="search"
                defaultValue={search}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] transition-all"
              />
            </div>
            <select
              name="category"
              defaultValue={category}
              className="md:w-48 bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] transition-all cursor-pointer"
            >
              <option value="">{t('allCategories')}</option>
              {categories.map((item) => (
                <option key={item.id} value={item.tenDanhMuc} className="bg-[#0F1115]">
                  {item.tenDanhMuc}
                </option>
              ))}
            </select>
            <select
              name="brand"
              defaultValue={brand}
              className="md:w-48 bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] transition-all cursor-pointer"
            >
              <option value="">Tất cả thương hiệu</option>
              {brandOptions.map((item) => (
                <option key={item.name} value={item.name} className="bg-[#0F1115]">
                  {item.name}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="md:w-48 bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] transition-all cursor-pointer"
            >
              <option value="newest" className="bg-[#0F1115]">{t('sortNewest')}</option>
              <option value="price-asc" className="bg-[#0F1115]">{t('sortPriceAsc')}</option>
              <option value="price-desc" className="bg-[#0F1115]">{t('sortPriceDesc')}</option>
            </select>
            <button className="flex items-center justify-center gap-2 md:w-32 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.7)]">
              <SlidersHorizontal className="h-4 w-4" />
              {t('apply')}
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-8 py-10 relative z-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <p className="text-xs font-mono text-muted uppercase tracking-widest">
            {t('count', {
              count: products.length,
              suffix: category ? t('inCategory', { category }) : '',
            })}
          </p>
          {(search || category || brand || sort !== 'newest') && (
            <Link href="/products" className="text-xs font-mono text-[#F7931A] hover:text-[#FFD600] transition-colors border border-[#F7931A]/30 bg-[#F7931A]/10 px-3 py-1.5 rounded-full inline-block w-fit">
              {t('clearFilters')}
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="border border-white/10 rounded-2xl p-16 text-center bg-[#0F1115]/50 backdrop-blur-md">
            <div className="mx-auto w-16 h-16 border border-white/10 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-muted">
              <SlidersHorizontal className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-heading font-bold mb-2">{t('emptyTitle')}</h2>
            <p className="text-sm text-muted max-w-md mx-auto">{t('emptyDescription')}</p>
          </div>
        ) : (
          <div className="space-y-16">
            {featuredProducts.length > 0 ? (
              <AnimatedSection staggerSelector="[data-animate-item]">
                <section className="grid gap-6 lg:grid-cols-3">
                  <div data-animate-item className="border border-white/10 rounded-2xl p-8 bg-[#0F1115] flex flex-col relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#F7931A]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="relative z-10">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#F7931A]/30 bg-[#F7931A]/10 px-3 py-1 mb-6 text-[10px] font-mono text-[#FFD600] uppercase tracking-widest shadow-[0_0_10px_rgba(247,147,26,0.2)]">
                        <ShieldCheck className="h-3 w-3" />
                        Premium Selection
                      </div>
                      
                      <h2 className="text-3xl font-heading font-bold leading-tight mb-4">Không gian mua linh kiện gọn hơn</h2>
                      <p className="text-sm text-muted leading-relaxed mb-8">
                        Khu vực nổi bật được thiết kế theo kiểu editorial shelf: nhiều card cạnh nhau, ít cảm giác phóng to,
                        nhìn premium hơn và dễ quét hơn trên desktop lẫn mobile.
                      </p>
                    </div>

                    <div className="mt-auto grid grid-cols-2 gap-3 relative z-10">
                      <div className="border border-white/10 rounded-xl bg-white/5 p-4 backdrop-blur-sm">
                        <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Hiển thị</p>
                        <p className="mt-1 text-2xl font-heading font-bold">{products.length}</p>
                      </div>
                      <div className="border border-white/10 rounded-xl bg-white/5 p-4 backdrop-blur-sm">
                        <p className="text-[10px] font-mono text-muted uppercase tracking-widest">Bộ lọc</p>
                        <p className="mt-1 text-2xl font-heading font-bold">{activeFilterCount}</p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {featuredProducts.map((product, index) => (
                      <div data-animate-item key={product.id}>
                        <ProductCard product={product} featured={index < 2} className="h-full" />
                      </div>
                    ))}
                  </div>
                </section>
              </AnimatedSection>
            ) : null}

            {catalogProducts.length > 0 ? (
              <AnimatedSection staggerSelector="[data-animate-item]">
                <section>
                  <div data-animate-item className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                      <h2 className="text-3xl font-heading font-bold">Tất cả sản phẩm</h2>
                      <p className="mt-2 text-sm text-muted">Khám phá toàn bộ danh mục linh kiện PC cao cấp.</p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono text-muted uppercase tracking-widest">
                      {catalogProducts.length} sản phẩm
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {catalogProducts.map((product) => (
                      <div data-animate-item key={product.id}>
                        <ProductCard product={product} className="h-full" />
                      </div>
                    ))}
                  </div>
                </section>
              </AnimatedSection>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
