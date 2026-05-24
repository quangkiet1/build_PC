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
    line: 'linear-gradient(90deg, transparent, rgba(247,147,26,0.74), rgba(255,214,0,0.62), transparent)',
    wash: 'radial-gradient(circle at 72% 36%, rgba(247,147,26,0.18), transparent 34%), radial-gradient(circle at 16% 72%, rgba(56,189,248,0.08), transparent 28%)',
  },
  cyan: {
    line: 'linear-gradient(90deg, transparent, rgba(247,147,26,0.74), rgba(255,214,0,0.62), transparent)',
    wash: 'radial-gradient(circle at 72% 36%, rgba(247,147,26,0.18), transparent 34%), radial-gradient(circle at 16% 72%, rgba(56,189,248,0.08), transparent 28%)',
  },
  green: {
    line: 'linear-gradient(90deg, transparent, rgba(247,147,26,0.74), rgba(255,214,0,0.62), transparent)',
    wash: 'radial-gradient(circle at 72% 36%, rgba(247,147,26,0.18), transparent 34%), radial-gradient(circle at 16% 72%, rgba(56,189,248,0.08), transparent 28%)',
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
      className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#030304] px-4 py-10 text-white selection:bg-[#F7931A] selection:text-white"
    >
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 opacity-40">
        <AuthSceneWrapper />
      </div>

      <div className="pointer-events-none fixed inset-0 z-[1] overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
        <div className="absolute -left-1/4 -top-1/4 h-3/4 w-3/4 bg-radial-blur" />
        <div className="absolute -bottom-1/4 -right-1/4 h-3/4 w-3/4 bg-radial-blur" />
        <div className="absolute inset-0" style={{ background: styles.wash }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(3,3,4,0.18) 0%, rgba(3,3,4,0.74) 62%, #030304 100%)',
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
  'relative mx-auto w-full max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-white/10 bg-[#0F1115]/88 p-6 text-white shadow-[0_0_50px_-18px_rgba(247,147,26,0.22),0_32px_80px_-34px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:p-8'

export const authInputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-[#64748B] focus:border-[#F7931A]/70 focus:bg-white/[0.06] focus:shadow-[0_0_0_3px_rgba(247,147,26,0.16)]'

export const authLabelClass =
  'block text-xs font-mono font-medium uppercase tracking-wider text-[#94A3B8]'
