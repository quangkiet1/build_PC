'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { gsap } from 'gsap'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Cpu,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react'
import {
  AuthPageShell,
  authCardClass,
  authInputClass,
  authLabelClass,
  authWorkspaceClass,
} from '@/app/(auth)/_components/AuthPageShell'
import { getLocalizedApiError } from '@/lib/localized-api-error'

type Step = 'email' | 'otp' | 'choice' | 'reset'

function Countdown({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const t = useTranslations('auth.forgotPage')
  const [left, setLeft] = useState(() => seconds)
  const onEndRef = useRef(onEnd)

  useEffect(() => {
    onEndRef.current = onEnd
  }, [onEnd])

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((value) => {
        if (value <= 1) {
          window.clearInterval(id)
          onEndRef.current()
          return 0
        }
        return value - 1
      })
    }, 1000)

    return () => window.clearInterval(id)
  }, [seconds])

  const pct = Math.max(0, left / seconds)
  const radius = 20
  const circumference = 2 * Math.PI * radius

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={left < 30 ? '#EF4444' : '#F7931A'}
          strokeLinecap="round"
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
          transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
        />
        <text
          x="28"
          y="33"
          textAnchor="middle"
          fontFamily="var(--font-code)"
          fontSize="13"
          fontWeight="700"
          fill={left < 30 ? '#EF4444' : '#F7931A'}
        >
          {left}s
        </text>
      </svg>
      <span className="text-xs font-mono text-[#94A3B8]">{t('expires')}</span>
    </div>
  )
}

