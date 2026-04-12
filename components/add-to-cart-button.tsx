'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useToast } from '@/app/providers/toast-provider'
import { useCart } from '@/app/providers/cart-provider'

interface AddToCartButtonProps {
  productId: string
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { addToast } = useToast()
  const { addItem } = useCart()

  const handleAddToCart = async () => {
    setLoading(true)

    try {
      await addItem(productId, 1)
      addToast('Da them vao gio hang', 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Khong the ket noi den server'
      addToast(message, 'error')
      if (message.toLowerCase().includes('dang nhap')) {
        router.push('/?auth=required')
      }
    } finally {
      setLoading(false)
    }
  }

  return <Button onClick={handleAddToCart} disabled={loading} className="gaming-gradient">{loading ? 'Dang them...' : 'Them vao gio'}</Button>
}
