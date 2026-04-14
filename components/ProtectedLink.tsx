'use client'

import { type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type ProtectedLinkProps = {
  href: string
  className?: string
  children: ReactNode
}

export function ProtectedLink({ href, className, children }: ProtectedLinkProps) {
  const router = useRouter()
  const { requireAuth } = useAuth()

  return (
    <button
      type="button"
      onClick={() => void requireAuth(() => router.push(href), { nextUrl: href, reason: 'required' })}
      className={className}
    >
      {children}
    </button>
  )
}