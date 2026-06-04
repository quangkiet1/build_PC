'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import type { Build } from '@/app/lib/builder-utils'
import type { Category } from '@/app/types/builder'

interface BuildStepperItem {
  category: Category
  label: string
  icon: React.ElementType<{ className?: string }>
}

interface BuildStepperProps {
  build: Build
  activeSlot: Category | null
  steps: BuildStepperItem[]
  onStepClick: (category: Category) => void
}

export function BuildStepper({ build, activeSlot, steps, onStepClick }: BuildStepperProps) {
  const t = useTranslations('builder')
  const firstIncompleteIndex = Math.max(
    steps.findIndex((step) => !build[step.category]),
    0
  )

  const currentIndex =
    activeSlot && steps.some((step) => step.category === activeSlot)
      ? steps.findIndex((step) => step.category === activeSlot)
      : firstIncompleteIndex

  return (
    <div className="glass-panel rounded-2xl p-4 md:p-5 border border-white/10 bg-white/5">
      <div className="grid gap-3 md:grid-cols-5">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isDone = Boolean(build[step.category])
          const isActive = index === currentIndex

          return (
            <button
              key={step.category}
              type="button"
              onClick={() => onStepClick(step.category)}
              className={cn(
                'group relative overflow-hidden rounded-xl border px-4 py-4 text-left transition-all',
                isActive
                  ? 'border-[#F7931A]/30 bg-[#F7931A]/10 shadow-[0_0_15px_-5px_rgba(247,147,26,0.2)]'
                  : 'border-white/10 bg-[#0F1115] hover:border-[#F7931A]/20 hover:bg-white/10'
              )}
            >
              {isActive ? (
                <motion.div
                  layoutId="builder-active-step"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-[#EA580C]/10 to-transparent pointer-events-none"
                />
              ) : null}

              <div className="relative flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-xl border transition-colors',
                    isDone
                      ? 'border-[#FFD600]/30 bg-[#FFD600]/10 text-[#FFD600]'
                      : isActive
                        ? 'border-[#F7931A]/30 bg-[#F7931A]/20 text-[#F7931A]'
                        : 'border-white/10 bg-white/5 text-muted group-hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted">
                    {t('step')} {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white font-heading">{step.label}</p>
                </div>
              </div>

              <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-black/50 border border-white/5">
                <motion.div
                  initial={false}
                  animate={{ width: isDone ? '100%' : isActive ? '60%' : '18%' }}
                  transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                  className={cn(
                    'h-full rounded-full transition-colors',
                    isDone ? 'bg-[#FFD600] shadow-[0_0_10px_rgba(255,214,0,0.5)]' : isActive ? 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] shadow-[0_0_10px_rgba(247,147,26,0.5)]' : 'bg-white/20'
                  )}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
