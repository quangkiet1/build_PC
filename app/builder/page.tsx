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

// Mock component data
const componentCategories = [
  {
    id: 'cpu',
    name: 'CPU',
    icon: Cpu,
    required: true,
    components: [
      { id: 'intel-i7-13700k', name: 'Intel Core i7-13700K', price: 18500000, socket: 'LGA1700', wattage: 125 },
      { id: 'amd-7800x3d', name: 'AMD Ryzen 7 7800X3D', price: 16500000, socket: 'AM5', wattage: 120 },
      { id: 'intel-i9-13900k', name: 'Intel Core i9-13900K', price: 22500000, socket: 'LGA1700', wattage: 125 }
    ]
  },
  {
    id: 'motherboard',
    name: 'Mainboard',
    icon: CircuitBoard,
    required: true,
    components: [
      { id: 'asus-z790-e', name: 'ASUS ROG Strix Z790-E', price: 8500000, socket: 'LGA1700', chipset: 'Z790' },
      { id: 'msi-b650-tomahawk', name: 'MSI B650 Tomahawk', price: 6500000, socket: 'AM5', chipset: 'B650' },
      { id: 'gigabyte-z690-aorus', name: 'Gigabyte Z690 Aorus Elite', price: 7200000, socket: 'LGA1700', chipset: 'Z690' }
    ]
  },
  {
    id: 'gpu',
    name: 'Card đồ họa',
    icon: Monitor,
    required: false,
    components: [
      { id: 'rtx-4070-ti', name: 'ASUS RTX 4070 Ti ROG Strix', price: 28500000, wattage: 285 },
      { id: 'rx-7900-xtx', name: 'AMD RX 7900 XTX', price: 26500000, wattage: 355 },
      { id: 'rtx-4080', name: 'NVIDIA RTX 4080', price: 32500000, wattage: 320 }
    ]
  },
  {
    id: 'ram',
    name: 'RAM',
    icon: Database,
    required: true,
    components: [
      { id: 'corsair-ddr5-32gb', name: 'Corsair Vengeance DDR5 32GB', price: 4500000, type: 'DDR5', speed: '6400MHz' },
      { id: 'gskill-ddr5-32gb', name: 'G.Skill Trident Z5 DDR5 32GB', price: 4800000, type: 'DDR5', speed: '6000MHz' },
      { id: 'kingston-ddr5-16gb', name: 'Kingston Fury DDR5 16GB', price: 2200000, type: 'DDR5', speed: '5600MHz' }
    ]
  },
  {
    id: 'storage',
    name: 'Ổ cứng',
    icon: HardDrive,
    required: true,
    components: [
      { id: 'samsung-990-pro-1tb', name: 'Samsung 990 PRO 1TB', price: 4800000, type: 'NVMe SSD', interface: 'PCIe 4.0' },
      { id: 'wd-black-sn850-1tb', name: 'WD Black SN850 1TB', price: 4200000, type: 'NVMe SSD', interface: 'PCIe 4.0' },
      { id: 'seagate-barracuda-2tb', name: 'Seagate Barracuda 2TB', price: 1800000, type: 'HDD', interface: 'SATA' }
    ]
  },
  {
    id: 'psu',
    name: 'Nguồn',
    icon: Zap,
    required: true,
    components: [
      { id: 'corsair-rm850x', name: 'Corsair RM850x', price: 3200000, wattage: 850, efficiency: '80+ Gold' },
      { id: 'seasonic-focus-750', name: 'Seasonic Focus GX-750', price: 3800000, wattage: 750, efficiency: '80+ Gold' },
      { id: 'be-quiet-700', name: 'be quiet! Straight Power 11 700W', price: 3500000, wattage: 700, efficiency: '80+ Platinum' }
    ]
  },
  {
    id: 'case',
    name: 'Case',
    icon: Package,
    required: true,
    components: [
      { id: 'lian-li-pc-o11', name: 'Lian Li PC-O11 Dynamic', price: 4800000, formFactor: 'Mid Tower' },
      { id: 'fractal-meshify-c', name: 'Fractal Design Meshify C', price: 3200000, formFactor: 'Mid Tower' },
      { id: 'corsair-4000d', name: 'Corsair 4000D Airflow', price: 2200000, formFactor: 'Mid Tower' }
    ]
  },
  {
    id: 'cooler',
    name: 'Tản nhiệt',
    icon: Fan,
    required: false,
    components: [
      { id: 'noctua-nh-d15', name: 'Noctua NH-D15', price: 2800000, type: 'Air Cooler' },
      { id: 'corsair-h100i', name: 'Corsair H100i Elite Capellix', price: 3200000, type: 'AIO Liquid' },
      { id: 'arctic-liquid-freezer', name: 'Arctic Liquid Freezer II 280', price: 2600000, type: 'AIO Liquid' }
    ]
  }
]

