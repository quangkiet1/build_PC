'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '@/app/providers/cart-provider'

export function Header() {
  const { cartCount, fetchCartCount } = useCart()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    // Fetch cart count when component mounts
    fetchCartCount()

    // Optional: Set up interval to sync cart count
    const interval = setInterval(() => {
      fetchCartCount()
    }, 5000)

    return () => clearInterval(interval)
  }, [fetchCartCount])

  return (
    <header className="bg-[#0a0b10] border-b border-[#1e2535] sticky top-0 z-40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-indigo-400" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              PC Builder
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/products" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Sản phẩm
            </Link>
            <Link href="/builder" className="text-slate-300 hover:text-white transition-colors text-sm font-medium">
              Build PC
            </Link>
          </div>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-lg transition-colors group"
          >
            <ShoppingCart className="w-5 h-5 text-slate-300 group-hover:text-white transition-colors" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#1e2535] space-y-3">
            <Link
              href="/products"
              className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Sản phẩm
            </Link>
            <Link
              href="/builder"
              className="block px-4 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              Build PC
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}
