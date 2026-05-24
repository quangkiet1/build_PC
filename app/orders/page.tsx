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
    <main className="relative min-h-screen overflow-hidden bg-[#030304] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-30" />
      <div className="pointer-events-none absolute -left-1/4 -top-1/4 h-3/4 w-3/4 bg-radial-blur" />
      <div className="pointer-events-none absolute -bottom-1/4 -right-1/4 h-3/4 w-3/4 bg-radial-blur" />
      <div className="mx-auto max-w-6xl space-y-8 relative z-10">
        <section className="rounded-3xl border border-[#F7931A]/20 bg-[linear-gradient(180deg,rgba(247,147,26,0.12),rgba(15,17,21,0.82))] p-8 shadow-[0_0_40px_rgba(247,147,26,0.1)] backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <Package className="h-7 w-7 text-[#FFD600]" />
            <div>
              <h1 className="text-3xl font-bold">{t('title')}</h1>
              <p className="text-slate-400">{t('description')}</p>
            </div>
          </div>
        </section>

        {orders.length === 0 ? (
          <section className="rounded-3xl border border-white/10 bg-[#0F1115]/85 p-12 text-center shadow-xl backdrop-blur-xl">
            <p className="text-xl font-semibold text-white">{t('emptyTitle')}</p>
            <p className="mt-2 text-slate-400">{t('emptyDescription')}</p>
            <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-8 py-3.5 font-semibold text-white shadow-[0_0_20px_rgba(247,147,26,0.28)] transition hover:brightness-110">
              {t('shopNow')} <ArrowRight className="h-5 w-5" />
            </Link>
          </section>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl border border-white/10 bg-[#0F1115]/85 p-8 shadow-xl backdrop-blur-xl transition-all hover:border-[#F7931A]/35">
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
                    <div className="inline-flex rounded-full border border-[#F7931A]/25 bg-[#F7931A]/10 px-3 py-1 text-sm font-medium text-[#FFD600]">
                      {t(`status.${order.trangThai}`)}
                    </div>
                    <p className="text-2xl font-bold text-[#FFD600]">{formatCurrency(order.tongTien, locale)}</p>
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {order.chiTietDonHangs.map((detail) => (
                    <div key={detail.id} className="rounded-2xl border border-white/5 bg-black/20 p-5 transition hover:border-[#F7931A]/25 hover:bg-white/5">
                      <p className="font-semibold text-white">{detail.sanPham.tenSanPham}</p>
                      <p className="mt-1 text-sm text-slate-400">{t('quantity', { count: detail.soLuong })}</p>
                      <p className="mt-2 text-sm font-medium text-[#FFD600]">{formatCurrency(detail.giaBanLucMua, locale)}</p>
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
