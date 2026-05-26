'use client'

import { useEffect, useRef } from 'react'
import { animate } from 'animejs'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = containerRef.current

    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Keep the page visible even if the animation runtime stalls.
    const animation = animate(node, {
      translateY: [12, 0],
      scale: [0.99, 1],
      duration: 400,
      easing: 'spring(1, 80, 10, 0)',
    })

    return () => {
      animation.pause()
    }
  }, [pathname])

  return (
    <div ref={containerRef} className={cn(className)}>
      {children}
    </div>
  )
}
