import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/app/components/ProductCard'

type ProductsPageProps = {
  searchParams?: Promise<{
    search?: string
    category?: string
    sort?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = (await searchParams) || {}
  const search = params.search?.trim() || ''
  const category = params.category?.trim() || ''
  const sort = params.sort || 'newest'

  const where = {
    ...(search
      ? {
          OR: [
            { tenSanPham: { contains: search, mode: 'insensitive' as const } },
            { moTa: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}),
    ...(category
      ? {
          danhMuc: {
            tenDanhMuc: { equals: category, mode: 'insensitive' as const }
          }
        }
      : {})
  }

  const orderBy =
    sort === 'price-asc'
      ? ({ gia: 'asc' } as const)
      : sort === 'price-desc'
        ? ({ gia: 'desc' } as const)
        : ({ createdAt: 'desc' } as const)

  const [products, categories] = await Promise.all([
    prisma.sanPham.findMany({
      where,
      include: { danhMuc: true },
      orderBy
    }),
    prisma.danhMuc.findMany({ orderBy: { tenDanhMuc: 'asc' } })
  ])

  const currentCategory = category || 'Tat ca'

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-slate-800 bg-slate-950/95">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            <Link href="/" className="transition hover:text-sky-300">Trang chu</Link> / <span className="text-slate-300">San pham</span>
          </p>
          <h1 className="mt-3 text-4xl font-bold">Danh sach san pham</h1>
          <p className="mt-2 text-slate-400">Tim kiem, loc theo danh muc va sap xep du lieu that tu PostgreSQL.</p>

          <form className="mt-6 grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-[2fr_1fr_1fr_auto]">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Tim CPU, GPU, SSD..."
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            />
            <select
              name="category"
              defaultValue={category}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            >
              <option value="">Tat ca danh muc</option>
              {categories.map((item) => (
                <option key={item.id} value={item.tenDanhMuc}>
                  {item.tenDanhMuc}
                </option>
              ))}
            </select>
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400"
            >
              <option value="newest">Moi nhat</option>
              <option value="price-asc">Gia tang dan</option>
              <option value="price-desc">Gia giam dan</option>
            </select>
            <button className="rounded-xl bg-sky-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-400">
              Ap dung
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-white">{products.length}</span> san pham {category ? `trong danh muc ${currentCategory}` : ''}
          </p>
          {(search || category || sort !== 'newest') && (
            <Link href="/products" className="text-sm text-sky-300 transition hover:text-sky-200">
              Xoa bo loc
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-10 text-center">
            <h2 className="text-2xl font-semibold">Khong tim thay san pham</h2>
            <p className="mt-2 text-slate-400">Thu doi tu khoa tim kiem hoac chon danh muc khac.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
