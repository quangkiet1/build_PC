'use client'

import { usePathname } from 'next/navigation'

const AUTH_PATHS = ['/login', '/register', '/forgot-password']

export function ContentWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  return (
    <div className={isAuth ? '' : 'pt-16'}>
      {children}
    </div>
  )
}
