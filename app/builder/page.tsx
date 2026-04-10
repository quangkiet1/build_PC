'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Cpu, Monitor, Database, HardDrive, Zap, CircuitBoard, Fan, Sparkles, ShieldCheck, ShoppingCart, ArrowRight } from 'lucide-react'

type ComponentOption = {
  id: string
  name: string
  price: number
  socket?: string
  wattage?: number
  speed?: string
}

type ComponentCategory = {
  id: string
  name: string
  icon: typeof Cpu
  required: boolean
  options: ComponentOption[]
}

const componentCategories: ComponentCategory[] = [
  {
    id: 'cpu',
    name: 'CPU',
    icon: Cpu,
    required: true,
    options: [
      { id: 'intel-i7-13700k', name: 'Intel Core i7-13700K', price: 18500000, socket: 'LGA1700', wattage: 125 },
      { id: 'amd-7800x3d', name: 'AMD Ryzen 7 7800X3D', price: 16500000, socket: 'AM5', wattage: 120 }
    ]
  },
  {
    id: 'motherboard',
    name: 'Mainboard',
    icon: CircuitBoard,
    required: true,
    options: [
      { id: 'asus-z790-e', name: 'ASUS ROG Strix Z790-E', price: 8500000, socket: 'LGA1700' },
      { id: 'msi-b650-tomahawk', name: 'MSI B650 Tomahawk', price: 6500000, socket: 'AM5' }
    ]
  },
  {
    id: 'gpu',
    name: 'GPU',
    icon: Monitor,
    required: false,
    options: [
      { id: 'rtx-4070-ti', name: 'ASUS RTX 4070 Ti', price: 28500000, wattage: 285 },
      { id: 'rx-7900-xtx', name: 'AMD RX 7900 XTX', price: 26500000, wattage: 355 }
    ]
  },
  {
    id: 'ram',
    name: 'RAM',
    icon: Database,
    required: true,
    options: [
      { id: 'corsair-ddr5-32gb', name: 'Corsair Vengeance DDR5 32GB', price: 4500000, speed: '6400MHz' },
      { id: 'gskill-ddr5-32gb', name: 'G.Skill Trident Z5 DDR5 32GB', price: 4800000, speed: '6000MHz' }
    ]
  },
  {
    id: 'storage',
    name: 'Storage',
    icon: HardDrive,
    required: true,
    options: [
      { id: 'samsung-990-pro-1tb', name: 'Samsung 990 PRO 1TB', price: 4800000 },
      { id: 'wd-black-sn850-1tb', name: 'WD Black SN850 1TB', price: 4200000 }
    ]
  },
  {
    id: 'psu',
    name: 'Nguồn',
    icon: Zap,
    required: true,
    options: [
      { id: 'corsair-rm850x', name: 'Corsair RM850x 850W', price: 3200000, wattage: 850 },
      { id: 'seasonic-focus-750', name: 'Seasonic Focus GX-750', price: 3800000, wattage: 750 }
    ]
  },
  {
    id: 'cooling',
    name: 'Tản nhiệt',
    icon: Fan,
    required: false,
    options: [
      { id: 'noctua-nh-d15', name: 'Noctua NH-D15', price: 2800000 },
      { id: 'corsair-h100i', name: 'Corsair H100i Elite Capellix', price: 3200000 }
    ]
  }
]

