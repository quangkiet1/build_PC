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
  icon: React.ElementType
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

const budgetPresets = [
  { key: 'gaming15', budget: 15000000, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
  { key: 'gaming25', budget: 25000000, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
  { key: 'workstation50', budget: 50000000, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
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
      <div className="min-h-screen bg-[#050609] text-white">
      <div className="sticky top-0 z-30 border-b border-indigo-500/10 bg-[#0a0b10]/95 py-6 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Link href="/" className="transition-colors hover:text-indigo-400">{t('breadcrumbHome')}</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-slate-300">{t('title')}</span>
            </div>
            <h1 className="flex items-center gap-3 text-3xl font-bold text-white">
              <div className="rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 p-2.5">
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
                className={`rounded-lg border px-4 py-2 text-xs font-medium transition-all hover:scale-105 ${preset.color} ${budgetLimit === preset.budget ? 'ring-2 ring-offset-2 ring-offset-[#0a0b10]' : ''}`}
              >
                {budgetLimit === preset.budget ? '✓ ' : ''}
                {t(`budgets.${preset.key}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <BuildStepper
          build={build}
          activeSlot={activeSlot}
          steps={primaryStepperSteps}
          onStepClick={(category) => {
            setActiveSlot(category)
            setSearchQuery('')
          }}
        />

        <div className="glass-card mt-6 rounded-[28px] p-6">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              {t('progress', { filled: filledSlots.length, total: buildSlots.length })}
            </span>
            <span className="font-tech text-lg font-bold text-cyan-300">{Math.round(progress)}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#8b5cf6)]"
            />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {buildSlots.map((slot) => {
              const selected = build[slot.category]
              const isActive = activeSlot === slot.category

              return (
                <div key={slot.category}>
                  <div
                    className={`group cursor-pointer rounded-2xl border bg-[#0f1117] p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${
                      isActive
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-500/5'
                        : selected
                          ? 'border-slate-700 hover:border-indigo-500/60 hover:bg-indigo-500/5'
                          : 'border-dashed border-slate-800 hover:border-indigo-500/40 hover:bg-indigo-500/5'
                    }`}
                    onClick={() => {
                      if (!selected) {
                        setActiveSlot(isActive ? null : slot.category)
                        setSearchQuery('')
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all ${
                        selected ? 'bg-indigo-500/30 text-indigo-300 shadow-lg shadow-indigo-500/20' : 'bg-slate-800/50 text-slate-600 group-hover:bg-indigo-500/20 group-hover:text-indigo-400'
                      }`}>
                        <slot.icon className="h-6 w-6" />
                      </div>

                      {selected ? (
                        <div className="flex min-w-0 flex-1 items-center gap-4">
                          <Image
                            src={selected.image}
                            alt={selected.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 shrink-0 rounded-lg border border-indigo-500/20 object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="mb-1 text-xs font-semibold text-indigo-400">{selected.brand}</p>
                            <p className="truncate text-sm font-bold text-slate-100">{selected.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              {selected.socket && <span className="rounded bg-slate-800/50 px-2 py-1 text-xs text-slate-500">{selected.socket}</span>}
                              {selected.ramType && <span className="rounded bg-slate-800/50 px-2 py-1 text-xs text-slate-500">{selected.ramType}</span>}
                              {selected.wattage && <span className="rounded bg-slate-800/50 px-2 py-1 text-xs text-slate-500">{selected.wattage}W</span>}
                            </div>
                          </div>
                          <p className="shrink-0 text-base font-bold text-indigo-400">{formatPrice(selected.price, locale)}</p>
                        </div>
                      ) : (
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-200">{t(slot.labelKey)}</p>
                          <p className="mt-1 text-xs text-slate-500">{t(slot.descriptionKey)}</p>
                        </div>
                      )}

                      <div className="flex shrink-0 items-center gap-2">
                        {slot.required && !selected && (
                          <span className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-500">{t('required')}</span>
                        )}
                        {selected ? (
                          <>
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                setActiveSlot(slot.category)
                                setSearchQuery('')
                              }}
                              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-slate-700 hover:text-white"
                            >
                              {t('change')}
                            </button>
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                removeProduct(slot.category)
                              }}
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg transition-all ${
                            isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50' : 'bg-slate-800 text-slate-500 group-hover:bg-indigo-500/30 group-hover:text-indigo-400'
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
                        className="glass-card mt-3 overflow-hidden rounded-2xl border border-cyan-400/20"
                      >
                      <div className="border-b border-slate-800/50 bg-linear-to-r from-indigo-500/10 to-purple-500/10 p-4">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                            <input
                              type="text"
                              placeholder={t('searchPlaceholder', { label: t(slot.labelKey) })}
                              value={searchQuery}
                              onChange={(event) => setSearchQuery(event.target.value)}
                              autoFocus
                              className="w-full rounded-lg border border-indigo-500/20 bg-slate-800/50 py-2.5 pl-10 pr-4 text-sm text-slate-200 transition-all placeholder:text-slate-600 focus:border-indigo-400 focus:bg-slate-800 focus:outline-none"
                            />
                          </div>
                          <button
                            onClick={() => {
                              setActiveSlot(null)
                              setSearchQuery('')
                            }}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-112 overflow-y-auto">
                        {slotProducts.length === 0 ? (
                          <p className="py-8 text-center text-sm text-slate-500">{t('notFound')}</p>
                        ) : (
                          slotProducts.map((product) => {
                            const compat = isProductCompatibleWithBuild(product, build, compatibilityT)
                            const exceedsBudget = Boolean(budgetLimit && totalPrice + product.price > budgetLimit)

                            return (
                              <div
                                key={product.id}
                                className={`flex cursor-pointer items-center gap-4 border-b border-slate-800/30 p-4 transition-all last:border-0 ${
                                  compat.compatible && !exceedsBudget
                                    ? 'hover:bg-indigo-500/10'
                                    : exceedsBudget
                                      ? 'opacity-60 hover:bg-amber-500/5'
                                      : 'opacity-50 hover:bg-red-500/5'
                                }`}
                                onClick={() => compat.compatible && !exceedsBudget && setProduct(product)}
                              >
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 shrink-0 rounded-lg border border-indigo-500/20 object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                  <div className="mb-1 flex flex-wrap items-center gap-2">
                                    <p className="text-xs font-semibold text-indigo-400">{product.brand}</p>
                                    {!compat.compatible && (
                                      <span className="flex items-center gap-1 rounded border border-red-500/30 bg-red-500/15 px-2 py-1 text-xs font-medium text-red-400">
                                        <AlertCircle className="h-3 w-3" /> {t('notCompatible')}
                                      </span>
                                    )}
                                    {compat.compatible && Object.keys(build).length > 0 && (
                                      <span className="flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/15 px-2 py-1 text-xs font-medium text-emerald-400">
                                        <CheckCircle2 className="h-3 w-3" /> {t('compatible')}
                                      </span>
                                    )}
                                    {exceedsBudget && (
                                      <span className="rounded border border-amber-500/30 bg-amber-500/15 px-2 py-1 text-xs font-medium text-amber-400">{t('overBudget')}</span>
                                    )}
                                  </div>
                                  <p className="truncate text-sm font-medium text-slate-200">{product.name}</p>
                                  {compat.reason && <p className="mt-1 text-xs text-red-400">{compat.reason}</p>}
                                  <div className="mt-2 flex flex-wrap items-center gap-2">
                                    {product.socket && <span className="rounded bg-slate-800/50 px-2 py-1 text-xs text-slate-500">{product.socket}</span>}
                                    {product.ramType && <span className="rounded bg-slate-800/50 px-2 py-1 text-xs text-slate-500">{product.ramType}</span>}
                                    {product.wattage && <span className="rounded bg-slate-800/50 px-2 py-1 text-xs text-slate-500">{product.wattage}W</span>}
                                    {product.tdp && <span className="rounded bg-slate-800/50 px-2 py-1 text-xs text-slate-500">TDP: {product.tdp}W</span>}
                                  </div>
                                </div>
                                <div className="shrink-0 text-right">
                                  <p className="text-sm font-bold text-indigo-400">{formatPrice(product.price, locale)}</p>
                                  <div className="mt-1 flex items-center justify-end gap-1">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    <span className="text-xs font-medium text-slate-500">{product.rating}</span>
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

            <section className="rounded-2xl border border-slate-800 bg-[#0f1117] p-6 shadow-xl">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">{t('savedTitle')}</h3>
                <p className="mt-1 text-sm text-slate-400">{t('savedDescription')}</p>
              </div>

              <div className="grid gap-3">
                <button
                  type="button"
                  onClick={handleSaveBuild}
                  className="rounded-xl bg-linear-to-r from-indigo-600 to-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Lưu build
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {savedBuilds.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-4 text-sm text-slate-500">{t('emptySaved')}</div>
                ) : (
                  savedBuilds.map((item) => {
                    const isCompared = compareIds.includes(item.id)

                    return (
                      <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            <p className="mt-1 text-sm text-slate-400">{t('savedAt', { date: new Date(item.savedAt).toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US') })}</p>
                            <p className="mt-2 text-sm font-semibold text-sky-300">{formatPrice(item.totalPrice, locale)}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => loadSavedBuild(item.id)} className="rounded-xl border border-indigo-500/30 px-3 py-2 text-sm text-indigo-300 transition hover:bg-indigo-500/10">{t('loadBuild')}</button>
                            <button onClick={() => toggleCompare(item.id)} className={`rounded-xl border px-3 py-2 text-sm transition ${isCompared ? 'border-sky-500/40 bg-sky-500/10 text-sky-300' : 'border-slate-700 text-slate-300 hover:bg-white/5'}`}>{t('compareBuild')}</button>
                            <button onClick={() => deleteSavedBuild(item.id)} className="rounded-xl border border-rose-500/30 px-3 py-2 text-sm text-rose-300 transition hover:bg-rose-500/10">{t('deleteBuild')}</button>
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
                ? 'border-emerald-500/30 bg-emerald-500/15 shadow-lg shadow-emerald-500/10'
                : errors.length > 0
                  ? 'border-red-500/30 bg-red-500/15 shadow-lg shadow-red-500/10'
                  : warnings.length > 0
                    ? 'border-amber-500/30 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                    : 'border-slate-700/50 bg-slate-800/30'
            }`}>
              <div className="mb-4 flex items-center gap-3">
                {errors.length === 0 && warnings.length === 0 && selectedProducts.length > 0 && <CheckCircle2 className="h-6 w-6 text-emerald-400" />}
                {errors.length > 0 && <AlertCircle className="h-6 w-6 text-red-400" />}
                {warnings.length > 0 && errors.length === 0 && <AlertTriangle className="h-6 w-6 text-amber-400" />}
                {selectedProducts.length === 0 && <Info className="h-6 w-6 text-slate-500" />}
                <h3 className={`text-base font-bold ${
                  errors.length === 0 && warnings.length === 0 && selectedProducts.length > 0
                    ? 'text-emerald-400'
                    : errors.length > 0
                      ? 'text-red-400'
                      : warnings.length > 0
                        ? 'text-amber-400'
                        : 'text-slate-400'
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
                      ? 'border-red-500/20 bg-red-500/20'
                      : issue.type === 'warning'
                        ? 'border-amber-500/20 bg-amber-500/20'
                        : 'border-blue-500/20 bg-blue-500/20'
                  }`}>
                    {issue.type === 'error' && <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-400" />}
                    {issue.type === 'warning' && <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />}
                    {issue.type === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-400" />}
                    <div>
                      <p className={`text-xs font-medium ${issue.type === 'error' ? 'text-red-300' : issue.type === 'warning' ? 'text-amber-300' : 'text-blue-300'}`}>{issue.message}</p>
                      {issue.suggestion && (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-slate-300/80">
                          <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                          {issue.suggestion}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky top-24 overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#0f1117] shadow-xl">
              <div className="border-b border-slate-800/50 bg-linear-to-r from-indigo-500/10 to-purple-500/10 p-6">
                <h3 className="text-base font-bold text-white">{t('selectedConfig')}</h3>
              </div>

              <div className="max-h-72 divide-y divide-slate-800/30 overflow-y-auto">
                {buildSlots.map((slot) => {
                  const selected = build[slot.category]
                  return (
                    <div key={slot.category} className="flex items-center gap-3 px-6 py-4 transition-colors hover:bg-indigo-500/5">
                      <slot.icon className={`h-5 w-5 shrink-0 ${selected ? 'text-indigo-400' : 'text-slate-600'}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-slate-500">{t(slot.labelKey)}</p>
                        {selected ? (
                          <p className="truncate text-xs font-medium text-slate-200">{selected.name}</p>
                        ) : (
                          <p className="text-xs italic text-slate-600">{t('notSelected')}</p>
                        )}
                      </div>
                      {selected && <span className="shrink-0 text-xs font-bold text-indigo-400">{formatPrice(selected.price, locale)}</span>}
                    </div>
                  )
                })}
              </div>

              {budgetLimit && (
                <div className="border-t border-slate-800/30 bg-slate-900/50 p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-500">{t('budget', { amount: formatPrice(budgetLimit, locale) })}</span>
                    <span className={`text-xs font-bold ${totalPrice > budgetLimit ? 'text-red-400' : 'text-emerald-400'}`}>
                      {totalPrice > budgetLimit ? t('budgetOver', { amount: formatPrice(totalPrice - budgetLimit, locale) }) : t('budgetRemaining', { amount: formatPrice(budgetLimit - totalPrice, locale) })}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full border border-indigo-500/10 bg-slate-800/50">
                    <div className={`h-full rounded-full ${totalPrice > budgetLimit ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((totalPrice / budgetLimit) * 100, 100)}%` }} />
                  </div>
                </div>
              )}

              <div className={`border-t border-slate-800/30 p-6 ${budgetLimit ? 'bg-slate-900/30' : 'bg-linear-to-br from-indigo-500/15 to-purple-500/15'}`}>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-400">{t('total')}</span>
                  <span className="bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-3xl font-bold text-transparent">{formatPrice(totalPrice, locale)}</span>
                </div>
                {totalPrice > 0 && (
                  <p className="mb-6 text-xs font-medium text-slate-500">
                    {errors.length === 0 ? t('summaryLineOk', { count: filledSlots.length }) : t('summaryLineError', { count: filledSlots.length, errors: errors.length })}
                  </p>
                )}

                <button
                  onClick={handleAddAllToCart}
                  disabled={selectedProducts.length === 0 || errors.length > 0}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 text-sm font-bold transition-all ${
                    selectedProducts.length === 0 || errors.length > 0
                      ? 'cursor-not-allowed bg-slate-700/40 text-slate-500'
                      : 'bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30 hover:from-indigo-500 hover:to-purple-500 hover:shadow-indigo-500/50'
                  }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {t('addAll')}
                </button>

                {errors.length > 0 && <p className="mt-3 text-center text-xs font-medium text-red-400">{t('fixBeforeAdd')}</p>}

                <button onClick={resetBuild} className="mt-3 w-full py-2.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-300">
                  {t('reset')}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-[#0f1117] p-6 shadow-lg">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
                <div className="rounded-lg bg-amber-500/20 p-1.5">
                  <Lightbulb className="h-4 w-4 text-amber-400" />
                </div>
                {t('tipsTitle')}
              </h3>
              <ul className="space-y-3 text-xs text-slate-500">
                {['tip1', 'tip2', 'tip3', 'tip4'].map((tipKey) => (
                  <li key={tipKey} className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-indigo-400">→</span>
                    <span>{t(tipKey)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(build.cpu || build.gpu) && (
              <div className="rounded-2xl border border-indigo-500/20 bg-[#0f1117] p-6 shadow-lg">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-300">
                  <div className="rounded-lg bg-yellow-500/20 p-1.5">
                    <Zap className="h-4 w-4 text-yellow-400" />
                  </div>
                  {t('powerTitle')}
                </h3>
                <div className="space-y-3">
                  {build.cpu && (
                    <div className="flex items-center justify-between rounded-lg bg-slate-800/30 p-3">
                      <span className="text-xs font-medium text-slate-500">{t('cpuTdp')}</span>
                      <span className="text-xs font-bold text-slate-300">{build.cpu.tdp || 0}W</span>
                    </div>
                  )}
                  {build.gpu && (
                    <div className="flex items-center justify-between rounded-lg bg-slate-800/30 p-3">
                      <span className="text-xs font-medium text-slate-500">{t('gpuTdp')}</span>
                      <span className="text-xs font-bold text-slate-300">{build.gpu.tdp || 0}W</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between rounded-lg bg-slate-800/30 p-3">
                    <span className="text-xs font-medium text-slate-500">{t('systemEstimate')}</span>
                    <span className="text-xs font-bold text-slate-300">~50W</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-indigo-500/30 bg-indigo-500/15 p-3">
                    <span className="text-xs font-bold text-slate-400">{t('estimatedTotalTdp')}</span>
                    <span className="text-sm font-bold text-indigo-400">{(build.cpu?.tdp || 0) + (build.gpu?.tdp || 0) + 50}W</span>
                  </div>
                  <p className="mt-2 rounded-lg bg-slate-800/20 p-3 text-xs text-slate-600">
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

