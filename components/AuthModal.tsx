'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const AUTH_REASONS = new Set(['required', 'login', 'register', 'forbidden'])

export function AuthModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const authReason = searchParams.get('auth')
  const nextUrl = searchParams.get('next')

  useEffect(() => {
    if (!authReason || !AUTH_REASONS.has(authReason)) return

    const authPath = authReason === 'register' ? '/register' : '/login'
    const params = new URLSearchParams()

    if (nextUrl) {
      params.set('next', nextUrl)
    }

    const query = params.toString()
    router.replace(query ? `${authPath}?${query}` : authPath)
  }, [authReason, nextUrl, router])

  return null
}
