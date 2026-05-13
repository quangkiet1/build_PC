import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { Award, KeyRound, Mail, MapPin, Phone, Shield, User } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-user'
import { getI18nServer, getTranslator } from '@/i18n/server'
import { getMembershipTier } from '@/lib/rewards'

export default async function ProfilePage() {
  const t = await getTranslator('profilePage')
  const { locale } = await getI18nServer()
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?auth=required&next=/profile')
  }

  const [orderCount, cartItemCount, pointHistory] = await Promise.all([
    prisma.donHang.count({ where: { nguoiDungId: user.id } }),
    prisma.gioHangItem.count({ where: { gioHang: { nguoiDungId: user.id } } }),
    prisma.lichSuDiem.findMany({
      where: { nguoiDungId: user.id },
      include: { donHang: { select: { maDonHang: true } } },
      orderBy: { ngayTao: 'desc' },
      take: 5,
    })
  ])
  const tier = getMembershipTier(user.diemTichLuy)

  return (
    <main className="min-h-screen bg-[#07080d] px-4 py-10 text-white sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
      <div className="mx-auto max-w-4xl space-y-8 relative z-10">
        <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(99,102,241,0.1),rgba(15,23,42,0.6))] backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(79,70,229,0.1)]">
          <div className="flex items-center gap-4">
            <User className="h-7 w-7 text-indigo-300" />
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-slate-400">{t('description')}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <InfoCard
            icon={<Mail className="h-5 w-5 text-cyan-300" />}
            label={t('email')}
            value={user.email}
          />
          <InfoCard
            icon={<User className="h-5 w-5 text-emerald-300" />}
            label={t('name')}
            value={user.hoTen}
          />
          <InfoCard
            icon={<Phone className="h-5 w-5 text-purple-300" />}
            label={t('phone')}
            value={user.soDienThoai || t('notUpdated')}
          />
          <InfoCard
            icon={<MapPin className="h-5 w-5 text-rose-300" />}
            label={t('address')}
            value={user.diaChi || t('notUpdated')}
          />
          <InfoCard
            icon={<Shield className="h-5 w-5 text-indigo-300" />}
            label={t('joined')}
            value={new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(new Date(user.ngayTao))}
          />
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl p-6 shadow-xl transition-all hover:border-indigo-500/30">
            <p className="text-sm text-slate-400 uppercase tracking-wider">{t('orders')}</p>
            <p className="mt-2 text-4xl font-bold bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">{orderCount}</p>
          </div>
          <div className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl p-6 shadow-xl transition-all hover:border-indigo-500/30">
            <p className="text-sm text-slate-400 uppercase tracking-wider">{t('cartItems')}</p>
            <p className="mt-2 text-4xl font-bold bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent">{cartItemCount}</p>
          </div>
        </section>

        <section className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-300">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-400">Diem thanh vien</p>
                <p className="mt-1 text-3xl font-bold text-white">{user.diemTichLuy.toLocaleString('vi-VN')} diem</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">Hang</p>
              <p className="text-lg font-semibold text-amber-300">{tier}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {pointHistory.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">Chua co lich su diem.</p>
            ) : (
              pointHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">{item.lyDo}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.donHang?.maDonHang || 'Tai khoan'} - {new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(new Date(item.ngayTao))}</p>
                  </div>
                  <span className={item.loai === 'CONG' ? 'text-emerald-300' : 'text-rose-300'}>
                    {item.loai === 'CONG' ? '+' : '-'}{item.diem}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="flex flex-wrap gap-4 mt-8">
          <Link href="/cart" className="rounded-[12px] bg-[linear-gradient(135deg,#6366f1,#a855f7)] px-6 py-3 font-semibold hover:brightness-110 transition shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            {t('openCart')}
          </Link>
          <Link href="/account/codes" className="rounded-[12px] border border-cyan-500/40 bg-cyan-500/10 px-6 py-3 font-semibold text-cyan-200 hover:bg-cyan-500/20 transition inline-flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            Ma cua toi
          </Link>
          {user.vaiTro === 'QUAN_TRI_VIEN' && (
            <Link href="/admin" className="rounded-[12px] border border-amber-500/40 bg-amber-500/10 px-6 py-3 font-semibold text-amber-300 hover:bg-amber-500/20 transition">
              {t('openAdmin')}
            </Link>
          )}
        </section>
      </div>
    </main>
  )
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <article className="rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl p-6 shadow-lg transition hover:bg-white/5">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="p-2 bg-black/20 rounded-lg border border-white/5">
          {icon}
        </div>
        <span className="text-sm font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-3 text-lg font-semibold text-white ml-1">{value}</p>
    </article>
  )
}
