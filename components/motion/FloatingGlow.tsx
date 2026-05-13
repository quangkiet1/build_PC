'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { cn } from '@/lib/utils'

interface FloatingGlowProps {
  className?: string
  duration?: number
  delay?: number
}

export function FloatingGlow({ className, duration = 3600, delay = 0 }: FloatingGlowProps) {
  const glowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = glowRef.current

    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Smooth floating glow effect
    const animation = animate(node, {
      translateX: [-8, 12],
      translateY: [-8, 12],
      scale: [1, 1.06],
      opacity: [0.2, 0.35],
      duration,
      delay,
      alternate: true,
      loop: true,
      easing: 'spring(1, 90, 8, 0)',
    })

    return () => {
      animation.pause()
    }
  }, [delay, duration])

  return <div ref={glowRef} className={cn('pointer-events-none', className)} aria-hidden="true" />
}
