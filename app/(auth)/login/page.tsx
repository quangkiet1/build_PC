'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Cpu, Eye, EyeOff, Lock, Mail, ArrowRight, Zap, Shield } from 'lucide-react'
import { AuthSceneWrapper } from '@/app/components/webgl/AuthSceneWrapper'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextUrl = searchParams.get('next') || '/'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusField, setFocusField] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent) {
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

      router.push(nextUrl)
      router.refresh()
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030304]">
      {/* WebGL Background */}
      <AuthSceneWrapper />

      {/* Background overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div
          className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(247,147,26,0.12) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(56,189,248,0.08) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Top glow accent */}
        <div
          className="absolute -top-px left-1/2 -translate-x-1/2 h-px w-4/5"
          style={{ background: 'linear-gradient(90deg, transparent, #F7931A, #FFD600, transparent)' }}
        />

        <div
          className="relative rounded-2xl border border-white/10 p-8 md:p-10 overflow-hidden"
          style={{
            background: 'rgba(9, 11, 16, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 0 60px -10px rgba(247, 147, 26, 0.15), 0 40px 80px -20px rgba(0,0,0,0.6)',
          }}
        >
          {/* Inner top border glow */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(247,147,26,0.5), transparent)' }}
          />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4 border border-[#F7931A]/30"
              style={{
                background: 'linear-gradient(135deg, rgba(247,147,26,0.15), rgba(255,214,0,0.08))',
                boxShadow: '0 0 30px -5px rgba(247,147,26,0.4)',
              }}
            >
              <Cpu className="h-7 w-7 text-[#F7931A]" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
              Chào mừng trở lại
            </h1>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Đăng nhập vào{' '}
              <span className="text-[#F7931A] font-medium">PC Builder</span>
            </p>
          </div>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/5 text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider">
              <Shield className="h-3 w-3" />
              Bảo mật SSL
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#FFD600]/20 bg-[#FFD600]/5 text-[10px] font-mono text-[#FFD600] uppercase tracking-wider">
              <Zap className="h-3 w-3" />
              Kết nối nhanh
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3"
            >
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400 animate-pulse" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Form */}
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                Địa chỉ Email
              </label>
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
                  style={{
                    boxShadow: focusField === 'email' ? '0 0 0 1px rgba(247,147,26,0.6), 0 0 20px -5px rgba(247,147,26,0.3)' : '0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail
                    className="h-4 w-4 transition-colors duration-300"
                    style={{ color: focusField === 'email' ? '#F7931A' : '#475569' }}
                  />
                </div>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusField('email')}
                  onBlur={() => setFocusField(null)}
                  placeholder="email@example.com"
                  className="w-full rounded-xl bg-white/[0.04] py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300 border border-transparent"
                  style={{
                    background: focusField === 'email' ? 'rgba(247,147,26,0.05)' : 'rgba(255,255,255,0.03)',
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="login-password" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-mono text-[#F7931A] hover:text-[#FFD600] transition-colors"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <div
                  className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
                  style={{
                    boxShadow: focusField === 'password' ? '0 0 0 1px rgba(247,147,26,0.6), 0 0 20px -5px rgba(247,147,26,0.3)' : '0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                />
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock
                    className="h-4 w-4 transition-colors duration-300"
                    style={{ color: focusField === 'password' ? '#F7931A' : '#475569' }}
                  />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusField('password')}
                  onBlur={() => setFocusField(null)}
                  placeholder="••••••••"
                  className="w-full rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300"
                  style={{
                    background: focusField === 'password' ? 'rgba(247,147,26,0.05)' : 'rgba(255,255,255,0.03)',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#475569] hover:text-[#94A3B8] transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="relative w-full overflow-hidden rounded-xl py-4 font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
              style={{
                background: loading ? 'rgba(247,147,26,0.5)' : 'linear-gradient(135deg, #EA580C, #F7931A, #FFD600)',
                boxShadow: loading ? 'none' : '0 0 30px -5px rgba(247,147,26,0.6)',
              }}
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    Đăng nhập
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-xs font-mono text-[#334155] uppercase tracking-wider">Chưa có tài khoản?</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Register link */}
          <Link
            href="/register"
            id="go-to-register-link"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/[0.06] hover:border-[#F7931A]/30 hover:text-[#F7931A] group"
          >
            Tạo tài khoản mới
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-mono text-[#475569] hover:text-[#94A3B8] transition-colors"
            >
              ← Về trang chủ
            </Link>
          </div>
        </div>

        {/* Bottom info */}
        <p className="mt-6 text-center text-[11px] font-mono text-[#334155] uppercase tracking-widest">
          Được bảo vệ bởi mã hóa AES-256 · PC Builder © 2026
        </p>
      </div>

      <style jsx>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0px 1000px rgba(9, 11, 16, 0.9) inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}
