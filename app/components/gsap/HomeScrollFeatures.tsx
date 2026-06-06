'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Cpu, Zap, Shield, Wrench } from 'lucide-react'

// Register ScrollTrigger
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP)
}

const features = [
  { icon: Cpu, title: 'Hiệu suất đỉnh cao', desc: 'Chọn những linh kiện mới nhất và mạnh mẽ nhất.' },
  { icon: Zap, title: 'Tương thích 100%', desc: 'Hệ thống tự động kiểm tra tương thích giữa các linh kiện.' },
  { icon: Shield, title: 'Bảo hành chính hãng', desc: 'Tất cả linh kiện đều được bảo hành chính hãng.' },
  { icon: Wrench, title: 'Lắp ráp chuyên nghiệp', desc: 'Đội ngũ kỹ thuật viên giàu kinh nghiệm.' }
]

export function HomeScrollFeatures() {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    const isMobile = window.innerWidth < 1024
    if (isMobile || !containerRef.current || !leftRef.current || !rightRef.current) return

    // Pin the left section while the right section scrolls
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top+=100',
      end: 'bottom bottom',
      pin: leftRef.current,
      pinSpacing: false,
    })

    // Animate the cards on the right
    const cards = gsap.utils.toArray<HTMLElement>('.gsap-feature-card')
    cards.forEach((card) => {
      gsap.fromTo(
        card,
        { opacity: 0, x: 100, scale: 0.9 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse',
          }
        }
      )
    })
  }, { scope: containerRef })

  return (
    <section ref={containerRef} className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative items-start">
        {/* Left pinned section */}
        <div ref={leftRef} className="lg:w-1/2 lg:sticky lg:top-32 space-y-6">
          <h2 className="text-4xl md:text-6xl font-display font-bold leading-tight">
            <span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">
              Build PC
            </span>
            <br />
            chưa bao giờ dễ dàng đến thế
          </h2>
          <p className="text-lg text-slate-400 max-w-md">
            Trải nghiệm nền tảng xây dựng cấu hình PC với công nghệ 3D WebGL và hệ thống check tương thích thông minh.
          </p>
        </div>

        {/* Right scrolling section */}
        <div ref={rightRef} className="lg:w-1/2 flex flex-col gap-8 lg:pb-32">
          {features.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="gsap-feature-card bg-[linear-gradient(180deg,rgba(20,25,40,0.6),rgba(10,15,25,0.8))] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 lg:p-12 shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute right-0 top-0 p-10 opacity-5 transition duration-500 group-hover:scale-110 group-hover:opacity-10">
                  <Icon className="h-32 w-32 text-[#F7931A]" />
                </div>
                <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#F7931A]/25 bg-[#F7931A]/10 text-[#FFD600]">
                  <Icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 relative z-10">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed relative z-10">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
