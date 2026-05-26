'use client'

import { useEffect, useRef } from 'react'
import { animate, createScope, stagger } from 'animejs'
import { cn } from '@/lib/utils'

interface AnimatedSectionProps {
  children: React.ReactNode
  className?: string
  staggerSelector?: string
  delay?: number
  distance?: number
  once?: boolean
}

export function AnimatedSection({
  children,
  className,
  staggerSelector = '[data-animate-item]',
  delay = 0,
  distance = 28,
  once = true,
}: AnimatedSectionProps) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current

    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    let scope: ReturnType<typeof createScope> | null = null

    const runAnimation = () => {
      scope?.revert()
      scope = createScope({
        root,
        defaults: {
          duration: 700,
        },
      }).add(() => {
        const targets = Array.from(root.querySelectorAll<HTMLElement>(staggerSelector))

        if (targets.length > 0) {
          animate(targets, {
            translateY: [distance, 0],
            scale: [0.97, 1],
            delay: stagger(80, { start: delay }),
            easing: 'spring(1, 80, 10, 0)',
          })
        } else {
          animate(root, {
            translateY: [distance, 0],
            scale: [0.98, 1],
            delay,
            easing: 'spring(1, 80, 10, 0)',
          })
        }
      })
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          runAnimation()

          if (once) {
            observer.disconnect()
          }
        }
      },
      {
        threshold: 0.18,
      }
    )

    observer.observe(root)

    return () => {
      observer.disconnect()
      scope?.revert()
    }
  }, [delay, distance, once, staggerSelector])

  return (
    <div ref={rootRef} className={cn(className)}>
      {children}
    </div>
  )
}
