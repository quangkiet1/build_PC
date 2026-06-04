import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Shield, Users, ShoppingCart, Boxes, Percent, ArrowRight, Folder, ClipboardList } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-user'
import { getTranslator } from '@/i18n/server'

export default async function AdminDashboardPage() {
  const t = await getTranslator('admin')
  // Middleware đã bảo vệ route này rồi, chỉ cần lấy user data để hiển thị
  const user = await getCurrentUser()

  if (!user || user.vaiTro !== 'QUAN_TRI_VIEN') {
    redirect('/')
  }

  const [productCount, userCount, orderCount, pendingOrderCount, promotionCount] = await Promise.all([
    prisma.sanPham.count(),
    prisma.nguoiDung.count(),
    prisma.donHang.count(),
    prisma.donHang.count({ where: { trangThai: 'CHO_XAC_NHAN' } }),
    prisma.khuyenMai.count(),
  ])

  return (
    <main className="min-h-screen bg-[#030304] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-[#F7931A]/20 bg-gradient-to-r from-[#F7931A]/15 to-[#FFD600]/10 p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-amber-300" />
            <h1 className="text-3xl font-bold">{t('dashboard.title')}</h1>
          </div>
          <p className="mt-2 text-slate-300">{t('dashboard.welcome', { name: user.hoTen })}</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title={t('dashboard.stats.products')} value={productCount} icon={<Boxes className="h-5 w-5 text-[#FFD600]" />} />
          <StatCard title={t('dashboard.stats.users')} value={userCount} icon={<Users className="h-5 w-5 text-emerald-300" />} />
          <StatCard title={t('dashboard.stats.orders')} value={orderCount} icon={<ShoppingCart className="h-5 w-5 text-[#FFD600]" />} />
          <StatCard title={t('dashboard.stats.pendingOrders')} value={pendingOrderCount} icon={<ShoppingCart className="h-5 w-5 text-amber-300" />} />
          <StatCard title={t('dashboard.stats.promotions')} value={promotionCount} icon={<Percent className="h-5 w-5 text-pink-300" />} />
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <AdminLink href="/admin/products" title={t('dashboard.links.productsTitle')} desc={t('dashboard.links.productsDescription')} openLabel={t('dashboard.open')} />
          <AdminLink href="/admin/brands" title={t('dashboard.links.brandsTitle')} desc={t('dashboard.links.brandsDescription')} openLabel={t('dashboard.open')} icon={<Boxes className="h-5 w-5 text-[#FFD600]" />} />
          <AdminLink href="/admin/categories" title={t('dashboard.links.categoriesTitle')} desc={t('dashboard.links.categoriesDescription')} openLabel={t('dashboard.open')} icon={<Folder className="h-5 w-5 text-[#FFD600]" />} />
          <AdminLink href="/admin/orders" title={t('dashboard.links.ordersTitle')} desc={t('dashboard.links.ordersDescription')} openLabel={t('dashboard.open')} icon={<ClipboardList className="h-5 w-5 text-emerald-300" />} />
          <AdminLink href="/admin/users" title={t('dashboard.links.usersTitle')} desc={t('dashboard.links.usersDescription')} openLabel={t('dashboard.open')} icon={<Users className="h-5 w-5 text-amber-300" />} />
          <AdminLink href="/admin/promotions" title={t('dashboard.links.promotionsTitle')} desc={t('dashboard.links.promotionsDescription')} openLabel={t('dashboard.open')} />
        </section>
      </div>
    </main>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0F1115] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </article>
  )
}

function AdminLink({ href, title, desc, openLabel, icon }: { href: string; title: string; desc: string; openLabel: string; icon?: ReactNode }) {
  return (
    <Link href={href} className="group rounded-2xl border border-white/10 bg-[#0F1115] p-5 transition hover:border-[#F7931A]/40 hover:bg-[#141a26]">
      <div className="flex items-center gap-3">
        {icon ?? <ArrowRight className="h-5 w-5 text-[#FFD600]" />}
        <div>
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{desc}</p>
        </div>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#FFD600]">
        {openLabel} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
