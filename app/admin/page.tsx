import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Shield, Users, ShoppingCart, Boxes, Percent, ArrowRight, Folder, ClipboardList } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-user'

export default async function AdminDashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/?auth=required&next=/admin')
  }

  if (user.vaiTro !== 'QUAN_TRI_VIEN') {
    redirect('/?auth=forbidden&next=/admin')
  }

  const [productCount, userCount, orderCount, pendingOrderCount, promotionCount] = await Promise.all([
    prisma.sanPham.count(),
    prisma.nguoiDung.count(),
    prisma.donHang.count(),
    prisma.donHang.count({ where: { trangThai: 'CHO_XAC_NHAN' } }),
    prisma.khuyenMai.count(),
  ])

  return (
    <main className="min-h-screen bg-[#07080d] text-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-3xl border border-amber-500/20 bg-linear-to-r from-amber-500/15 to-indigo-500/10 p-6">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-amber-300" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="mt-2 text-slate-300">Xin chào {user.hoTen}. Bạn đang đăng nhập với quyền Quản trị viên.</p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard title="Tổng sản phẩm" value={productCount} icon={<Boxes className="h-5 w-5 text-indigo-300" />} />
          <StatCard title="Tổng người dùng" value={userCount} icon={<Users className="h-5 w-5 text-emerald-300" />} />
          <StatCard title="Tổng đơn hàng" value={orderCount} icon={<ShoppingCart className="h-5 w-5 text-cyan-300" />} />
          <StatCard title="Đơn chờ xử lý" value={pendingOrderCount} icon={<ShoppingCart className="h-5 w-5 text-amber-300" />} />
          <StatCard title="Khuyến mãi" value={promotionCount} icon={<Percent className="h-5 w-5 text-pink-300" />} />
        </section>

        <section className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          <AdminLink href="/admin/products" title="Quản lý sản phẩm" desc="Thêm, cập nhật và xóa sản phẩm." />
          <AdminLink href="/admin/categories" title="Quản lý danh mục" desc="Tạo, sửa và xóa danh mục sản phẩm." icon={<Folder className="h-5 w-5 text-cyan-300" />} />
          <AdminLink href="/admin/orders" title="Quản lý đơn hàng" desc="Theo dõi đơn hàng và cập nhật trạng thái." icon={<ClipboardList className="h-5 w-5 text-emerald-300" />} />
          <AdminLink href="/admin/users" title="Quản lý người dùng" desc="Quản lý quyền và xóa tài khoản." icon={<Users className="h-5 w-5 text-amber-300" />} />
          <AdminLink href="/admin/promotions" title="Quản lý khuyến mãi" desc="Quản lý mã giảm giá và khuyến mãi." />
        </section>
      </div>
    </main>
  )
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: ReactNode }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-400">{title}</p>
        {icon}
      </div>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </article>
  )
}

function AdminLink({ href, title, desc, icon }: { href: string; title: string; desc: string; icon?: ReactNode }) {
  return (
    <Link href={href} className="group rounded-2xl border border-slate-800 bg-[#0f1117] p-5 transition hover:border-indigo-500/40 hover:bg-[#141a26]">
      <div className="flex items-center gap-3">
        {icon ?? <ArrowRight className="h-5 w-5 text-indigo-300" />}
        <div>
          <p className="text-lg font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{desc}</p>
        </div>
      </div>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-300">
        Mở nhanh <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  )
}
