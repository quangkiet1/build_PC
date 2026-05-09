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
    <div className="min-h-screen bg-[#07080d] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.08),transparent_50%)] pointer-events-none" />
        <p className="text-sm text-slate-500">
          <Link href="/" className="transition hover:text-sky-300">Trang chu</Link> /{' '}
          <Link href="/products" className="transition hover:text-sky-300">San pham</Link> / <span className="text-slate-300">{product.tenSanPham}</span>
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] relative z-10">
          <div className="rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] p-8 shadow-2xl backdrop-blur-xl">
            <div className="relative aspect-square overflow-hidden rounded-[24px] bg-black/40 p-6 flex items-center justify-center">
              <div className="absolute inset-0 bg-sky-400/10 blur-[100px] rounded-full scale-75" />
              <Image
                src={(product.hinhAnh || '/images/cpu-i7.svg').replace('via.placeholder.com', 'placehold.co')}
                alt={product.tenSanPham}
                fill
                className="object-contain p-8 drop-shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-transform duration-700 hover:scale-105"
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

            <div className="grid gap-4 rounded-[24px] border border-white/10 bg-white/5 p-6 text-sm text-slate-300 sm:grid-cols-2 backdrop-blur-md">
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

            <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h2 className="text-lg font-semibold text-white">Thong so ky thuat</h2>
              <div className="mt-5 grid gap-3 text-sm">
                {specs.length === 0 ? (
                  <p className="text-slate-400">Chua co du lieu thong so ky thuat.</p>
                ) : (
                  specs.map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/20 px-5 py-3 transition hover:bg-black/30">
                      <span className="text-slate-400 font-medium">{key}</span>
                      <span className="font-semibold text-white">{String(value)}</span>
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
