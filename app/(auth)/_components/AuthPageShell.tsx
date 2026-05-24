'use client'

import { useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { AuthSceneWrapper } from '@/app/components/webgl/AuthSceneWrapper'

gsap.registerPlugin(useGSAP)

type AuthPageShellProps = {
  children: ReactNode
  tone?: 'orange' | 'cyan' | 'green'
}

const toneStyles = {
  orange: {
    line: 'linear-gradient(90deg, rgba(247,147,26,0.06), rgba(247,147,26,0.46), rgba(255,214,0,0.38), rgba(247,147,26,0.06))',
    wash: 'linear-gradient(135deg, rgba(255,247,237,0.92), rgba(248,250,252,0.86) 52%, rgba(239,246,255,0.72))',
  },
  cyan: {
    line: 'linear-gradient(90deg, rgba(56,189,248,0.06), rgba(56,189,248,0.42), rgba(247,147,26,0.26), rgba(56,189,248,0.06))',
    wash: 'linear-gradient(135deg, rgba(240,249,255,0.9), rgba(248,250,252,0.86) 52%, rgba(255,247,237,0.64))',
  },
  green: {
    line: 'linear-gradient(90deg, rgba(34,197,94,0.06), rgba(34,197,94,0.38), rgba(247,147,26,0.28), rgba(34,197,94,0.06))',
    wash: 'linear-gradient(135deg, rgba(240,253,244,0.92), rgba(248,250,252,0.86) 52%, rgba(255,247,237,0.66))',
  },
}

export function AuthPageShell({ children, tone = 'orange' }: AuthPageShellProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const styles = toneStyles[tone]

  useGSAP(
    () => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduceMotion) return

      const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

      timeline
        .from('[data-auth-card]', {
          y: 20,
          duration: 0.55,
        })
        .from(
          '[data-auth-item]',
          {
            y: 8,
            duration: 0.32,
            stagger: 0.035,
          },
          '-=0.28'
        )

      gsap.to('[data-auth-accent]', {
        opacity: 0.86,
        duration: 2.4,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      })
    },
    { scope: rootRef }
  )

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-10 text-slate-950"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-[0.08]">
        <AuthSceneWrapper />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <div className="absolute inset-0" style={{ background: styles.wash }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(248,250,252,0.96) 58%, #F8FAFC 100%)',
          }}
        />
      </div>

      <div className="relative z-10 w-full px-0 sm:px-2">
        <div
          data-auth-accent
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-px w-full max-w-md -translate-x-1/2 opacity-60"
          style={{ background: styles.line }}
        />
        {children}
      </div>
    </div>
  )
}

export const authWorkspaceClass = 'mx-auto flex w-full max-w-lg items-center justify-center'

export const authCardClass =
  'relative mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-200 bg-white p-6 text-slate-950 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.55)] sm:p-8'

export const authInputClass =
  'w-full rounded-lg border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#F7931A]/70 focus:bg-white focus:shadow-[0_0_0_3px_rgba(247,147,26,0.12)]'

export const authLabelClass =
  'block text-xs font-mono font-medium uppercase tracking-wider text-slate-600'
