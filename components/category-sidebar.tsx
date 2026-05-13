import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Cpu, Monitor, Package, Zap, HardDrive, Fan, MousePointer } from 'lucide-react'

const categories = [
  { href: '/builder', name: 'Build PC', icon: Package, accent: 'text-cyan-300', badge: 'HOT' },
  { href: '/products?category=cpu', name: 'CPU', icon: Cpu },
  { href: '/products?category=motherboard', name: 'Mainboard', icon: Monitor },
  { href: '/products?category=ram', name: 'RAM', icon: HardDrive },
  { href: '/products?category=gpu', name: 'Card đồ họa', icon: Monitor },
  { href: '/products?category=storage', name: 'Ổ cứng', icon: HardDrive },
  { href: '/products?category=psu', name: 'Nguồn', icon: Zap },
  { href: '/products?category=case', name: 'Case / Vỏ', icon: Package },
  { href: '/products?category=cooling', name: 'Tản nhiệt', icon: Fan },
  { href: '/products?category=monitor', name: 'Màn hình', icon: Monitor },
  { href: '/products?category=prebuilt', name: 'PC Lắp sẵn', icon: Package },
  { href: '/products?category=accessories', name: 'Phụ kiện', icon: MousePointer },
  { href: '/products?category=gaming-gear', name: 'Gaming Gear', icon: MousePointer }
]

export function CategorySidebar() {
  return (
    <Card className="bg-slate-900/85 border border-slate-800 shadow-2xl shadow-slate-950/10">
      <CardHeader className="border-b border-slate-800">
        <CardTitle className="text-sm uppercase tracking-[0.25em] text-slate-400">Danh mục</CardTitle>
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
                className={`group flex items-center justify-between gap-3 rounded-3xl px-4 py-3 transition duration-200 ${
                  isBuild
                    ? 'bg-blue-500/10 border border-blue-400/25 text-cyan-300 shadow-[0_0_18px_rgba(56,189,248,0.12)]'
                    : 'border border-slate-800 bg-slate-950/80 text-slate-200 hover:border-blue-500/40 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${isBuild ? 'bg-blue-500/15 text-cyan-300' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{item.name}</div>
                    {isBuild && <div className="text-xs text-slate-400">Xây dựng ngay</div>}
                  </div>
                </div>
                {item.badge ? (
                  <Badge className="bg-orange-500/15 text-orange-300 border-orange-500/20 text-[0.65rem] uppercase tracking-[0.22em]">
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
