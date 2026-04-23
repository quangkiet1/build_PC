import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Boxes, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-user'

export default async function AdminBrandsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/?auth=required&next=/admin/brands')
  }

  if (user.vaiTro !== 'QUAN_TRI_VIEN') {
    redirect('/?auth=forbidden&next=/admin/brands')
  }

  // Get all unique brands with product counts
  const brandsWithCounts = await prisma.sanPham.groupBy({
    by: ['thuongHieu'],
    _count: {
      id: true,
    },
    where: {
      thuongHieu: {
        not: null,
      },
    },
    orderBy: {
      thuongHieu: 'asc',
    },
  })

  return (
    <main className="min-h-screen bg-[#07080d] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-amber-500/20 bg-linear-to-r from-amber-500/15 to-indigo-500/10 p-6">
          <div className="flex items-center gap-3">
            <Boxes className="h-6 w-6 text-amber-300" />
            <h1 className="text-3xl font-bold">Quản lý thương hiệu</h1>
          </div>
          <p className="mt-2 text-slate-300">Xem danh sách các thương hiệu và số lượng sản phẩm.</p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-[#0f1117] p-6">
          <h2 className="text-xl font-semibold mb-4">Danh sách thương hiệu</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandsWithCounts.map((brand) => (
              <BrandCard
                key={brand.thuongHieu}
                name={brand.thuongHieu!}
                count={brand._count.id}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function BrandCard({ name, count }: { name: string; count: number }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-[#141a26] p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-white">{name}</p>
          <p className="text-sm text-slate-400">{count} sản phẩm</p>
        </div>
        <Boxes className="h-6 w-6 text-indigo-300" />
      </div>
      <Link
        href={`/admin/products?brand=${encodeURIComponent(name)}`}
        className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-300 hover:text-indigo-200"
      >
        Xem sản phẩm <ArrowRight className="h-4 w-4" />
      </Link>
    </article>
  )
}