interface SelectedComponent {
  categoryId: string
  component: any
}

export default function PCBuilderPage() {
  const [selectedComponents, setSelectedComponents] = useState<SelectedComponent[]>([])
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [buildName, setBuildName] = useState('')

  // Calculate total price
  const totalPrice = selectedComponents.reduce((sum, item) => sum + item.component.price, 0)

  // Check compatibility
  useEffect(() => {
    const issues: string[] = []

    // Check CPU-Motherboard socket compatibility
    const cpu = selectedComponents.find(c => c.categoryId === 'cpu')?.component
    const motherboard = selectedComponents.find(c => c.categoryId === 'motherboard')?.component

    if (cpu && motherboard && cpu.socket !== motherboard.socket) {
      issues.push(`CPU ${cpu.name} không tương thích với Mainboard ${motherboard.name} (${cpu.socket} ≠ ${motherboard.socket})`)
    }

    // Check PSU wattage
    const gpu = selectedComponents.find(c => c.categoryId === 'gpu')?.component
    const psu = selectedComponents.find(c => c.categoryId === 'psu')?.component

    if (gpu && psu) {
      const totalWattage = (cpu?.wattage || 0) + (gpu?.wattage || 0) + 100 // +100W for other components
      if (totalWattage > psu.wattage) {
        issues.push(`Nguồn ${psu.wattage}W không đủ cho cấu hình (cần ít nhất ${totalWattage}W)`)
      }
    }

    setCompatibilityIssues(issues)
  }, [selectedComponents])

  const addComponent = (categoryId: string, component: any) => {
    const existingIndex = selectedComponents.findIndex(c => c.categoryId === categoryId)

    if (existingIndex >= 0) {
      // Replace existing component
      const newComponents = [...selectedComponents]
      newComponents[existingIndex] = { categoryId, component }
      setSelectedComponents(newComponents)
    } else {
      // Add new component
      setSelectedComponents([...selectedComponents, { categoryId, component }])
    }

    setSelectedCategory(null)
  }

  const removeComponent = (categoryId: string) => {
    setSelectedComponents(selectedComponents.filter(c => c.categoryId !== categoryId))
  }

  const getSelectedComponent = (categoryId: string) => {
    return selectedComponents.find(c => c.categoryId === categoryId)?.component
  }

  const isComplete = () => {
    const requiredCategories = componentCategories.filter(cat => cat.required).map(cat => cat.id)
    return requiredCategories.every(catId => selectedComponents.some(c => c.categoryId === catId))
  }

  const saveBuild = () => {
    // In real app, this would save to database
    alert('Cấu hình đã được lưu!')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="text-3xl font-bold gaming-text-gradient">⚙️ PC BUILDER</div>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/products" className="text-slate-300 hover:text-blue-400 transition">Sản phẩm</Link>
              <Link href="/" className="text-slate-300 hover:text-blue-400 transition">Trang chủ</Link>
              <Link href="/builder" className="gaming-gradient px-4 py-2 rounded-lg font-semibold">PC Builder</Link>
              <Link href="/cart" className="text-slate-300 hover:text-blue-400 transition flex items-center gap-1">
                <ShoppingCart className="w-4 h-4" />
                Giỏ hàng
              </Link>
              <Button variant="outline" className="border-slate-700 hover:bg-slate-800">
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Hỗ trợ
              </Button>
            </div>
          </div>
        </nav>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            ⚙️ PC Builder <span className="gaming-text-gradient">Thông minh</span>
          </h1>
          <p className="text-xl text-slate-300">
            Xây dựng cấu hình PC hoàn hảo với kiểm tra tương thích tự động và gợi ý tối ưu
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Component Categories */}
          <div className="lg:col-span-2 space-y-6">
            {componentCategories.map((category) => {
              const Icon = category.icon
              const selectedComponent = getSelectedComponent(category.id)

              return (
                <Card key={category.id} className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedComponent ? 'bg-green-500/20' : 'bg-slate-800'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            selectedComponent ? 'text-green-400' : 'text-slate-400'
                          }`} />
                        </div>
                        <div>
                          <CardTitle className="text-white flex items-center gap-2">
                            {category.name}
                            {category.required && (
                              <Badge variant="outline" className="border-red-500/30 text-red-400 text-xs">
                                Bắt buộc
                              </Badge>
                            )}
                          </CardTitle>
                          {selectedComponent && (
                            <p className="text-sm text-slate-400">{selectedComponent.name}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {selectedComponent && (
                          <div className="text-right mr-4">
                            <div className="text-lg font-bold gaming-text-gradient">
                              {selectedComponent.price.toLocaleString()} ₫
                            </div>
                          </div>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-slate-700 hover:bg-slate-800"
                              onClick={() => setSelectedCategory(category.id)}
                            >
                              {selectedComponent ? 'Thay đổi' : <Plus className="w-4 h-4" />}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-slate-900 border-slate-800">
                            <DialogHeader>
                              <DialogTitle className="text-white flex items-center gap-2">
                                <Icon className="w-5 h-5 text-blue-400" />
                                Chọn {category.name}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                              {category.components.map((component) => (
                                <Card
                                  key={component.id}
                                  className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 cursor-pointer transition"
                                  onClick={() => addComponent(category.id, component)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-semibold text-white">{component.name}</h4>
                                      <div className="text-right">
                                        <div className="text-lg font-bold gaming-text-gradient">
                                          {component.price.toLocaleString()} ₫
                                        </div>
                                      </div>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-400">
                                      {Object.entries(component).map(([key, value]) => {
                                        if (key !== 'id' && key !== 'name' && key !== 'price') {
                                          return (
                                            <div key={key} className="flex justify-between">
                                              <span className="capitalize">{key}:</span>
                                              <span>{String(value)}</span>
                                            </div>
                                          )
                                        }
                                        return null
                                      })}
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {selectedComponent && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => removeComponent(category.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              )
            })}
          </div>

          {/* Build Summary */}
          <div className="space-y-6">
            {/* Build Info */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Thông tin cấu hình</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tên cấu hình
                  </label>
                  <input
                    type="text"
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    placeholder="Gaming Beast, Work Station..."
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveBuild} variant="outline" size="sm" className="flex-1 border-slate-700 hover:bg-slate-800">
                    <Save className="w-4 h-4 mr-2" />
                    Lưu
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 border-slate-700 hover:bg-slate-800">
                    <Share className="w-4 h-4 mr-2" />
                    Chia sẻ
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Compatibility Check */}
            {compatibilityIssues.length > 0 && (
              <Card className="bg-red-500/10 border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Vấn đề tương thích
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {compatibilityIssues.map((issue, index) => (
                      <li key={index} className="text-sm text-red-300 flex items-start gap-2">
                        <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Build Status */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Trạng thái cấu hình</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {componentCategories.filter(cat => cat.required).map((category) => {
                    const hasComponent = selectedComponents.some(c => c.categoryId === category.id)
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <span className="text-sm text-slate-300">{category.name}</span>
                        {hasComponent ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <X className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                    )
                  })}
                </div>

                <Separator className="bg-slate-700" />

                <div className="text-center">
                  {isComplete() && compatibilityIssues.length === 0 ? (
                    <div className="text-green-400 flex items-center justify-center gap-2 mb-4">
                      <CheckCircle className="w-5 h-5" />
                      Cấu hình hoàn chỉnh!
                    </div>
                  ) : (
                    <div className="text-yellow-400 flex items-center justify-center gap-2 mb-4">
                      <AlertTriangle className="w-5 h-5" />
                      Cần hoàn thiện
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Total Price */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Tổng cộng</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold gaming-text-gradient mb-4">
                  {totalPrice.toLocaleString()} ₫
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full gaming-gradient hover:scale-105 transition"
                    disabled={!isComplete() || compatibilityIssues.length > 0}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Thêm vào giỏ hàng
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-slate-700 hover:bg-slate-800"
                    asChild
                  >
                    <Link href="/checkout">
                      Thanh toán ngay
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>

                <div className="mt-4 text-xs text-slate-400 text-center">
                  Giá đã bao gồm VAT • Bảo hành chính hãng
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}