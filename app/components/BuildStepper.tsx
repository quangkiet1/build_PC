'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Build } from '@/app/lib/builder-utils'
import type { Category } from '@/app/types/builder'

interface BuildStepperItem {
  category: Category
  label: string
  icon: React.ElementType
}

interface BuildStepperProps {
  build: Build
  activeSlot: Category | null
  steps: BuildStepperItem[]
  onStepClick: (category: Category) => void
}

export function BuildStepper({ build, activeSlot, steps, onStepClick }: BuildStepperProps) {
  const firstIncompleteIndex = Math.max(
    steps.findIndex((step) => !build[step.category]),
    0
  )

  const currentIndex =
    activeSlot && steps.some((step) => step.category === activeSlot)
      ? steps.findIndex((step) => step.category === activeSlot)
      : firstIncompleteIndex

  return (
    <div className="glass-card rounded-[28px] p-4 md:p-5">
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
                'group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all',
                isActive
                  ? 'border-cyan-400/30 bg-cyan-400/10'
                  : 'border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.06]'
              )}
            >
              {isActive ? (
                <motion.div
                  layoutId="builder-active-step"
                  className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_65%)]"
                />
              ) : null}

              <div className="relative flex items-center gap-3">
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl border',
                    isDone
                      ? 'border-cyan-400/30 bg-cyan-400/12 text-cyan-300'
                      : isActive
                        ? 'border-fuchsia-400/30 bg-fuchsia-400/10 text-fuchsia-300'
                        : 'border-white/10 bg-white/5 text-slate-500'
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-slate-500">
                    Step {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">{step.label}</p>
                </div>
              </div>

              <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={false}
                  animate={{ width: isDone ? '100%' : isActive ? '60%' : '18%' }}
                  transition={{ type: 'spring', stiffness: 180, damping: 20 }}
                  className={cn(
                    'h-full rounded-full',
                    isDone ? 'bg-cyan-400' : isActive ? 'bg-fuchsia-400' : 'bg-slate-700'
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
