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
    message ? <p className="text-sm text-rose-300">{message}</p> : null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="max-w-4xl overflow-hidden border-[#1f2740] bg-[#0a0f17] p-0 text-slate-100 shadow-[0_30px_120px_rgba(2,6,23,0.7)]">
        <div className="grid md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden min-h-full overflow-hidden border-r border-[#1f2740] bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(99,102,241,0.2),transparent_35%),linear-gradient(180deg,#09101b,#0a0f17)] p-8 md:flex md:flex-col md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                {t('badge')}
              </div>
              <h2 className="mt-6 text-3xl font-bold leading-tight text-white">
                {activeTab === 'login' ? t('loginTitle') : t('registerTitle')}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {activeTab === 'login' ? t('loginDescription') : t('registerDescription')}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                <div>
                  <div className="font-medium text-white">{t('flowTitle')}</div>
                  <div className="text-sm text-slate-400">{t('flowDescription')}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-sky-400" />
                <div>
                  <div className="font-medium text-white">{t('securityTitle')}</div>
                  <div className="text-sm text-slate-400">{t('securityDescription')}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="text-2xl font-bold text-white">{activeTab === 'login' ? t('login') : t('register')}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {authReason === 'required' && t('required')}
                {authReason === 'forbidden' && t('forbidden')}
                {(authReason === 'login' || authReason === 'register' || authReason === null) &&
                  t('genericDescription')}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-[#27314a] bg-[#0f1522] p-1.5">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login')
                  setLoginErrors({})
                }}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === 'login'
                    ? 'bg-[linear-gradient(135deg,#4f46e5,#0ea5e9)] text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)]'
                    : 'text-slate-400 hover:text-white'
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
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  activeTab === 'register'
                    ? 'bg-[linear-gradient(135deg,#4f46e5,#0ea5e9)] text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {t('tabRegister')}
                </span>
              </button>
            </div>

            {activeTab === 'login' ? (
              <form className="mt-6 space-y-4" onSubmit={handleLogin}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">{t('email')}</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={loginForm.email}
                      onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                      className="h-12 rounded-2xl border-[#28314a] bg-[#0f1522] pl-11 text-slate-100 transition focus:border-sky-400/40 focus:ring-sky-400/20"
                    />
                  </div>
                  {renderFieldError(loginErrors.email)}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">{t('password')}</label>
                  <Input
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="h-12 rounded-2xl border-[#28314a] bg-[#0f1522] text-slate-100 transition focus:border-sky-400/40 focus:ring-sky-400/20"
                  />
                  {renderFieldError(loginErrors.password)}
                </div>

                {renderFieldError(loginErrors.general)}

                <Button type="submit" className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#0ea5e9)] text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] hover:opacity-95" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitLogin')}
                </Button>
              </form>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">{t('name')}</label>
                  <Input
                    placeholder={t('namePlaceholder')}
                    value={registerForm.name}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
                    className="h-12 rounded-2xl border-[#28314a] bg-[#0f1522] text-slate-100 transition focus:border-sky-400/40 focus:ring-sky-400/20"
                  />
                  {renderFieldError(registerErrors.name)}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">{t('email')}</label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      value={registerForm.email}
                      onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                      className="h-12 rounded-2xl border-[#28314a] bg-[#0f1522] pl-11 text-slate-100 transition focus:border-sky-400/40 focus:ring-sky-400/20"
                    />
                  </div>
                  {renderFieldError(registerErrors.email)}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-200">{t('password')}</label>
                  <Input
                    type="password"
                    placeholder={t('passwordHint')}
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                    className="h-12 rounded-2xl border-[#28314a] bg-[#0f1522] text-slate-100 transition focus:border-sky-400/40 focus:ring-sky-400/20"
                  />
                  {renderFieldError(registerErrors.password)}
                </div>

                {renderFieldError(registerErrors.general)}

                <Button type="submit" className="h-12 w-full rounded-2xl bg-[linear-gradient(135deg,#4f46e5,#0ea5e9)] text-white shadow-[0_10px_30px_rgba(79,70,229,0.35)] hover:opacity-95" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : t('submitRegister')}
                </Button>
              </form>
            )}

            <div className="mt-5 rounded-2xl border border-[#27314a] bg-[#0f1522] px-4 py-3 text-xs leading-6 text-slate-400">
              {activeTab === 'login' ? t('loginHelper') : t('registerHelper')}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}