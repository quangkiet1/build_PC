import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Package, CreditCard, CalendarDays, ArrowRight } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-user'
import { getI18nServer, getTranslator } from '@/i18n/server'
import { formatCurrency, formatDate } from '@/lib/format'

export default async function OrdersPage() {
  const t = await getTranslator('ordersPage')
  const { locale } = await getI18nServer()
  const user = await getCurrentUser()

  if (!user) {
    redirect('/?auth=required&next=/orders')
  }

  const orders = await prisma.donHang.findMany({
    where: { nguoiDungId: user.id },
    include: {
      chiTietDonHangs: {
        include: { sanPham: true },
      },
      thanhToans: true,
    },
    orderBy: { ngayTao: 'desc' },
  })

  return (
    <main className="min-h-screen bg-[#07080d] px-4 py-10 text-white sm:px-6 lg:px-8 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.08),transparent_50%)] pointer-events-none" />
      <div className="mx-auto max-w-6xl space-y-8 relative z-10">
        <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(6,182,212,0.1),rgba(15,23,42,0.6))] backdrop-blur-xl p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          <div className="flex items-center gap-3">
            <Package className="h-7 w-7 text-cyan-300" />
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-slate-400">{t('description')}</p>
            </div>
          </div>
        </section>

        {orders.length === 0 ? (
          <section className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl p-12 text-center shadow-xl">
            <p className="text-xl font-semibold text-white">{t('emptyTitle')}</p>
            <p className="mt-2 text-slate-400">{t('emptyDescription')}</p>
            <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-[16px] bg-[linear-gradient(135deg,#6366f1,#a855f7)] px-8 py-3.5 font-semibold text-white transition hover:brightness-110 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              {t('shopNow')} <ArrowRight className="h-5 w-5" />
            </Link>
          </section>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl p-8 shadow-xl transition-all hover:border-indigo-500/30">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{t('orderCode')}</p>
                    <h2 className="mt-2 text-2xl font-bold text-white">{order.maDonHang}</h2>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-400">
                      <span className="inline-flex items-center gap-2"><CalendarDays className="h-4 w-4" />{formatDate(order.ngayTao, locale)}</span>
                      <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" />{order.thanhToans[0]?.phuongThuc || t('unknownPayment')}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="inline-flex rounded-full border border-indigo-500/25 bg-indigo-500/10 px-3 py-1 text-sm font-medium text-indigo-300">
                      {t(`status.${order.trangThai}`)}
                    </div>
                    <p className="text-2xl font-bold text-sky-300">{formatCurrency(order.tongTien, locale)}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {order.chiTietDonHangs.map((detail) => (
                    <div key={detail.id} className="rounded-[16px] border border-white/5 bg-black/20 p-5 transition hover:bg-white/5">
                      <p className="font-semibold text-white">{detail.sanPham.tenSanPham}</p>
                      <p className="mt-1 text-sm text-slate-400">{t('quantity', { count: detail.soLuong })}</p>
                      <p className="mt-2 text-sm font-medium text-sky-300">{formatCurrency(detail.giaBanLucMua, locale)}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}