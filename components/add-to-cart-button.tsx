'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/app/providers/toast-provider'
import { useCart } from '@/app/providers/cart-provider'

interface AddToCartButtonProps {
  productId: string
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const { addItem, fetchCartCount } = useCart()

  const handleAddToCart = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      })

      const result = await response.json()
      if (!response.ok) {
        addToast(result.error || 'Lỗi khi thêm vào giỏ hàng', 'error')
      } else {
        addToast('✓ Đã thêm vào giỏ hàng', 'success')
        addItem(productId)
        fetchCartCount()
      }
    } catch (error) {
      addToast('Không thể kết nối đến server', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleAddToCart} disabled={loading} className="gaming-gradient">
      {loading ? 'Đang thêm...' : 'Thêm vào giỏ'}
    </Button>
  )
}