function StepIndicator({ step }: { step: Step }) {
  const t = useTranslations('auth.forgotPage')
  const labels = [t('steps.gmail'), t('steps.otp'), t('steps.confirm'), t('steps.password')]
  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : step === 'choice' ? 2 : 3

  return (
    <div className="mb-7 flex items-center justify-center gap-1.5">
      {labels.map((label, index) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition"
              style={{
                background:
                  index < stepIndex
                    ? 'linear-gradient(135deg, #EA580C, #F7931A)'
                    : index === stepIndex
                      ? 'rgba(247,147,26,0.14)'
                      : 'rgba(255,255,255,0.04)',
                borderColor: index <= stepIndex ? 'rgba(247,147,26,0.56)' : 'rgba(255,255,255,0.1)',
                color: index <= stepIndex ? '#FFD600' : '#64748B',
              }}
            >
              {index < stepIndex ? '✓' : index + 1}
            </div>
            <span className="text-[10px] font-mono text-[#64748B]">{label}</span>
          </div>
          {index < labels.length - 1 && (
            <div
              className="mb-4 h-px w-7 sm:w-9"
              style={{
                background:
                  index < stepIndex
                    ? 'linear-gradient(90deg, #F7931A, #FFD600)'
                    : 'rgba(255,255,255,0.1)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function ForgotPasswordPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const panelRef = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [canResend, setCanResend] = useState(false)
  const [timerKey, setTimerKey] = useState(0)
  const [devOtp, setDevOtp] = useState('')

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion || !panelRef.current) return

    gsap.fromTo(
      panelRef.current,
      { y: 10 },
      { y: 0, duration: 0.3, ease: 'power2.out' }
    )
    gsap.fromTo(
      panelRef.current.querySelectorAll('[data-step-item]'),
      { y: 6 },
      { y: 0, duration: 0.24, stagger: 0.03, ease: 'power2.out' }
    )
  }, [step])

  async function handleSendOtp(e?: React.FormEvent<HTMLFormElement>) {
    e?.preventDefault()
    const normalizedEmail = email.trim().toLowerCase()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError(t('forgotPage.emailInvalid'))
      return
    }

    setEmail(normalizedEmail)
    setError('')
    setLoading(true)
    setCanResend(false)
    setDevOtp('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(getLocalizedApiError(data, locale, t('forgotPage.sendFailed')))
        setLoading(false)
        return
      }

      if (data.devOtp) setDevOtp(data.devOtp)
      setOtp('')
      setStep('otp')
      setTimerKey((key) => key + 1)
    } catch {
      setError(t('serverRetry'))
    }

    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmedOtp = otp.replace(/\D/g, '')

    if (trimmedOtp.length !== 6) {
      setError(t('forgotPage.otpRequired'))
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: trimmedOtp }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(getLocalizedApiError(data, locale, t('forgotPage.otpInvalid')))
        setLoading(false)
        return
      }

      setStep('choice')
    } catch {
      setError(t('serverRetry'))
    }

    setLoading(false)
  }

  async function handleSkip() {
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/skip-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(getLocalizedApiError(data, locale, t('forgotPage.skipFailed')))
        setLoading(false)
        return
      }

      window.dispatchEvent(new Event('auth-changed'))
      router.push('/')
      router.refresh()
    } catch {
      setError(t('serverRetry'))
    }

    setLoading(false)
  }

  async function handleResetPassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (password.length < 6) {
      setError(t('forgotPage.passwordMin'))
      return
    }
    if (password !== confirmPassword) {
      setError(t('forgotPage.passwordMismatch'))
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(getLocalizedApiError(data, locale, t('forgotPage.resetFailed')))
        setLoading(false)
        return
      }

      window.dispatchEvent(new Event('auth-changed'))
      router.push('/')
      router.refresh()
    } catch {
      setError(t('serverRetry'))
    }

    setLoading(false)
  }

  return (
    <AuthPageShell tone="orange">
      <main className={authWorkspaceClass}>
        <section
          data-auth-card
          className={authCardClass}
        >
          <div
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(247,147,26,0.76), rgba(255,214,0,0.62), transparent)',
            }}
          />

          <div data-auth-item className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-[#F7931A]/30 bg-[#F7931A]/10 shadow-[0_0_24px_-8px_rgba(247,147,26,0.72)]">
              <Cpu className="h-7 w-7 text-[#F7931A]" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white">{t('forgotPage.title')}</h1>
            <p className="mt-2 text-sm leading-6 text-[#94A3B8]">
              {t('forgotPage.description')}
            </p>
          </div>

          <div data-auth-item>
            <StepIndicator step={step} />
          </div>

          {error && (
            <div
              data-auth-item
              className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
              <p>{error}</p>
            </div>
          )}

          <div ref={panelRef}>
            {step === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-5">
                <div data-step-item className="rounded-xl border border-[#F7931A]/20 bg-[#F7931A]/10 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#FFD600]" />
                    <p className="text-sm leading-6 text-[#CBD5E1]">
                      {t('forgotPage.emailHelp')}
                    </p>
                  </div>
                </div>

                <div data-step-item className="space-y-2">
                  <label htmlFor="fp-email" className={authLabelClass}>
                    {t('forgotPage.email')}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      id="fp-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className={authInputClass}
                    />
                  </div>
                </div>

                <button
                  data-step-item
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_-6px_rgba(247,147,26,0.7)] transition hover:translate-y-[-1px] hover:shadow-[0_0_30px_-6px_rgba(247,147,26,0.85)] disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  )}
                  {loading ? t('forgotPage.sending') : t('forgotPage.send')}
                  {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
                </button>

                <div data-step-item className="text-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-xs font-mono text-[#64748B] transition hover:text-[#CBD5E1]"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    {t('forgotPage.backLogin')}
                  </Link>
                </div>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div data-step-item className="text-center text-sm leading-6 text-[#CBD5E1]">
                  {t('forgotPage.sentTo', { email })}
                </div>

                {devOtp && (
                  <button
                    data-step-item
                    type="button"
                    onClick={() => setOtp(devOtp)}
                    className="w-full rounded-xl border border-[#FFD600]/25 bg-[#FFD600]/10 px-4 py-3 text-left transition hover:bg-[#FFD600]/15"
                  >
                    <span className="block text-[10px] font-mono uppercase tracking-widest text-[#FFD600]/80">
                      {t('forgotPage.devMode')}
                    </span>
                    <span className="mt-1 block text-sm text-[#FFF7B0]">
                      {t('forgotPage.devOtp')}{' '}
                      <strong className="font-mono text-lg tracking-[0.28em] text-[#FFD600]">
                        {devOtp}
                      </strong>
                    </span>
                  </button>
                )}

                <div data-step-item className="flex justify-center">
                  <Countdown key={timerKey} seconds={120} onEnd={() => setCanResend(true)} />
                </div>

                <div data-step-item className="space-y-2">
                  <label htmlFor="fp-otp" className={`${authLabelClass} text-center`}>
                    {t('forgotPage.enterOtp')}
                  </label>
                  <input
                    id="fp-otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className={`${authInputClass} pl-4 pr-4 text-center text-3xl font-bold tracking-[0.42em]`}
                  />
                  <p className="text-center text-xs font-mono text-[#64748B]">{t('forgotPage.digitCount', { count: otp.length })}</p>
                </div>

                <button
                  data-step-item
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_-6px_rgba(247,147,26,0.7)] transition hover:translate-y-[-1px] hover:shadow-[0_0_30px_-6px_rgba(247,147,26,0.85)] disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  )}
                  {loading ? t('forgotPage.verifying') : t('forgotPage.verify')}
                  {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
                </button>

                <div data-step-item className="flex items-center justify-between gap-4 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email')
                      setOtp('')
                      setError('')
                    }}
                    className="text-[#64748B] transition hover:text-[#CBD5E1]"
                  >
                    {t('forgotPage.changeEmail')}
                  </button>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={() => {
                        setOtp('')
                        setError('')
                        void handleSendOtp()
                      }}
                      className="flex items-center gap-1.5 text-[#F7931A] transition hover:text-[#FFD600]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {t('forgotPage.resend')}
                    </button>
                  ) : (
                    <span className="text-[#475569]">{t('forgotPage.resendWait')}</span>
                  )}
                </div>
              </form>
            )}

            {step === 'choice' && (
              <div className="space-y-5">
                <div data-step-item className="rounded-xl border border-[#F7931A]/20 bg-[#F7931A]/10 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#FFD600]" />
                    <div>
                      <p className="font-semibold text-white">{t('forgotPage.verified')}</p>
                      <p className="mt-1 text-sm leading-6 text-[#CBD5E1]">
                        {t('forgotPage.changeNowQuestion')}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  data-step-item
                  type="button"
                  onClick={() => {
                    setPassword('')
                    setConfirmPassword('')
                    setError('')
                    setStep('reset')
                  }}
                  className="group flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_-6px_rgba(247,147,26,0.7)] transition hover:translate-y-[-1px] hover:shadow-[0_0_30px_-6px_rgba(247,147,26,0.85)]"
                >
                  {t('forgotPage.changeNow')}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>

                <button
                  data-step-item
                  type="button"
                  disabled={loading}
                  onClick={() => void handleSkip()}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-3.5 text-sm font-medium text-[#CBD5E1] transition hover:border-[#F7931A]/45 hover:bg-[#F7931A]/10 hover:text-white disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  )}
                  {loading ? t('forgotPage.processing') : t('forgotPage.skip')}
                </button>
              </div>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div data-step-item className="rounded-xl border border-[#F7931A]/20 bg-[#F7931A]/10 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#F7931A]" />
                    <p className="text-sm leading-6 text-[#CBD5E1]">{t('forgotPage.resetHelp', { email })}</p>
                  </div>
                </div>

                <div data-step-item className="space-y-2">
                  <label htmlFor="fp-password" className={authLabelClass}>
                    {t('forgotPage.newPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      id="fp-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('passwordHint')}
                      className={`${authInputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={showPassword ? t('hidePassword') : t('showPassword')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] transition hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div data-step-item className="space-y-2">
                  <label htmlFor="fp-confirm" className={authLabelClass}>
                    {t('forgotPage.confirmNewPassword')}
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                    <input
                      id="fp-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder={t('forgotPage.confirmPlaceholder')}
                      className={`${authInputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((value) => !value)}
                      aria-label={showConfirm ? t('hideConfirmPassword') : t('showConfirmPassword')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] transition hover:text-white"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  data-step-item
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_-6px_rgba(247,147,26,0.7)] transition hover:translate-y-[-1px] hover:shadow-[0_0_30px_-6px_rgba(247,147,26,0.85)] disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  )}
                  {loading ? t('forgotPage.saving') : t('forgotPage.save')}
                  {!loading && <CheckCircle className="h-4 w-4" />}
                </button>

                <button
                  data-step-item
                  type="button"
                  onClick={() => {
                    setError('')
                    setStep('choice')
                  }}
                  className="w-full rounded-full border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-[#CBD5E1] transition hover:bg-white/[0.08] hover:text-white"
                >
                  {t('forgotPage.backChoice')}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
    </AuthPageShell>
  )
}
