'use client'

import { useEffect, useState, useRef } from 'react'
import { animate } from 'animejs'
import { ChevronUp } from 'lucide-react'

export function BackToTop() {
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
      className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/90 text-white shadow-[0_8px_30px_rgba(14,165,233,0.4)] transition-all hover:bg-sky-400 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-slate-900"
      aria-label="Lên đầu trang"
    >
      <ChevronUp className="h-6 w-6" />
    </button>
  )
}