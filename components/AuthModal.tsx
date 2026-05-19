'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { usePathname, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, LogIn, Mail, ShieldCheck, Sparkles, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'

type AuthTab = 'login' | 'register'
type FieldErrors = {
  name?: string
  email?: string
  password?: string
  general?: string
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthModal() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { closeAuthModal, completeAuthSuccess } = useAuth()
  const t = useTranslations('auth')

  const authReason = searchParams.get('auth')
  const redirectTarget = searchParams.get('next') || '/'

  const [activeTab, setActiveTab] = useState<AuthTab>(authReason === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' })
  const [loginErrors, setLoginErrors] = useState<FieldErrors>({})
  const [registerErrors, setRegisterErrors] = useState<FieldErrors>({})

  const isOpen = useMemo(
    () => authReason === 'required' || authReason === 'login' || authReason === 'register' || authReason === 'forbidden',
    [authReason]
  )

  useEffect(() => {
    if (authReason === 'register') {
      setActiveTab('register')
      setLoginErrors({})
      setRegisterErrors({})
      return
    }

    if (authReason === 'login' || authReason === 'required' || authReason === 'forbidden') {
      setActiveTab('login')
      setLoginErrors({})
      setRegisterErrors({})
    }
  }, [authReason])

  const validateLogin = () => {
    const nextErrors: FieldErrors = {}

    if (!loginForm.email.trim()) {
      nextErrors.email = t('emailRequired')
    } else if (!EMAIL_REGEX.test(loginForm.email.trim())) {
      nextErrors.email = t('emailInvalid')
    }

    if (!loginForm.password) {
      nextErrors.password = t('passwordRequired')
    } else if (loginForm.password.length < 6) {
      nextErrors.password = t('passwordMin')
    }

    setLoginErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const validateRegister = () => {
    const nextErrors: FieldErrors = {}

    if (!registerForm.name.trim()) {
      nextErrors.name = t('nameRequired')
    }

    if (!registerForm.email.trim()) {
      nextErrors.email = t('emailRequired')
    } else if (!EMAIL_REGEX.test(registerForm.email.trim())) {
      nextErrors.email = t('emailInvalid')
    }

    if (!registerForm.password) {
      nextErrors.password = t('passwordRequired')
    } else if (registerForm.password.length < 6) {
      nextErrors.password = t('passwordMin')
    }

    setRegisterErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    if (!validateLogin()) return

    setLoading(true)
    setLoginErrors({})

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email.trim(), password: loginForm.password }),
      })
      const data = await response.json().catch(() => ({ error: t('invalidResponse') }))

      if (!response.ok) {
        setLoginErrors({ general: data.error || t('loginFailed') })
        return
      }

      await completeAuthSuccess(data.message || t('loginSuccess'), redirectTarget)
    } catch {
      setLoginErrors({ general: t('networkError') })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    if (!validateRegister()) return

    setLoading(true)
    setRegisterErrors({})

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password,
        }),
      })
      const data = await response.json().catch(() => ({ error: t('invalidResponse') }))

      if (!response.ok) {
        setRegisterErrors({ general: data.error || t('registerFailed') })
        return
      }

      await completeAuthSuccess(data.message || t('registerSuccess'), redirectTarget)
    } catch {
      setRegisterErrors({ general: t('networkError') })
    } finally {
      setLoading(false)
    }
  }

  const renderFieldError = (message?: string) =>
    message ? <p className="text-xs font-mono text-red-400 mt-1">{message}</p> : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="max-w-4xl overflow-hidden border border-white/10 bg-[#030304] p-0 text-white shadow-[0_0_50px_rgba(247,147,26,0.1)] rounded-2xl">
        <div className="grid md:grid-cols-[0.9fr_1.1fr]">
          <div className="relative hidden min-h-full overflow-hidden border-r border-white/5 bg-[#0F1115] p-8 md:flex md:flex-col md:justify-between z-10">
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
            <div className="absolute -top-[20%] -left-[20%] w-[60%] h-[60%] bg-[#F7931A]/10 blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F7931A]/30 bg-[#F7931A]/10 px-3 py-1 text-xs font-mono font-medium text-[#FFD600] shadow-[0_0_15px_-5px_rgba(247,147,26,0.3)]">
                <Sparkles className="h-3.5 w-3.5" />
                {t('badge')}
              </div>
              <h2 className="mt-8 text-4xl font-heading font-bold leading-tight text-white">
                {activeTab === 'login' ? t('loginTitle') : t('registerTitle')}
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted font-body">
                {activeTab === 'login' ? t('loginDescription') : t('registerDescription')}
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/10">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#F7931A]" />
                <div>
                  <div className="font-semibold text-white font-heading">{t('flowTitle')}</div>
                  <div className="text-sm text-muted mt-1">{t('flowDescription')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-white/10">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#FFD600]" />
                <div>
                  <div className="font-semibold text-white font-heading">{t('securityTitle')}</div>
                  <div className="text-sm text-muted mt-1">{t('securityDescription')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-10 bg-[#030304] relative">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-3xl font-heading font-bold text-white">{activeTab === 'login' ? t('login') : t('register')}</DialogTitle>
              <DialogDescription className="text-muted text-sm">
                {authReason === 'required' && t('required')}
                {authReason === 'forbidden' && t('forbidden')}
                {(authReason === 'login' || authReason === 'register' || authReason === null) &&
                  t('genericDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-8 grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-[#0F1115] p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login')
                  setLoginErrors({})
                }}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'login'
                    ? 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)]'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  {t('tabLogin')}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('register')
                  setRegisterErrors({})
                }}
                className={`rounded-lg px-4 py-3 text-sm font-semibold transition-all ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)]'
                    : 'text-muted hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t('tabRegister')}
                </span>
              </button>
            </div>

            {activeTab === 'login' ? (
              <form className="mt-8 space-y-5" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted">{t('email')}</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={loginForm.email}
                      onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                      className="h-12 rounded-xl border-white/10 bg-[#0F1115] pl-11 text-white placeholder:text-muted transition-all focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] focus-visible:ring-0"
                    />
                  </div>
                  {renderFieldError(loginErrors.email)}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted">{t('password')}</label>
                  <Input
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="h-12 rounded-xl border-white/10 bg-[#0F1115] text-white placeholder:text-muted transition-all focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] focus-visible:ring-0"
                  />
                  {renderFieldError(loginErrors.password)}
                </div>

                {renderFieldError(loginErrors.general)}

                <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-semibold shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.7)] mt-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitLogin')}
                </Button>
              </form>
            ) : (
              <form className="mt-8 space-y-5" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted">{t('name')}</label>
                  <Input
                    placeholder={t('namePlaceholder')}
                    value={registerForm.name}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="h-12 rounded-xl border-white/10 bg-[#0F1115] text-white placeholder:text-muted transition-all focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] focus-visible:ring-0"
                  />
                  {renderFieldError(registerErrors.name)}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted">{t('email')}</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={registerForm.email}
                      onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                      className="h-12 rounded-xl border-white/10 bg-[#0F1115] pl-11 text-white placeholder:text-muted transition-all focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] focus-visible:ring-0"
                    />
                  </div>
                  {renderFieldError(registerErrors.email)}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-mono uppercase tracking-widest text-muted">{t('password')}</label>
                  <Input
                    type="password"
                    placeholder={t('passwordHint')}
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="h-12 rounded-xl border-white/10 bg-[#0F1115] text-white placeholder:text-muted transition-all focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] focus-visible:ring-0"
                  />
                  {renderFieldError(registerErrors.password)}
                </div>

                {renderFieldError(registerErrors.general)}

                <Button type="submit" className="h-12 w-full rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-semibold shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.7)] mt-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitRegister')}
                </Button>
              </form>
            )}

            <div className="mt-8 rounded-xl border border-white/5 bg-[#0F1115] px-4 py-3 text-xs leading-relaxed text-muted font-mono">
              {activeTab === 'login' ? t('loginHelper') : t('registerHelper')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}