import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, KeyRound } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/server-user'
import { CodesClient } from './codes-client'

export default async function AccountCodesPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?auth=required&next=/account/codes')
  }

  const now = new Date()
  const [orders, builds, coupons] = await Promise.all([
    prisma.donHang.findMany({
      where: { nguoiDungId: user.id },
      select: {
        id: true,
        maDonHang: true,
        trangThai: true,
        tongTien: true,
        ngayTao: true,
      },
      orderBy: { ngayTao: 'desc' },
    }),
    prisma.cauHinhPC.findMany({
      where: { nguoiDungId: user.id },
      select: {
        id: true,
        tenCauHinh: true,
        tongGia: true,
        isCompleted: true,
        ngayTao: true,
        items: { select: { id: true } },
      },
      orderBy: { ngayTao: 'desc' },
    }),
    prisma.khuyenMai.findMany({
      where: {
        isActive: true,
        ngayBatDau: { lte: now },
        ngayKetThuc: { gte: now },
        OR: [
          { userKhuyenMais: { none: {} } },
          { userKhuyenMais: { some: { nguoiDungId: user.id } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <main className="min-h-screen bg-[#030304] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-2xl border border-white/10 bg-[#0f1115] p-6">
          <Link href="/profile" className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-[#F7931A]">
            <ArrowLeft className="h-4 w-4" />
            Quay lai tai khoan
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#F7931A]/30 bg-[#F7931A]/10 p-3 text-[#FFD600]">
              <KeyRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ma lien quan den tai khoan</h1>
              <p className="mt-1 text-sm text-slate-400">Chi hien thi don hang, cau hinh PC va khuyen mai thuoc tai khoan dang dang nhap.</p>
            </div>
          </div>
        </header>

        <CodesClient orders={orders} builds={builds} coupons={coupons} />
      </div>
    </main>
  )
}
