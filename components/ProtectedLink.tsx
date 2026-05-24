'use client'

import { type AnchorHTMLAttributes, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

type ProtectedLinkProps = {
  href: string
  className?: string
  children: ReactNode
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'onClick' | 'href'>

export function ProtectedLink({ href, className, children, ...rest }: ProtectedLinkProps) {
  const router = useRouter()
  const { user } = useAuth()

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault()
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
    </a>
  )
}