export default function BuilderPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('cpu')
  const [chosenOptions, setChosenOptions] = useState<Record<string, ComponentOption>>({})
  const [budget, setBudget] = useState('25000000')

  const activeCategory = componentCategories.find((category) => category.id === selectedCategory)
  const selectedOption = activeCategory ? chosenOptions[activeCategory.id] : undefined

  const totalPrice = Object.values(chosenOptions).reduce((acc, option) => acc + option.price, 0)

  const availableOptions = activeCategory?.options ?? []

  const handleSelectOption = (option: ComponentOption) => {
    setChosenOptions((prev) => ({ ...prev, [selectedCategory]: option }))
  }

  const isComplete = componentCategories.filter((category) => category.required).every((category) => chosenOptions[category.id])

  const warningText = (() => {
    const cpu = chosenOptions['cpu']
    const motherboard = chosenOptions['motherboard']
    const psu = chosenOptions['psu']
    const gpu = chosenOptions['gpu']

    if (cpu && motherboard && cpu.socket && motherboard.socket && cpu.socket !== motherboard.socket) {
      return `Cảnh báo: CPU và Mainboard không tương thích (${cpu.socket} ≠ ${motherboard.socket})`
    }

    if (gpu && psu && gpu.wattage && psu.wattage && gpu.wattage + 150 > psu.wattage) {
      return `Cảnh báo: PSU có thể không đủ cho GPU ${gpu.wattage}W`
    }

    return ''
  })()

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Build PC</p>
            <h1 className="mt-2 text-4xl font-bold text-white">Tạo cấu hình PC theo nhu cầu</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/products" className="text-slate-200 hover:text-blue-400 transition">Xem sản phẩm</Link>
            <Link href="/" className="gaming-gradient rounded-3xl px-5 py-3 text-sm font-semibold">Về trang chủ</Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
          <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Cấu hình linh kiện</p>
                <h2 className="mt-2 text-3xl font-bold text-white">Chọn linh kiện cho hệ thống</h2>
              </div>
              <Badge className="bg-blue-500/10 text-blue-300 border border-blue-500/20">Giá ước tính</Badge>
            </div>

            <div className="flex flex-wrap gap-4 mb-8">
              {componentCategories.map((category) => {
                const Icon = category.icon
                const active = selectedCategory === category.id
                const filled = !!chosenOptions[category.id]

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-3 rounded-3xl border px-4 py-3 text-left transition ${active ? 'border-blue-400 bg-blue-500/10 text-white' : 'border-slate-800 bg-slate-950/80 text-slate-200 hover:border-blue-500/40'}`}>
                    <div className={`rounded-2xl p-2 ${active ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-800 text-slate-400'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{category.name}</p>
                      <p className="text-xs text-slate-400">{filled ? 'Đã chọn' : 'Chưa chọn'}</p>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/80 p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Ngân sách mục tiêu</p>
                  <p className="mt-2 text-3xl font-bold text-white">{Number(budget).toLocaleString('vi-VN')} ₫</p>
                </div>
                <div className="w-full sm:w-auto">
                  <Input
                    type="number"
                    value={budget}
                    onChange={(event) => setBudget(event.target.value)}
                    className="bg-slate-950 border-slate-800 text-white"
                    placeholder="Nhập ngân sách"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-6">
                <CardHeader className="p-0">
                  <CardTitle className="text-xl font-semibold text-white">{activeCategory?.name}</CardTitle>
                </CardHeader>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {availableOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectOption(option)}
                      className={`rounded-3xl border p-5 text-left transition ${selectedOption?.id === option.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950/90 hover:border-blue-500/40'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-white">{option.name}</p>
                        <span className="text-slate-400">{option.price.toLocaleString('vi-VN')} ₫</span>
                      </div>
                      {option.socket && <p className="mt-2 text-sm text-slate-400">Socket: {option.socket}</p>}
                      {option.wattage && <p className="mt-1 text-sm text-slate-400">Wattage: {option.wattage}W</p>}
                      {option.speed && <p className="mt-1 text-sm text-slate-400">Tốc độ: {option.speed}</p>}
                    </button>
                  ))}
                </div>
              </div>

              {warningText ? (
                <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 text-amber-100">
                  <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-amber-200">
                    <ShieldCheck className="h-4 w-4" />
                    Cảnh báo tương thích
                  </div>
                  <p className="mt-3 text-slate-200">{warningText}</p>
                </div>
              ) : (
                <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-5 text-slate-300">
                  <p className="text-sm">Không có lỗi tương thích được phát hiện.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-900/85 p-6 shadow-2xl shadow-slate-950/20">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">Tóm tắt cấu hình</p>
                  <h2 className="mt-2 text-2xl font-bold text-white">Giỏ linh kiện</h2>
                </div>
                <Badge className="bg-blue-500/10 text-blue-300 border border-blue-500/20">{isComplete ? 'Đầy đủ' : 'Thiếu'}</Badge>
              </div>

              <div className="space-y-4">
                {componentCategories.map((category) => {
                  const selected = chosenOptions[category.id]
                  return (
                    <div key={category.id} className="rounded-3xl border border-slate-800 bg-slate-950/90 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm text-slate-400">{category.name}</p>
                          <p className="mt-1 text-white">{selected ? selected.name : 'Chưa chọn'}</p>
                        </div>
                        {selected ? (
                          <Button variant="outline" size="sm" className="rounded-full border-slate-700 text-slate-200" onClick={() => setChosenOptions((prev) => {
                            const copy = { ...prev }
                            delete copy[category.id]
                            return copy
                          })}>
                            X
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator className="my-6 border-slate-800" />

              <div className="space-y-4">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Tổng giá</span>
                  <span className="text-white font-semibold">{totalPrice.toLocaleString('vi-VN')} ₫</span>
                </div>
                <Button className="w-full rounded-3xl bg-blue-500 hover:bg-blue-400" disabled={!isComplete}>
                  {isComplete ? 'Lưu cấu hình và đặt hàng' : 'Hoàn thành cấu hình để lưu'}
                </Button>
                <Button variant="outline" className="w-full rounded-3xl border-slate-700 text-slate-200">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Mua ngay
                </Button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/90 p-6">
              <div className="flex items-center gap-3 text-slate-300">
                <Sparkles className="h-5 w-5 text-cyan-300" />
                <p className="text-sm uppercase tracking-[0.3em]">Gợi ý tối ưu</p>
              </div>
              <p className="mt-3 text-slate-300">Duy trì cân bằng giữa CPU, GPU và nguồn để có hiệu năng tốt nhất với hệ thống ổn định.</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  )
}
