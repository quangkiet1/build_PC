'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, ShoppingCart, X } from 'lucide-react'
import { useCart } from '@/app/providers/cart-provider'

export function Header() {
  const { cartCount, fetchCartCount, isAuthenticated } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [account, setAccount] = useState<{ name: string; role: 'QUAN_TRI_VIEN' | 'KHACH_HANG' } | null>(null)

  const roleLabel = account?.role === 'QUAN_TRI_VIEN' ? 'Admin' : account?.role === 'KHACH_HANG' ? 'User' : null

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    const basePath = pathname || '/'
    router.push(`${basePath}?auth=${mode}&next=${encodeURIComponent(basePath)}`)
  }

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!response.ok) {
          setAccount(null)
          return
        }

        const data = await response.json()
        if (data.user?.role === 'QUAN_TRI_VIEN' || data.user?.role === 'KHACH_HANG') {
          setAccount({ name: data.user.name, role: data.user.role })
        } else {
          setAccount(null)
        }
      } catch {
        setAccount(null)
      }
    }

    const handleAuthChanged = () => {
      void fetchMe()
      void fetchCartCount()
    }

    window.addEventListener('auth-changed', handleAuthChanged)
    void fetchMe()

    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged)
    }
  }, [fetchCartCount])

  useEffect(() => {
    const initial = setTimeout(() => {
      void fetchCartCount()
    }, 0)

    const interval = setInterval(() => {
      if (isAuthenticated) {
        void fetchCartCount()
      }
    }, 5000)

    return () => {
      clearTimeout(initial)
      clearInterval(interval)
    }
  }, [fetchCartCount, isAuthenticated])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setAccount(null)
    window.dispatchEvent(new Event('auth-changed'))
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#1e2535] bg-[#0a0b10]">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-sky-300 transition hover:text-sky-200">
            PC Builder
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {roleLabel && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${roleLabel === 'Admin' ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}`}>
                {roleLabel}
              </span>
            )}
            <Link href="/products" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Sản phẩm
            </Link>
            <Link href="/builder" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Build PC
            </Link>
            <Link href="/promotions" className="text-sm font-medium text-slate-300 transition hover:text-white">
              Khuyến mãi
            </Link>
            {account && (
              <>
                <Link href="/profile" className="text-sm font-medium text-slate-300 transition hover:text-white">
                  Profile
                </Link>
                {account.role === 'QUAN_TRI_VIEN' && (
                  <Link href="/admin" className="text-sm font-medium text-amber-300 transition hover:text-amber-200">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="text-sm font-medium text-rose-300 transition hover:text-rose-200">
                  Đăng xuất
                </button>
              </>
            )}
            {!account && (
              <button onClick={() => openAuthModal('login')} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500">
                Đăng nhập
              </button>
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
              Sản phẩm
            </Link>
            <Link href="/builder" className="block rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white">
              Build PC
            </Link>
            <Link href="/promotions" className="block rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white">
              Khuyến mãi
            </Link>
            {account && (
              <>
                <Link href="/profile" className="block rounded-lg px-4 py-2 text-slate-300 transition hover:bg-white/5 hover:text-white">
                  Profile
                </Link>
                {account.role === 'QUAN_TRI_VIEN' && (
                  <Link href="/admin" className="block rounded-lg px-4 py-2 text-amber-300 transition hover:bg-white/5 hover:text-amber-200">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="block w-full rounded-lg px-4 py-2 text-left text-rose-300 transition hover:bg-white/5 hover:text-rose-200">
                  Đăng xuất
                </button>
              </>
            )}
            {!account && (
              <button onClick={() => openAuthModal('login')} className="block w-full rounded-lg bg-indigo-600 px-4 py-2 text-left text-white hover:bg-indigo-500">
                Đăng nhập
              </button>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}
