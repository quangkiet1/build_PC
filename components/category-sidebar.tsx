import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cpu, Monitor, Package, Zap, HardDrive, Fan, MousePointer } from 'lucide-react'

const categories = [
  { href: '/builder', name: 'Build PC', icon: Package, badge: 'HOT' },
  { href: '/products?category=cpu', name: 'CPU', icon: Cpu },
  { href: '/products?category=motherboard', name: 'Mainboard', icon: Monitor },
  { href: '/products?category=ram', name: 'RAM', icon: HardDrive },
  { href: '/products?category=gpu', name: 'Card đồ họa', icon: Monitor },
  { href: '/products?category=storage', name: 'Ổ cứng', icon: HardDrive },
  { href: '/products?category=psu', name: 'Nguồn', icon: Zap },
  { href: '/products?category=case', name: 'Case / Vỏ', icon: Package },
  { href: '/products?category=cooling', name: 'Tản nhiệt', icon: Fan },
  { href: '/products?category=monitor', name: 'Màn hình', icon: Monitor },
  { href: '/products?category=prebuilt', name: 'PC lắp sẵn', icon: Package },
  { href: '/products?category=accessories', name: 'Phụ kiện', icon: MousePointer },
  { href: '/products?category=gaming-gear', name: 'Gaming Gear', icon: MousePointer }
]

export function CategorySidebar() {
  return (
    <Card className="border border-white/10 bg-[#0F1115]/90 shadow-[0_22px_60px_rgba(0,0,0,0.28)]">
      <CardHeader className="border-b border-white/10">
        <CardTitle className="text-sm uppercase tracking-[0.22em] text-[#94A3B8]">Danh mục</CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div className="space-y-2">
          {categories.map((item) => {
            const Icon = item.icon
            const isBuild = item.href === '/builder'

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between gap-3 rounded-2xl px-4 py-3 transition duration-200 ${
                  isBuild
                    ? 'border border-[#F7931A]/35 bg-[#F7931A]/10 text-[#FFD600] shadow-[0_0_24px_rgba(247,147,26,0.14)]'
                    : 'border border-white/10 bg-white/[0.03] text-[#CBD5E1] hover:border-[#F7931A]/35 hover:bg-[#F7931A]/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                      isBuild
                        ? 'border-[#F7931A]/25 bg-[#F7931A]/15 text-[#FFD600]'
                        : 'border-white/10 bg-white/5 text-[#94A3B8] group-hover:text-[#F7931A]'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{item.name}</div>
                    {isBuild && <div className="text-xs text-[#94A3B8]">Xây dựng ngay</div>}
                  </div>
                </div>
                {item.badge ? (
                  <Badge className="border-[#F7931A]/25 bg-[#F7931A]/15 text-[0.65rem] uppercase tracking-[0.22em] text-[#FFD600]">
                    {item.badge}
                  </Badge>
                ) : null}
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
