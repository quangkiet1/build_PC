'use client'

import { useEffect, useState, useRef } from 'react'
import { animate } from 'animejs'
import { ChevronUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function BackToTop() {
  const t = useTranslations('common')
  const [isVisible, setIsVisible] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      
      // Show button when scrolled down from top
      setIsVisible(scrollTop > 100)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Check initial state

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleClick = () => {
    // Smooth scroll to top using window.scrollTo with behavior
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
    
    // Animate the button
    if (buttonRef.current) {
      animate(buttonRef.current, {
        scale: [1, 0.9, 1.1, 1],
        duration: 300,
        easing: 'spring(1, 80, 10, 0)',
      })
    }
  }

  if (!isVisible) return null

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="fixed bottom-24 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[#F7931A]/30 bg-[#F7931A]/90 text-white shadow-[0_8px_30px_rgba(247,147,26,0.36)] transition-all hover:scale-110 hover:bg-[#ff9f2d] focus:outline-none focus:ring-2 focus:ring-[#F7931A] focus:ring-offset-2 focus:ring-offset-[#030304]"
      aria-label={t('backToTop')}
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  )
}
