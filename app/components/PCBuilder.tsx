'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  HardDrive,
  Info,
  LayoutGrid,
  Lightbulb,
  Monitor,
  Package,
  Plus,
  Search,
  ShoppingCart,
  Star,
  Wind,
  Wrench,
  X,
  Zap,
} from 'lucide-react'
import type { AppLocale } from '@/i18n/config'
import type { Product, Category } from '@/app/types/builder'
import { checkCompatibility, formatPrice, isProductCompatibleWithBuild } from '@/app/lib/builder-utils'
import { useCart } from '@/app/providers/cart-provider'
import { useAuth } from '@/context/AuthContext'
import { SaveBuildModal } from '@/app/components/SaveBuildModal'
import { BuildStepper } from '@/app/components/BuildStepper'
import { BuilderCompare } from '@/components/BuilderCompare'
import { useBuilderStore } from '@/store/useBuilderStore'

interface BuildSlot {
  category: Category
  labelKey: string
  descriptionKey: string
  icon: React.ElementType<{ className?: string }>
  required: boolean
}

const buildSlots: BuildSlot[] = [
  { category: 'cpu', labelKey: 'slots.cpu', icon: Cpu, required: true, descriptionKey: 'descriptions.cpu' },
  { category: 'mainboard', labelKey: 'slots.mainboard', icon: LayoutGrid, required: true, descriptionKey: 'descriptions.mainboard' },
  { category: 'ram', labelKey: 'slots.ram', icon: Database, required: true, descriptionKey: 'descriptions.ram' },
  { category: 'gpu', labelKey: 'slots.gpu', icon: Monitor, required: false, descriptionKey: 'descriptions.gpu' },
  { category: 'storage', labelKey: 'slots.storage', icon: HardDrive, required: true, descriptionKey: 'descriptions.storage' },
  { category: 'psu', labelKey: 'slots.psu', icon: Zap, required: true, descriptionKey: 'descriptions.psu' },
  { category: 'case', labelKey: 'slots.case', icon: Package, required: false, descriptionKey: 'descriptions.case' },
  { category: 'cooling', labelKey: 'slots.cooling', icon: Wind, required: false, descriptionKey: 'descriptions.cooling' },
]

