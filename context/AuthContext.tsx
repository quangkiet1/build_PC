'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: 'QUAN_TRI_VIEN' | 'KHACH_HANG'
}

type AuthMode = 'login' | 'register'
type AuthReason = 'login' | 'register' | 'required' | 'forbidden'
type PendingAction = (() => void | Promise<void>) | null

type OpenAuthOptions = {
  mode?: AuthMode
  reason?: AuthReason
  nextUrl?: string
  onSuccess?: PendingAction
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  refreshUser: () => Promise<AuthUser | null>
  openAuthModal: (options?: OpenAuthOptions) => void
  closeAuthModal: () => void
  completeAuthSuccess: (message: string, redirectTo?: string) => Promise<void>
  logout: () => Promise<void>
  requireAuth: (action: () => void | Promise<void>, options?: Omit<OpenAuthOptions, 'onSuccess'>) => Promise<void>
}

const STORAGE_KEY = 'pc-builder-auth-user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('userMenu')
  const pendingActionRef = useRef<PendingAction>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const syncStoredUser = useCallback((nextUser: AuthUser | null) => {
    if (typeof window === 'undefined') return

    if (nextUser) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })

      if (!response.ok) {
        setUser(null)
        syncStoredUser(null)
        return null
      }

      const data = await response.json()
      const nextUser = data.user
        ? {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
          }
        : null

      setUser(nextUser)
      syncStoredUser(nextUser)
      return nextUser
    } catch {
      setUser(null)
      syncStoredUser(null)
      return null
    }
  }, [syncStoredUser])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setUser(JSON.parse(stored) as AuthUser)
        } catch {
          window.localStorage.removeItem(STORAGE_KEY)
        }
      }
    }

    void refreshUser().finally(() => setIsLoading(false))

    const handleAuthChanged = () => {
      void refreshUser()
    }

    window.addEventListener('auth-changed', handleAuthChanged)
    return () => {
      window.removeEventListener('auth-changed', handleAuthChanged)
    }
  }, [refreshUser])

  const buildModalUrl = useCallback(
    (reason: AuthReason, nextUrl?: string) => {
      const fallbackCurrentUrl = typeof window !== 'undefined'
        ? `${window.location.pathname}${window.location.search}`
        : pathname || '/'

      const redirectTarget = nextUrl || fallbackCurrentUrl || '/'

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        params.set('auth', reason)
        params.set('next', redirectTarget)
        return `${window.location.pathname}?${params.toString()}`
      }

      return `${pathname || '/'}?auth=${reason}&next=${encodeURIComponent(redirectTarget)}`
    },
    [pathname]
  )

  const openAuthModal = useCallback(
    (options: OpenAuthOptions = {}) => {
      const { mode = 'login', reason = mode, nextUrl, onSuccess = null } = options
      pendingActionRef.current = onSuccess
      router.push(buildModalUrl(reason, nextUrl))
    },
    [buildModalUrl, router]
  )

  const closeAuthModal = useCallback(() => {
    pendingActionRef.current = null

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      params.delete('auth')
      params.delete('next')
      const nextQuery = params.toString()
      router.replace(nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname)
      return
    }

    router.replace(pathname || '/')
  }, [pathname, router])

  const completeAuthSuccess = useCallback(
    async (message: string, redirectTo = '/') => {
      const action = pendingActionRef.current
      pendingActionRef.current = null

      await refreshUser()
      toast.success(message, {
        style: {
          borderRadius: '16px',
          background: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid rgba(59,130,246,0.18)',
        },
      })

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        params.delete('auth')
        params.delete('next')
        const nextQuery = params.toString()
        router.replace(nextQuery ? `${window.location.pathname}?${nextQuery}` : window.location.pathname)
      }

      if (action) {
        await action()
      } else {
        router.push(redirectTo || '/')
      }

      window.dispatchEvent(new Event('auth-changed'))
      router.refresh()
    },
    [refreshUser, router]
  )

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    syncStoredUser(null)
    pendingActionRef.current = null
    toast.success(t('logoutSuccess'), {
      style: {
        borderRadius: '16px',
        background: '#0f172a',
        color: '#e2e8f0',
        border: '1px solid rgba(244,63,94,0.2)',
      },
    })
    window.dispatchEvent(new Event('auth-changed'))
    router.refresh()
  }, [router, syncStoredUser, t])

  const requireAuth = useCallback<AuthContextValue['requireAuth']>(
    async (action, options = {}) => {
      if (user) {
        await action()
        return
      }

      openAuthModal({
        mode: options.mode ?? 'login',
        reason: options.reason ?? 'required',
        nextUrl: options.nextUrl,
        onSuccess: action,
      })
    },
    [openAuthModal, user]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      refreshUser,
      openAuthModal,
      closeAuthModal,
      completeAuthSuccess,
      logout,
      requireAuth,
    }),
    [closeAuthModal, completeAuthSuccess, isLoading, logout, openAuthModal, refreshUser, requireAuth, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}