import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ProductCard } from '@/app/components/ProductCard'
import { readSpecString } from '@/lib/types'
import { AddToCartButton } from '@/components/add-to-cart-button'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await prisma.sanPham.findFirst({
    where: {
      OR: [{ slug }, { id: slug }]
    },
    include: { danhMuc: true }
  })

  if (!product) {
    notFound()
  }

  const relatedProducts = await prisma.sanPham.findMany({
    where: {
      danhMucId: product.danhMucId,
      id: { not: product.id }
    },
    include: { danhMuc: true },
    take: 4,
    orderBy: { createdAt: 'desc' }
  })

  const specs =
    product.thongSoKyThuat && typeof product.thongSoKyThuat === 'object' && !Array.isArray(product.thongSoKyThuat)
      ? Object.entries(product.thongSoKyThuat)
      : []

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-sm text-slate-500">
          <Link href="/" className="transition hover:text-sky-300">Trang chu</Link> /{' '}
          <Link href="/products" className="transition hover:text-sky-300">San pham</Link> / <span className="text-slate-300">{product.tenSanPham}</span>
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <div className="aspect-square overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 p-6">
              <Image
                src={product.hinhAnh || '/images/cpu-i7.svg'}
                alt={product.tenSanPham}
                width={400}
                height={400}
                className="h-full w-full object-contain"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">{product.danhMuc?.tenDanhMuc || 'San pham'}</p>
              <h1 className="mt-3 text-4xl font-bold">{product.tenSanPham}</h1>
              <p className="mt-4 text-3xl font-semibold text-sky-300">{product.gia.toLocaleString('vi-VN')} VND</p>
              <p className="mt-4 text-slate-300">{product.moTa || 'San pham chua co mo ta chi tiet.'}</p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-5 text-sm text-slate-300 sm:grid-cols-2">
              <div>
                <p className="text-slate-500">Ton kho</p>
                <p className="mt-1 font-semibold text-white">{product.soLuongTon > 0 ? `${product.soLuongTon} san pham` : 'Het hang'}</p>
              </div>
              <div>
                <p className="text-slate-500">Thuong hieu</p>
                <p className="mt-1 font-semibold text-white">{product.tenSanPham.split(' ').slice(0, 2).join(' ')}</p>
              </div>
              <div>
                <p className="text-slate-500">Socket</p>
                <p className="mt-1 font-semibold text-white">{readSpecString(product.thongSoKyThuat, 'socket') || 'Khong co'}</p>
              </div>
              <div>
                <p className="text-slate-500">RAM type</p>
                <p className="mt-1 font-semibold text-white">{readSpecString(product.thongSoKyThuat, 'ram_type', 'type', 'memory') || 'Khong co'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <h2 className="text-lg font-semibold">Thong so ky thuat</h2>
              <div className="mt-4 grid gap-3 text-sm">
                {specs.length === 0 ? (
                  <p className="text-slate-400">Chua co du lieu thong so ky thuat.</p>
                ) : (
                  specs.map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3">
                      <span className="text-slate-400">{key}</span>
                      <span className="font-medium text-white">{String(value)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="max-w-sm">
              <AddToCartButton productId={product.id} />
            </div>
          </div>
        </div>

        <section className="mt-14">
          <div className="mb-6 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">San pham lien quan</h2>
            <Link href="/products" className="text-sm text-sky-300 transition hover:text-sky-200">Xem them</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
