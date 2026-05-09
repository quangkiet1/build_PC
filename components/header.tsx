'use client'

import { useEffect, useRef, useState } from 'react'
import { animate } from 'animejs'
import { Menu, Settings, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/app/providers/cart-provider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { UserDropdown } from '@/components/UserDropdown'

export function Header() {
  const { cartCount } = useCart()
  const { user, openAuthModal } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const badgeRef = useRef<HTMLSpanElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('header')

  useEffect(() => {
    const badge = badgeRef.current

    if (!badge || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    // Gentle floating animation for cart badge
    const animation = animate(badge, {
      rotate: [-3, 0, 3, 0],
      scale: [1, 1.08],
      duration: 2200,
      alternate: true,
      loop: true,
      easing: 'spring(1, 100, 8, 0)',
    })

    return () => {
      animation.pause()
    }
  }, [])

  useEffect(() => {
    const menu = mobileMenuRef.current

    if (!mobileMenuOpen || !menu || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return
    }

    const targets = Array.from(menu.querySelectorAll<HTMLElement>('[data-menu-item]'))

    // Smooth slide-in animation with spring effect
    const animation = animate(targets.length > 0 ? targets : menu, {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 350,
      delay: (_, index) => index * 45,
      easing: 'spring(1, 80, 12, 0)',
    })

    return () => {
      animation.pause()
    }
  }, [mobileMenuOpen])

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0F1115]/80 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-3 text-2xl font-heading font-bold text-white transition hover:text-[#F7931A]">
            <span
              ref={badgeRef}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#F7931A]/30 bg-[#F7931A]/10 shadow-[0_0_20px_-5px_rgba(247,147,26,0.3)] transition group-hover:scale-105 group-hover:shadow-[0_0_25px_-5px_rgba(247,147,26,0.5)]"
            >
              <Settings className="h-5 w-5 text-[#FFD600]" />
            </span>
            <span>{t('brand')}</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/products" className="text-sm font-mono tracking-widest uppercase text-muted transition hover:text-[#F7931A]">
              {t('products')}
            </Link>
            {user ? (
              <Link href="/builder" className="text-sm font-mono tracking-widest uppercase text-muted transition hover:text-[#F7931A]">
                {t('builder')}
              </Link>
            ) : (
              <button onClick={() => openAuthModal({ reason: 'required', nextUrl: '/builder' })} className="text-sm font-mono tracking-widest uppercase text-muted transition hover:text-[#F7931A]">
                {t('builder')}
              </button>
            )}
            <Link href="/promotions" className="text-sm font-mono tracking-widest uppercase text-muted transition hover:text-[#F7931A]">
              {t('promotions')}
            </Link>
            <LanguageSwitcher />
            {user ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAuthModal({ mode: 'login', reason: 'login' })}
                  className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:border-[#F7931A]/50 hover:bg-[#F7931A]/10 hover:text-[#F7931A]"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => openAuthModal({ mode: 'register', reason: 'register' })}
                  className="rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-4 py-2 text-sm font-semibold text-white shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)] transition hover:scale-105 hover:shadow-[0_0_25px_-5px_rgba(247,147,26,0.7)]"
                >
                  {t('register')}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative rounded-lg px-4 py-2 transition hover:bg-white/5 group">
              <ShoppingCart className="h-5 w-5 text-muted group-hover:text-[#F7931A]" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#EA580C] px-1 text-[10px] font-mono text-white shadow-[0_0_10px_rgba(234,88,12,0.5)]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg p-2 text-muted transition hover:bg-white/5 hover:text-[#F7931A] md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div ref={mobileMenuRef} className="space-y-2 border-t border-white/10 py-4 md:hidden">
            <Link href="/products" data-menu-item className="block rounded-lg px-4 py-2 text-muted font-mono uppercase tracking-widest text-sm transition hover:bg-white/5 hover:text-[#F7931A]">
              {t('products')}
            </Link>
            {user ? (
              <Link href="/builder" data-menu-item className="block rounded-lg px-4 py-2 text-muted font-mono uppercase tracking-widest text-sm transition hover:bg-white/5 hover:text-[#F7931A]">
                {t('builder')}
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal({ reason: 'required', nextUrl: '/builder' })}
                data-menu-item
                className="block w-full rounded-lg px-4 py-2 text-left text-muted font-mono uppercase tracking-widest text-sm transition hover:bg-white/5 hover:text-[#F7931A]"
              >
                {t('builder')}
              </button>
            )}
            <Link href="/promotions" data-menu-item className="block rounded-lg px-4 py-2 text-muted font-mono uppercase tracking-widest text-sm transition hover:bg-white/5 hover:text-[#F7931A]">
              {t('promotions')}
            </Link>
            <div data-menu-item className="px-1 pt-2">
              <LanguageSwitcher />
            </div>
            {user ? (
              <div data-menu-item className="grid gap-2 px-1 pt-2">
                <Link href="/profile" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                  {t('profile')}
                </Link>
                <Link href="/orders" className="rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                  {t('orders')}
                </Link>
              </div>
            ) : (
              <div data-menu-item className="grid grid-cols-2 gap-3 px-1 pt-2">
                <button
                  onClick={() => openAuthModal({ mode: 'login', reason: 'login' })}
                  className="rounded-full border border-white/20 bg-transparent px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-[#F7931A]/50 hover:bg-[#F7931A]/10 hover:text-[#F7931A]"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => openAuthModal({ mode: 'register', reason: 'register' })}
                  className="rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-4 py-3 text-center text-sm font-semibold text-white shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)] transition hover:scale-105 hover:shadow-[0_0_25px_-5px_rgba(247,147,26,0.7)]"
                >
                  {t('register')}
                </button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
