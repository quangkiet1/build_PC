'use client'

import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type ProtectedLinkProps = {
  href: string
  className?: string
  children: ReactNode
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'>

export function ProtectedLink({ href, className, children, ...rest }: ProtectedLinkProps) {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <button
      type="button"
      onClick={() => {
        if (user) {
          router.push(href)
        } else {
          router.push(`/login?next=${encodeURIComponent(href)}`)
        }
      }}
      className={className}
      {...rest}
    >
      {children}
    </button>
  )
}