// Hàm tự động thay thế ảnh lỗi/trống thành ảnh demo trên mạng
const getDemoImageUrl = (url?: string | null, fallbackName: string = 'PC') => {
  if (!url || url.includes('via.placeholder.com')) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=random&color=fff&size=300&bold=true`
  }
  return url
}

const budgetPresets = [
  { key: 'gaming15', budget: 15000000, color: 'text-white border-white/10 hover:border-[#F7931A]/50 bg-white/5 hover:bg-[#F7931A]/10' },
  { key: 'gaming25', budget: 25000000, color: 'text-white border-white/10 hover:border-[#F7931A]/50 bg-white/5 hover:bg-[#F7931A]/10' },
  { key: 'workstation50', budget: 50000000, color: 'text-white border-white/10 hover:border-[#FFD600]/50 bg-white/5 hover:bg-[#FFD600]/10' },
] as const

interface PCBuilderProps {
  products: Product[]
}

export function PCBuilder({ products }: PCBuilderProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations('builder')
  const router = useRouter()
  const { addItem } = useCart()
  const { requireAuth } = useAuth()
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false)

  const {
    build,
    activeSlot,
    searchQuery,
    budgetLimit,
    savedBuilds,
    compareIds,
    setActiveSlot,
    setSearchQuery,
    setBudgetLimit,
    setProduct,
    removeProduct,
    resetBuild,
    loadSavedBuild,
    deleteSavedBuild,
    toggleCompare,
  } = useBuilderStore()

  const compatibilityT = useCallback(
    (key: string, values?: Record<string, string | number>) => t(`compatibility.${key}`, values),
    [t]
  )
  const issues = useMemo(() => checkCompatibility(build, compatibilityT), [build, compatibilityT])
  const errors = issues.filter((issue) => issue.type === 'error')
  const warnings = issues.filter((issue) => issue.type === 'warning')

  const selectedProducts = useMemo(
    () => Object.values(build).filter((item): item is Product => Boolean(item)),
    [build]
  )
  const totalPrice = selectedProducts.reduce((sum, item) => sum + item.price, 0)
  const filledSlots = buildSlots.filter((slot) => build[slot.category])
  const progress = (filledSlots.length / buildSlots.length) * 100
  const primaryStepperSteps = [
    { category: 'cpu' as const, label: t('slots.cpu'), icon: Cpu },
    { category: 'mainboard' as const, label: t('slots.mainboard'), icon: LayoutGrid },
    { category: 'ram' as const, label: t('slots.ram'), icon: Database },
    { category: 'gpu' as const, label: t('slots.gpu'), icon: Monitor },
    { category: 'psu' as const, label: t('slots.psu'), icon: Zap },
  ]

  const slotProducts = useMemo(() => {
    if (!activeSlot) return []

    const query = searchQuery.toLowerCase().trim()
    return products.filter((product) => {
      if (product.category !== activeSlot) {
        return false
      }

      // Socket compatibility for mainboard
      if (activeSlot === 'mainboard' && build.cpu?.socket) {
        if (product.supportedSocket !== build.cpu.socket) {
          return false
        }
      }

      // RAM compatibility for RAM slot
      if (activeSlot === 'ram' && build.mainboard?.ramType) {
        if (product.ramType !== build.mainboard.ramType) {
          return false
        }
      }

      if (!query) {
        return true
      }

      return product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query)
    })
  }, [activeSlot, products, searchQuery, build.cpu?.socket, build.mainboard?.ramType])

  const comparedBuilds = savedBuilds.filter((item) => compareIds.includes(item.id))

  const handleSaveBuild = () => {
    setIsSaveModalOpen(true)
  }

  const handleSaveBuildConfirm = async (name: string, isCompleted: boolean, isPublic: boolean) => {
    try {
      const buildItems = selectedProducts.map(product => ({
        sanPhamId: product.id,
        soLuong: 1,
      }))

      const response = await fetch('/api/build/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          isCompleted,
          isPublic,
          buildItems,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save build')
      }

      toast.success('Build đã được lưu thành công!')
    } catch (error) {
      console.error('Save build error:', error)
      toast.error('Lỗi khi lưu build')
    }
  }

  const handleAddAllToCart = async () => {
    if (selectedProducts.length === 0) return

    try {
      await requireAuth(async () => {
        await Promise.all(selectedProducts.map((product) => addItem(product.id, 1)))
        toast.success(t('addAllSuccess'))
        router.push('/cart')
      }, { nextUrl: '/builder', reason: 'required' })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('addAllFailed')
      toast.error(message)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-[#030304] text-white relative font-body selection:bg-[#F7931A] selection:text-white">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-40"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F7931A]/10 blur-[120px] rounded-full pointer-events-none"></div>
        </div>
      <div className="sticky top-0 z-30 border-b border-white/5 bg-[#0F1115]/80 py-6 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-mono text-[#F7931A] uppercase tracking-widest">
              <Link href="/" className="transition-colors hover:text-[#FFD600]">{t('breadcrumbHome')}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-muted">{t('title')}</span>
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-heading font-bold text-white">
              <div className="rounded-xl bg-[#F7931A]/10 border border-[#F7931A]/30 p-2.5 text-[#FFD600] shadow-[0_0_15px_-5px_rgba(247,147,26,0.3)]">
                <Wrench className="h-6 w-6" />
              </div>
              {t('title')}
            </h1>
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            {budgetPresets.map((preset) => (
              <button
                key={preset.key}
                onClick={() => setBudgetLimit(budgetLimit === preset.budget ? null : preset.budget)}
                className={`rounded-lg border px-4 py-2 text-xs font-mono transition-all hover:scale-105 ${preset.color} ${budgetLimit === preset.budget ? 'ring-1 ring-offset-2 ring-offset-[#030304] ring-[#F7931A] shadow-[0_0_10px_rgba(247,147,26,0.3)] border-[#F7931A]/50 bg-[#F7931A]/10' : ''}`}
              >
                {budgetLimit === preset.budget ? '✓ ' : ''}
                {t(`budgets.${preset.key}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <BuildStepper
          build={build}
          activeSlot={activeSlot}
          steps={primaryStepperSteps}
          onStepClick={(category) => {
            setActiveSlot(category)
            setSearchQuery('')
          }}
        />

        <div className="glass-panel mt-6 rounded-2xl p-6 border border-white/10 bg-white/5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-muted">
              {t('progress', { filled: filledSlots.length, total: buildSlots.length })}
            </span>
            <span className="font-mono text-lg font-bold text-[#FFD600]">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/50 border border-white/5">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="h-full rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] shadow-[0_0_10px_rgba(247,147,26,0.5)]"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {buildSlots.map((slot) => {
              const selected = build[slot.category]
              const isActive = activeSlot === slot.category

              return (
                <div key={slot.category}>
                  <div
                    className={`group cursor-pointer rounded-2xl border bg-[#0F1115] p-5 transition-all duration-300 hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.15)] hover:border-[#F7931A]/30 ${
                      isActive
                        ? 'border-[#F7931A]/50 bg-[#F7931A]/5 shadow-[0_0_20px_rgba(247,147,26,0.1)]'
                        : selected
                          ? 'border-white/10 hover:bg-white/5'
                          : 'border-dashed border-white/10 hover:bg-white/5'
                    }`}
                    onClick={() => {
                      if (!selected) {
                        setActiveSlot(isActive ? null : slot.category)
                        setSearchQuery('')
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all border ${
                        selected ? 'border-[#F7931A]/30 bg-[#F7931A]/10 text-[#FFD600]' : 'border-white/10 bg-white/5 text-muted group-hover:border-[#F7931A]/20 group-hover:text-[#F7931A]'
                      }`}>
                        <slot.icon className="h-6 w-6" />
                      </div>

                      {selected ? (
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <Image
                            src={getDemoImageUrl(selected.image, selected.name)}
                            alt={selected.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 shrink-0 rounded-lg border border-white/10 bg-black/50 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-[10px] font-mono text-[#F7931A] uppercase tracking-widest">{selected.brand}</p>
                            <p className="truncate text-sm font-semibold text-white">{selected.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {selected.socket && <span className="rounded bg-black/50 border border-white/10 px-2 py-1 text-[10px] font-mono text-muted">{selected.socket}</span>}
                              {selected.ramType && <span className="rounded bg-black/50 border border-white/10 px-2 py-1 text-[10px] font-mono text-muted">{selected.ramType}</span>}
                              {selected.wattage && <span className="rounded bg-black/50 border border-white/10 px-2 py-1 text-[10px] font-mono text-muted">{selected.wattage}W</span>}
                            </div>
                          </div>
                          <p className="shrink-0 text-base font-heading font-bold text-[#FFD600]">{formatPrice(selected.price, locale)}</p>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{t(slot.labelKey)}</p>
                          <p className="mt-1 text-xs text-muted">{t(slot.descriptionKey)}</p>
                        </div>
                      )}

                      <div className="flex shrink-0 items-center gap-2">
                        {slot.required && !selected && (
                          <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-mono uppercase text-muted tracking-widest">{t('required')}</span>
                        )}
                        {selected ? (
                          <>
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                setActiveSlot(slot.category)
                                setSearchQuery('')
                              }}
                              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono uppercase tracking-widest text-muted transition-all hover:bg-white/10 hover:text-white"
                            >
                              {t('change')}
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                removeProduct(slot.category)
                              }}
                              className="rounded-lg p-2 text-muted transition-colors hover:bg-red-500/10 hover:text-red-400"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all border ${
                            isActive ? 'bg-[#F7931A] border-[#F7931A] text-white shadow-[0_0_15px_rgba(247,147,26,0.4)]' : 'bg-black/20 border-white/10 text-muted group-hover:bg-[#F7931A]/10 group-hover:text-[#F7931A]'
                          }`}>
                            <Plus className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence mode="wait" initial={false}>
                    {isActive ? (
                      <motion.div
                        key={slot.category}
                        initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                        transition={{ duration: 0.22, ease: 'easeOut' }}
                        className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0A0C10] shadow-[0_0_40px_rgba(0,0,0,0.8)] relative z-20"
                      >
                      <div className="border-b border-white/10 bg-white/5 p-4">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                            <input
                              type="text"
                              placeholder={t('searchPlaceholder', { label: t(slot.labelKey) })}
                              value={searchQuery}
                              onChange={(event) => setSearchQuery(event.target.value)}
                              autoFocus
                              className="w-full rounded-xl border border-white/10 bg-[#030304] py-2.5 pl-10 pr-4 text-sm text-white transition-all placeholder:text-muted focus:border-[#F7931A]/50 focus:outline-none focus:shadow-[0_0_15px_rgba(247,147,26,0.15)]"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setActiveSlot(null)
                              setSearchQuery('')
                            }}
                            className="rounded-lg p-2 text-muted transition-colors hover:bg-white/5 hover:text-white"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-112 overflow-y-auto">
                        {slotProducts.length === 0 ? (
                          <p className="py-8 text-center text-sm font-mono text-muted">{t('notFound')}</p>
                        ) : (
                          slotProducts.map((product) => {
                            const compat = isProductCompatibleWithBuild(product, build, compatibilityT)
                            const currentSlotPrice = activeSlot && build[activeSlot] ? build[activeSlot]!.price : 0
                            const exceedsBudget = Boolean(budgetLimit && totalPrice - currentSlotPrice + product.price > budgetLimit)

                            return (
                              <div
                                key={product.id}
                                className={`flex cursor-pointer items-center gap-4 border-b border-white/5 p-4 transition-all last:border-0 ${
                                  compat.compatible && !exceedsBudget
                                    ? 'hover:bg-white/5'
                                    : exceedsBudget
                                      ? 'opacity-60 hover:bg-[#FFD600]/5'
                                      : 'opacity-50 hover:bg-red-500/5'
                                }`}
                                onClick={() => compat.compatible && !exceedsBudget && setProduct(product)}
                              >
                                <Image
                                  src={getDemoImageUrl(product.image, product.name)}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 shrink-0 rounded-lg border border-white/10 bg-black/50 object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <p className="text-[10px] font-mono text-[#F7931A] uppercase tracking-widest">{product.brand}</p>
                                    {!compat.compatible && (
                                      <span className="flex items-center gap-1 rounded border border-red-500/30 bg-red-500/10 px-2 py-1 text-[10px] font-mono uppercase text-red-400">
                                        <AlertCircle className="h-3 w-3" /> {t('notCompatible')}
                                      </span>
                                    )}
                                    {compat.compatible && Object.keys(build).length > 0 && (
                                      <span className="flex items-center gap-1 rounded border border-[#FFD600]/30 bg-[#FFD600]/10 px-2 py-1 text-[10px] font-mono uppercase text-[#FFD600]">
                                        <CheckCircle2 className="h-3 w-3" /> {t('compatible')}
                                      </span>
                                    )}
                                    {exceedsBudget && (
                                      <span className="rounded border border-[#F7931A]/30 bg-[#F7931A]/10 px-2 py-1 text-[10px] font-mono uppercase text-[#F7931A]">{t('overBudget')}</span>
                                    )}
                                  </div>
                                  <p className="truncate text-sm font-semibold text-white">{product.name}</p>
                                  {compat.reason && <p className="mt-1 text-xs font-mono text-red-400">{compat.reason}</p>}
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {product.socket && <span className="rounded bg-black/50 border border-white/10 px-2 py-1 text-[10px] font-mono text-muted">{product.socket}</span>}
                                    {product.ramType && <span className="rounded bg-black/50 border border-white/10 px-2 py-1 text-[10px] font-mono text-muted">{product.ramType}</span>}
                                    {product.wattage && <span className="rounded bg-black/50 border border-white/10 px-2 py-1 text-[10px] font-mono text-muted">{product.wattage}W</span>}
                                    {product.tdp && <span className="rounded bg-black/50 border border-white/10 px-2 py-1 text-[10px] font-mono text-muted">TDP: {product.tdp}W</span>}
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-sm font-heading font-bold text-[#FFD600]">{formatPrice(product.price, locale)}</p>
                                  <div className="mt-1 flex items-center justify-end gap-1">
                                    <Star className="h-3.5 w-3.5 fill-[#F7931A] text-[#F7931A]" />
                                    <span className="text-xs font-mono text-muted">{product.rating}</span>
                                  </div>
                                </div>
                              </div>
                            )
                          })
                        )}
                      </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              )
            })}

            <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-heading font-semibold text-white">{t('savedTitle')}</h3>
                <p className="mt-1 text-sm text-muted">{t('savedDescription')}</p>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleSaveBuild}
                  className="rounded-xl border border-[#F7931A]/30 bg-[#F7931A]/10 px-5 py-3 text-sm font-mono font-semibold text-[#FFD600] shadow-[0_0_15px_-5px_rgba(247,147,26,0.3)] transition hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.5)]"
                >
                  Lưu build
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {savedBuilds.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 p-4 text-sm text-muted text-center font-mono">{t('emptySaved')}</div>
                ) : (
                  savedBuilds.map((item) => {
                    const isCompared = compareIds.includes(item.id)

                    return (
                      <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-1 text-xs font-mono text-muted">{t('savedAt', { date: new Date(item.savedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}</p>
                            <p className="mt-2 text-sm font-heading font-bold text-[#FFD600]">{formatPrice(item.totalPrice, locale)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => loadSavedBuild(item.id)} className="rounded-lg border border-[#F7931A]/30 bg-[#F7931A]/5 px-3 py-2 text-xs font-mono text-[#F7931A] transition hover:bg-[#F7931A]/10">{t('loadBuild')}</button>
                            <button onClick={() => toggleCompare(item.id)} className={`rounded-lg border px-3 py-2 text-xs font-mono transition ${isCompared ? 'border-[#FFD600]/40 bg-[#FFD600]/10 text-[#FFD600]' : 'border-white/10 text-muted hover:bg-white/5'}`}>{t('compareBuild')}</button>
                            <button onClick={() => deleteSavedBuild(item.id)} className="rounded-lg border border-red-500/30 px-3 py-2 text-xs font-mono text-red-400 transition hover:bg-red-500/10">{t('deleteBuild')}</button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </section>

            <BuilderCompare builds={comparedBuilds} />
          </div>

          <div className="space-y-6">
            <div className={`rounded-2xl border p-6 backdrop-blur-sm ${
              errors.length === 0 && warnings.length === 0 && selectedProducts.length > 0
                ? 'border-[#F7931A]/30 bg-[#F7931A]/5 shadow-[0_0_20px_rgba(247,147,26,0.1)]'
                : errors.length > 0
                  ? 'border-red-500/30 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.1)]'
                  : warnings.length > 0
                    ? 'border-[#FFD600]/30 bg-[#FFD600]/10 shadow-[0_0_20px_rgba(255,214,0,0.1)]'
                    : 'border-white/10 bg-[#0F1115]'
            }`}>
              <div className="mb-4 flex items-center gap-3">
                {errors.length === 0 && warnings.length === 0 && selectedProducts.length > 0 && <CheckCircle2 className="h-6 w-6 text-[#F7931A]" />}
                {errors.length > 0 && <AlertCircle className="h-6 w-6 text-red-400" />}
                {warnings.length > 0 && errors.length === 0 && <AlertTriangle className="h-6 w-6 text-[#FFD600]" />}
                {selectedProducts.length === 0 && <Info className="h-6 w-6 text-muted" />}
                <h3 className={`text-base font-heading font-bold ${
                  errors.length === 0 && warnings.length === 0 && selectedProducts.length > 0
                    ? 'text-[#F7931A]'
                    : errors.length > 0
                      ? 'text-red-400'
                      : warnings.length > 0
                        ? 'text-[#FFD600]'
                        : 'text-muted'
                }`}>
                  {errors.length === 0 && warnings.length === 0 && selectedProducts.length > 0
                    ? t('statusGood')
                    : errors.length > 0
                      ? t('statusError', { count: errors.length })
                      : warnings.length > 0
                        ? t('statusWarning', { count: warnings.length })
                        : t('statusEmpty')}
                </h3>
              </div>

              <div className="space-y-3">
                {issues.map((issue, index) => (
                  <div key={`${issue.type}-${index}`} className={`flex gap-3 rounded-lg border p-3 ${
                    issue.type === 'error'
                      ? 'border-red-500/20 bg-red-500/10'
                      : issue.type === 'warning'
                        ? 'border-[#FFD600]/20 bg-[#FFD600]/10'
                        : 'border-[#F7931A]/20 bg-[#F7931A]/10'
                  }`}>
                    {issue.type === 'error' && <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />}
                    {issue.type === 'warning' && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#FFD600]" />}
                    {issue.type === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-[#F7931A]" />}
                    <div>
                      <p className={`text-xs font-mono uppercase tracking-wide ${issue.type === 'error' ? 'text-red-300' : issue.type === 'warning' ? 'text-[#FFD600]' : 'text-[#F7931A]'}`}>{issue.message}</p>
                      {issue.suggestion && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                          <Lightbulb className="h-3.5 w-3.5 text-[#FFD600]" />
                          {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky top-24 overflow-hidden rounded-2xl border border-white/10 bg-[#0F1115] shadow-xl">
              <div className="border-b border-white/10 bg-white/5 p-6">
                <h3 className="text-base font-heading font-bold text-white">{t('selectedConfig')}</h3>
              </div>

              <div className="max-h-72 divide-y divide-white/5 overflow-y-auto">
                {buildSlots.map((slot) => {
                  const selected = build[slot.category]
                  return (
                    <div key={slot.category} className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-white/5">
                      <slot.icon className={`h-5 w-5 shrink-0 ${selected ? 'text-[#F7931A]' : 'text-muted'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted">{t(slot.labelKey)}</p>
                        {selected ? (
                          <p className="truncate text-xs font-semibold text-white">{selected.name}</p>
                        ) : (
                          <p className="text-xs italic text-muted/50">{t('notSelected')}</p>
                        )}
                      </div>
                      {selected && <span className="shrink-0 text-xs font-mono font-bold text-[#FFD600]">{formatPrice(selected.price, locale)}</span>}
                    </div>
                  )
                })}
              </div>

              {budgetLimit && (
                <div className="border-t border-white/10 bg-black/50 p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-muted">{t('budget', { amount: formatPrice(budgetLimit, locale) })}</span>
                    <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${totalPrice > budgetLimit ? 'text-red-400' : 'text-[#F7931A]'}`}>
                      {totalPrice > budgetLimit ? t('budgetOver', { amount: formatPrice(totalPrice - budgetLimit, locale) }) : t('budgetRemaining', { amount: formatPrice(budgetLimit - totalPrice, locale) })}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/50">
                    <div className={`h-full rounded-full ${totalPrice > budgetLimit ? 'bg-red-500' : 'bg-[#F7931A]'}`} style={{ width: `${Math.min((totalPrice / budgetLimit) * 100, 100)}%` }} />
                  </div>
                </div>
              )}

              <div className={`border-t border-white/10 p-6 ${budgetLimit ? 'bg-black/50' : 'bg-white/5'}`}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-mono uppercase tracking-widest text-muted">{t('total')}</span>
                  <span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-3xl font-heading font-bold text-transparent">{formatPrice(totalPrice, locale)}</span>
                </div>
                {totalPrice > 0 && (
                  <p className="mb-6 text-[10px] font-mono uppercase tracking-widest text-muted">
                    {errors.length === 0 ? t('summaryLineOk', { count: filledSlots.length }) : t('summaryLineError', { count: filledSlots.length, errors: errors.length })}
                  </p>
                )}

                <button
                  onClick={handleAddAllToCart}
                  disabled={selectedProducts.length === 0 || errors.length > 0}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all ${
                    selectedProducts.length === 0 || errors.length > 0
                      ? 'cursor-not-allowed bg-white/5 text-muted border border-white/10'
                      : 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_0_15px_-5px_rgba(247,147,26,0.6)] hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.8)]'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {t('addAll')}
                </button>

                {errors.length > 0 && <p className="mt-3 text-center text-xs font-mono text-red-400">{t('fixBeforeAdd')}</p>}

                <button onClick={resetBuild} className="mt-3 w-full py-2.5 text-[10px] font-mono uppercase tracking-widest text-muted transition-colors hover:text-white border border-transparent hover:border-white/10 rounded-lg">
                  {t('reset')}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 shadow-xl">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-heading font-bold text-white">
                <div className="rounded-lg bg-[#FFD600]/20 p-1.5 border border-[#FFD600]/30">
                  <Lightbulb className="h-4 w-4 text-[#FFD600]" />
                </div>
                {t('tipsTitle')}
              </h3>
              <ul className="space-y-3 text-xs text-muted font-body">
                {['tip1', 'tip2', 'tip3', 'tip4'].map((tipKey) => (
                  <li key={tipKey} className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-[#F7931A] font-mono">→</span>
                    <span>{t(tipKey)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(build.cpu || build.gpu) && (
              <div className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 shadow-xl">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-heading font-bold text-white">
                  <div className="rounded-lg bg-[#F7931A]/20 p-1.5 border border-[#F7931A]/30">
                    <Zap className="h-4 w-4 text-[#FFD600]" />
                  </div>
                  {t('powerTitle')}
                </h3>
                <div className="space-y-3">
                  {build.cpu && (
                    <div className="flex items-center justify-between rounded-lg bg-black/50 border border-white/5 p-3">
                      <span className="text-xs font-mono text-muted">{t('cpuTdp')}</span>
                      <span className="text-xs font-bold text-white">{build.cpu.tdp || 0}W</span>
                    </div>
                  )}
                  {build.gpu && (
                    <div className="flex items-center justify-between rounded-lg bg-black/50 border border-white/5 p-3">
                      <span className="text-xs font-mono text-muted">{t('gpuTdp')}</span>
                      <span className="text-xs font-bold text-white">{build.gpu.tdp || 0}W</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-lg bg-black/50 border border-white/5 p-3">
                    <span className="text-xs font-mono text-muted">{t('systemEstimate')}</span>
                    <span className="text-xs font-bold text-white">~50W</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-[#F7931A]/30 bg-[#F7931A]/10 p-3 shadow-[0_0_10px_rgba(247,147,26,0.1)]">
                    <span className="text-xs font-mono font-bold text-[#FFD600]">{t('estimatedTotalTdp')}</span>
                    <span className="text-sm font-bold text-white">{(build.cpu?.tdp || 0) + (build.gpu?.tdp || 0) + 50}W</span>
                  </div>
                  <p className="mt-2 rounded-lg bg-white/5 p-3 text-[10px] font-mono text-muted uppercase tracking-widest text-center">
                    {t('recommendedPsu', { amount: `${Math.ceil(((build.cpu?.tdp || 0) + (build.gpu?.tdp || 0) + 150) / 50) * 50}W` })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      <SaveBuildModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveBuildConfirm}
        currentBuild={build}
      />
    </>
  )
}
