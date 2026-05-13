'use client'

import { motion } from 'framer-motion'
import React from 'react'

interface InfiniteSliderProps {
  children: React.ReactNode[]
  speed?: number
  reverse?: boolean
}

export function InfiniteSlider({ 
  children, 
  speed = 40, 
  reverse = false 
}: InfiniteSliderProps) {
  // To create a seamless infinite loop, we duplicate the children
  const duplicatedChildren = [...children, ...children]

  return (
    <div className="relative flex overflow-hidden py-4 select-none">
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      <motion.div
        className="flex whitespace-nowrap"
        animate={{
          x: reverse ? ['-50%', '0%'] : ['0%', '-50%'],
        }}
        transition={{
          ease: 'linear',
          duration: speed,
          repeat: Infinity,
        }}
      >
        {duplicatedChildren.map((child, idx) => (
          <div
            key={idx}
            className="flex shrink-0 items-center justify-center px-4"
          >
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
