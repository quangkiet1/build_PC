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
    <main className="relative min-h-screen overflow-hidden bg-[#030304] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-3/4 w-3/4 bg-radial-blur" />
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-3/4 w-3/4 bg-radial-blur" />
      <div className="mx-auto max-w-4xl space-y-8 relative z-10">
        <section className="rounded-3xl border border-[#F7931A]/20 bg-[linear-gradient(180deg,rgba(247,147,26,0.12),rgba(15,17,21,0.82))] p-8 shadow-[0_0_40px_rgba(247,147,26,0.1)] backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <User className="h-7 w-7 text-[#FFD600]" />
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-slate-400">{t('description')}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <InfoCard
            icon={<Mail className="h-5 w-5 text-[#FFD600]" />}
            label={t('email')}
            value={user.email}
          />
          <InfoCard
            icon={<User className="h-5 w-5 text-[#F7931A]" />}
            label={t('name')}
            value={user.hoTen}
          />
          <InfoCard
            icon={<Phone className="h-5 w-5 text-[#FFD600]" />}
            label={t('phone')}
            value={user.soDienThoai || t('notUpdated')}
          />
          <InfoCard
            icon={<MapPin className="h-5 w-5 text-[#F7931A]" />}
            label={t('address')}
            value={user.diaChi || t('notUpdated')}
          />
          <InfoCard
            icon={<Shield className="h-5 w-5 text-[#FFD600]" />}
            label={t('joined')}
            value={new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(new Date(user.ngayTao))}
          />
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#0F1115]/85 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-[#F7931A]/35">
            <p className="text-sm text-slate-400 uppercase tracking-wider">{t('orders')}</p>
            <p className="mt-2 bg-gradient-to-br from-white to-[#FFD600] bg-clip-text text-4xl font-bold text-transparent">{orderCount}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0F1115]/85 p-6 shadow-xl backdrop-blur-xl transition-all hover:border-[#F7931A]/35">
            <p className="text-sm text-slate-400 uppercase tracking-wider">{t('cartItems')}</p>
            <p className="mt-2 bg-gradient-to-br from-white to-[#FFD600] bg-clip-text text-4xl font-bold text-transparent">{cartItemCount}</p>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#0F1115]/85 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 p-3 text-amber-300">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wider text-slate-400">{t('pointsTitle')}</p>
                <p className="mt-1 text-3xl font-bold text-white">{t('pointsUnit', { count: user.diemTichLuy.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}</p>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wider text-slate-500">{t('tier')}</p>
              <p className="text-lg font-semibold text-amber-300">{tier}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {pointHistory.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-slate-400">{t('emptyPointHistory')}</p>
            ) : (
              pointHistory.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {item.donHang ? t('orderPointsReason', { code: item.donHang.maDonHang }) : item.lyDo}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{item.donHang?.maDonHang || t('accountFallback')} - {new Intl.DateTimeFormat(locale === 'vi' ? 'vi-VN' : 'en-US', { dateStyle: 'medium' }).format(new Date(item.ngayTao))}</p>
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
          <Link href="/cart" className="rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(247,147,26,0.28)] transition hover:brightness-110">
            {t('openCart')}
          </Link>
          <Link href="/account/codes" className="inline-flex items-center gap-2 rounded-xl border border-[#F7931A]/35 bg-[#F7931A]/10 px-6 py-3 font-semibold text-[#FFD600] transition hover:bg-[#F7931A]/20">
            <KeyRound className="h-4 w-4" />
            {t('myCodes')}
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
    <article className="rounded-2xl border border-white/10 bg-[#0F1115]/85 p-6 shadow-lg backdrop-blur-xl transition hover:border-[#F7931A]/30 hover:bg-white/5">
      <div className="flex items-center gap-3 text-slate-400">
        <div className="rounded-xl border border-[#F7931A]/20 bg-[#F7931A]/10 p-2">
          {icon}
        </div>
        <span className="text-sm font-medium tracking-wide uppercase">{label}</span>
      </div>
      <p className="mt-3 text-lg font-semibold text-white ml-1">{value}</p>
    </article>
  )
}
