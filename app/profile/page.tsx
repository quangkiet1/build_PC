import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { User, Shield, Mail, Phone, MapPin } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-user'

const roleLabelMap: Record<string, string> = {
  KHACH_HANG: 'User',
  QUAN_TRI_VIEN: 'Admin'
}

export default async function ProfilePage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?auth=required&next=/profile')
  }

  const [orderCount, cartItemCount] = await Promise.all([
    prisma.donHang.count({ where: { nguoiDungId: user.id } }),
    prisma.gioHangItem.count({ where: { gioHang: { nguoiDungId: user.id } } })
  ])

  return (
    <main className="min-h-screen bg-[#07080d] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-3xl border border-indigo-500/20 bg-linear-to-br from-indigo-500/10 to-slate-900 p-6">
          <div className="flex items-center gap-3">
            <User className="h-7 w-7 text-indigo-300" />
            <div>
              <h1 className="text-3xl font-bold">Thông tin tài khoản</h1>
              <p className="text-slate-400">Xem role và thông tin cá nhân của bạn.</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <InfoCard
            icon={<Mail className="h-5 w-5 text-cyan-300" />}
            label="Tên đăng nhập"
            value={user.email}
          />
          <InfoCard
            icon={<User className="h-5 w-5 text-emerald-300" />}
            label="Họ tên"
            value={user.hoTen}
          />
          <InfoCard
            icon={<Shield className="h-5 w-5 text-amber-300" />}
            label="Role"
            value={roleLabelMap[user.vaiTro] || user.vaiTro}
          />
          <InfoCard
            icon={<Phone className="h-5 w-5 text-purple-300" />}
            label="Số điện thoại"
            value={user.soDienThoai || 'Chưa cập nhật'}
          />
          <InfoCard
            icon={<MapPin className="h-5 w-5 text-rose-300" />}
            label="Địa chỉ"
            value={user.diaChi || 'Chưa cập nhật'}
          />
          <InfoCard
            icon={<Shield className="h-5 w-5 text-indigo-300" />}
            label="Ngày tham gia"
            value={new Date(user.ngayTao).toLocaleDateString('vi-VN')}
          />
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
            <p className="text-sm text-slate-400">Tổng đơn hàng</p>
            <p className="mt-2 text-3xl font-bold">{orderCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
            <p className="text-sm text-slate-400">Sản phẩm trong giỏ</p>
            <p className="mt-2 text-3xl font-bold">{cartItemCount}</p>
          </div>
        </section>

        <section className="flex flex-wrap gap-3">
          <Link href="/cart" className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold hover:bg-indigo-500">
            Mở giỏ hàng
          </Link>
          {user.vaiTro === 'QUAN_TRI_VIEN' && (
            <Link href="/admin" className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2 font-semibold text-amber-300 hover:bg-amber-500/20">
              Vào admin dashboard
            </Link>
          )}
        </section>
      </div>
    </main>
  )
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-[#0f1117] p-5">
      <div className="flex items-center gap-2 text-slate-400">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </article>
  )
}
