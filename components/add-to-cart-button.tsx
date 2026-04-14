'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { useToast } from '@/app/providers/toast-provider'
import { useCart } from '@/app/providers/cart-provider'
import { useAuth } from '@/context/AuthContext'

interface AddToCartButtonProps {
  productId: string
}

export function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [loading, setLoading] = useState(false)
  const { addToast } = useToast()
  const { addItem } = useCart()
  const { requireAuth } = useAuth()
  const t = useTranslations('productCard')

  const handleAddToCart = async () => {
    setLoading(true)

    try {
      await requireAuth(async () => {
        await addItem(productId, 1)
        addToast(t('added'), 'success')
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : t('failed')
      addToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return <Button onClick={handleAddToCart} disabled={loading} className="gaming-gradient">{loading ? t('adding') : t('add')}</Button>
}
