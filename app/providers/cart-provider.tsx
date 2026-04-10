'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'

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
  fetchCartCount: () => Promise<void>
  addItem: (productId: string) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0)
  const [items, setItems] = useState<CartItem[]>([])

  const fetchCartCount = async () => {
    try {
      const response = await fetch('/api/cart')
      if (response.ok) {
        const data = await response.json()
        const count = data.cart?.items?.reduce((total: number, item: CartItem) => total + item.soLuong, 0) || 0
        setCartCount(count)
        setItems(data.cart?.items || [])
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    }
  }

  const addItem = (productId: string) => {
    setCartCount(prev => prev + 1)
  }

  useEffect(() => {
    fetchCartCount()
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, items, fetchCartCount, addItem }}>
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
