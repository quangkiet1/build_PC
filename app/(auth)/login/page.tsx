'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Cpu,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from 'lucide-react'
import {
  AuthPageShell,
  authCardClass,
  authInputClass,
  authLabelClass,
  authWorkspaceClass,
} from '@/app/(auth)/_components/AuthPageShell'

function getSafeNextUrl(next: string | null) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return '/'
  return next
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = getSafeNextUrl(searchParams.get('next'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Đăng nhập thất bại')
        setLoading(false)
        return
      }

      window.dispatchEvent(new Event('auth-changed'))
      router.push(nextUrl)
      router.refresh()
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.')
      setLoading(false)
    }
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
                'linear-gradient(90deg, transparent, rgba(247,147,26,0.74), rgba(255,214,0,0.7), transparent)',
            }}
          />

          <div data-auth-item className="mb-7 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-orange-100 bg-orange-50">
              <Cpu className="h-7 w-7 text-[#F7931A]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Đăng nhập</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Trở lại PC Builder để tiếp tục cấu hình, giỏ hàng và đơn của bạn.
            </p>
          </div>

          {error && (
            <div
              data-auth-item
              className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
              <p>{error}</p>
            </div>
          )}

          <form data-auth-item onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="login-email" className={authLabelClass}>
                Địa chỉ email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="login-email"
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

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <label htmlFor="login-password" className={authLabelClass}>
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-mono text-[#F7931A] transition hover:text-[#FFD600]"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${authInputClass} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-950"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_-22px_rgba(234,88,12,0.9)] transition hover:translate-y-[-1px] disabled:pointer-events-none disabled:opacity-60"
            >
              <span className="absolute inset-0 bg-white/12 opacity-0 transition group-hover:opacity-100" />
              <span className="relative flex items-center gap-2">
                {loading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                )}
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
              </span>
            </button>
          </form>

          <div data-auth-item className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#475569]">
              Chưa có tài khoản?
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
          </div>

          <Link
            data-auth-item
            id="go-to-register-link"
            href="/register"
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700"
          >
            Tạo tài khoản mới
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>

          <div data-auth-item className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-slate-500 transition hover:text-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Về trang chủ
            </Link>
          </div>
        </section>
      </main>
    </AuthPageShell>
  )
}
