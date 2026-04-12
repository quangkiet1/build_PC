'use client'

import React, { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

interface CartItem {
  id: string
  sanPhamId: string
  soLuong: number
  sanPham: {
    id: string
    tenSanPham: string
    gia: number
  }
}

interface CartContextType {
  cartCount: number
  items: CartItem[]
  isAuthenticated: boolean
  fetchCartCount: () => Promise<void>
  addItem: (productId: string, quantity?: number) => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0)
  const [items, setItems] = useState<CartItem[]>([])
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const fetchCartCount = useCallback(async () => {
    try {
      const response = await fetch('/api/cart', { credentials: 'include' })

      if (response.status === 401) {
        setIsAuthenticated(false)
        setCartCount(0)
        setItems([])
        return
      }

      if (!response.ok) {
        return
      }

      const data = await response.json()
      const nextItems = data.cart?.items || []
      const count = nextItems.reduce((total: number, item: CartItem) => total + item.soLuong, 0)
      setIsAuthenticated(true)
      setCartCount(count)
      setItems(nextItems)
    } catch {
      setIsAuthenticated(false)
      setCartCount(0)
      setItems([])
    }
  }, [])

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const response = await fetch('/api/cart', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    })

    if (response.status === 401) {
      setIsAuthenticated(false)
      throw new Error('Bạn cần đăng nhập để thêm vào giỏ hàng')
    }

    const result = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(result.error || 'Không thể thêm vào giỏ hàng')
    }

    setIsAuthenticated(true)
    await fetchCartCount()
  }, [fetchCartCount])

  return (
    <CartContext.Provider value={{ cartCount, items, isAuthenticated, fetchCartCount, addItem }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
