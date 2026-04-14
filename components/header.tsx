'use client'

import { Menu, Settings, ShoppingCart, X } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/app/providers/cart-provider'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { UserDropdown } from '@/components/UserDropdown'

export function Header() {
  const { cartCount } = useCart()
  const { user, openAuthModal } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const t = useTranslations('header')

  return (
    <header className="sticky top-0 z-40 border-b border-[#1e2535] bg-[#0a0b10]/95 backdrop-blur-xl">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-3 text-2xl font-bold text-sky-300 transition hover:text-sky-200">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-sky-400/20 bg-[linear-gradient(135deg,rgba(56,189,248,0.18),rgba(99,102,241,0.28))] shadow-[0_10px_40px_rgba(56,189,248,0.16)] transition group-hover:scale-105">
              <Settings className="h-5 w-5" />
            </span>
            <span>{t('brand')}</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/products" className="text-sm font-medium text-slate-300 transition hover:text-white">
              {t('products')}
            </Link>
            {user ? (
              <Link href="/builder" className="text-sm font-medium text-slate-300 transition hover:text-white">
                {t('builder')}
              </Link>
            ) : (
              <button onClick={() => openAuthModal({ reason: 'required', nextUrl: '/builder' })} className="text-sm font-medium text-slate-300 transition hover:text-white">
                {t('builder')}
              </button>
            )}
            <Link href="/promotions" className="text-sm font-medium text-slate-300 transition hover:text-white">
              {t('promotions')}
            </Link>
            <LanguageSwitcher />
            {user ? (
              <UserDropdown />
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => openAuthModal({ mode: 'login', reason: 'login' })}
                  className="rounded-xl border border-[#2a3350] bg-transparent px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400/40 hover:bg-white/5 hover:text-white"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => openAuthModal({ mode: 'register', reason: 'register' })}
                  className="rounded-xl bg-[linear-gradient(135deg,#4f46e5,#0ea5e9)] px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_38px_rgba(79,70,229,0.42)]"
                >
                  {t('register')}
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative rounded-lg px-4 py-2 transition hover:bg-white/5">
              <ShoppingCart className="h-5 w-5 text-slate-200" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-xs font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg p-2 text-slate-300 transition hover:bg-white/5 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="space-y-2 border-t border-[#1e2535] py-4 md:hidden">
            <Link href="/products" className="block rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white">
              {t('products')}
            </Link>
            {user ? (
              <Link href="/builder" className="block rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white">
                {t('builder')}
              </Link>
            ) : (
              <button
                onClick={() => openAuthModal({ reason: 'required', nextUrl: '/builder' })}
                className="block w-full rounded-lg px-4 py-2 text-left text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                {t('builder')}
              </button>
            )}
            <Link href="/promotions" className="block rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white">
              {t('promotions')}
            </Link>
            <div className="px-1 pt-2">
              <LanguageSwitcher />
            </div>
            {user ? (
              <div className="grid gap-2 px-1 pt-2">
                <Link href="/profile" className="rounded-xl border border-[#2a3350] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5">
                  {t('profile')}
                </Link>
                <Link href="/orders" className="rounded-xl border border-[#2a3350] px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/5">
                  {t('orders')}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 px-1 pt-2">
                <button
                  onClick={() => openAuthModal({ mode: 'login', reason: 'login' })}
                  className="rounded-xl border border-[#2a3350] bg-transparent px-4 py-3 text-left text-sm font-semibold text-slate-200 transition hover:bg-white/5 hover:text-white"
                >
                  {t('login')}
                </button>
                <button
                  onClick={() => openAuthModal({ mode: 'register', reason: 'register' })}
                  className="rounded-xl bg-[linear-gradient(135deg,#4f46e5,#0ea5e9)] px-4 py-3 text-left text-sm font-semibold text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] transition hover:opacity-95"
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
