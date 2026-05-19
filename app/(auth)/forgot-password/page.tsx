'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Cpu, Mail, ArrowRight, RotateCcw, Lock, Eye, EyeOff, CheckCircle, ShieldCheck } from 'lucide-react'
import { AuthSceneWrapper } from '@/app/components/webgl/AuthSceneWrapper'

type Step = 'email' | 'otp' | 'reset' | 'done'

function Countdown({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [left, setLeft] = useState(seconds)

  useEffect(() => {
    setLeft(seconds)
    const id = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { clearInterval(id); onEnd(); return 0 }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds])

  const pct = (left / seconds) * 100
  const r = 20
  const circ = 2 * Math.PI * r

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
        <circle
          cx="28" cy="28" r={r} fill="none"
          stroke={left < 30 ? '#EF4444' : '#F7931A'}
          strokeWidth="3" strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - pct / 100)}
          transform="rotate(-90 28 28)"
          style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s' }}
        />
        <text x="28" y="33" textAnchor="middle" fontSize="13" fontWeight="700"
          fill={left < 30 ? '#EF4444' : '#F7931A'} fontFamily="monospace">
          {left}s
        </text>
      </svg>
      <span className="text-xs font-mono text-[#94A3B8]">Mã hết hạn sau</span>
    </div>
  )
}

export default function ForgotPasswordPage() {
  const router = useRouter()
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

  async function handleSendOtp(e?: React.FormEvent) {
    e?.preventDefault()
    setError('')
    setLoading(true)
    setCanResend(false)
    setDevOtp('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Lỗi gửi mã')
        setLoading(false)
        return
      }
      if (data.devOtp) setDevOtp(data.devOtp)
      setStep('otp')
      setTimerKey((k) => k + 1)
    } catch {
      setError('Lỗi kết nối')
    }
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = otp.replace(/\s/g, '')
    if (trimmed.length < 6) {
      setError('Vui lòng nhập đủ 6 chữ số')
      return
    }
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Mã không đúng')
        setLoading(false)
        return
      }
      setStep('reset')
    } catch {
      setError('Lỗi kết nối')
    }
    setLoading(false)
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) { setError('Mật khẩu không khớp'); return }
    if (password.length < 6) { setError('Mật khẩu phải có ít nhất 6 ký tự'); return }
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
        setError(data.error || 'Lỗi đặt lại mật khẩu')
        setLoading(false)
        return
      }
      // Đã tự đăng nhập qua cookie — thông báo AuthContext cập nhật rồi redirect
      window.dispatchEvent(new Event('auth-changed'))
      router.push('/')
      router.refresh()
    } catch {
      setError('Lỗi kết nối')
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
        setError(data.error || 'Lỗi đăng nhập tự động')
        setLoading(false)
        return
      }
      // Đã tự đăng nhập — thông báo AuthContext cập nhật rồi redirect
      window.dispatchEvent(new Event('auth-changed'))
      router.push('/')
      router.refresh()
    } catch {
      setError('Lỗi kết nối')
    }
    setLoading(false)
  }

  const stepLabels = ['Email', 'Xác nhận', 'Mật khẩu']
  const stepIndex = step === 'email' ? 0 : step === 'otp' ? 1 : step === 'reset' ? 2 : 3

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030304] py-10">
      <AuthSceneWrapper />

      {/* Background overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center,rgba(247,147,26,0.1) 0%,transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center,rgba(56,189,248,0.07) 0%,transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Top glow line */}
        <div className="absolute -top-px left-1/2 -translate-x-1/2 h-px w-4/5"
          style={{ background: 'linear-gradient(90deg,transparent,#F7931A,#FFD600,transparent)' }} />

        <div className="relative rounded-2xl border border-white/10 p-8 md:p-10"
          style={{ background: 'rgba(9,11,16,0.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', boxShadow: '0 0 60px -10px rgba(247,147,26,0.12),0 40px 80px -20px rgba(0,0,0,0.6)' }}>
          <div className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg,transparent,rgba(247,147,26,0.45),transparent)' }} />

          {/* Logo */}
          <div className="flex flex-col items-center mb-7">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4 border border-[#F7931A]/30"
              style={{ background: 'linear-gradient(135deg,rgba(247,147,26,0.15),rgba(255,214,0,0.08))', boxShadow: '0 0 30px -5px rgba(247,147,26,0.4)' }}>
              <Cpu className="h-7 w-7 text-[#F7931A]" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading">Quên mật khẩu</h1>
            <p className="mt-1 text-sm text-[#94A3B8]">Khôi phục tài khoản <span className="text-[#F7931A] font-medium">PC Builder</span></p>
          </div>

          {/* Step indicator */}
          {step !== 'done' && (
            <div className="flex items-center justify-center gap-2 mb-7">
              {stepLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-500"
                      style={{
                        background: i < stepIndex ? 'linear-gradient(135deg,#EA580C,#F7931A)' : i === stepIndex ? 'rgba(247,147,26,0.15)' : 'rgba(255,255,255,0.05)',
                        border: i === stepIndex ? '1px solid rgba(247,147,26,0.7)' : i < stepIndex ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                        color: i <= stepIndex ? '#F7931A' : '#475569',
                        boxShadow: i === stepIndex ? '0 0 12px -2px rgba(247,147,26,0.5)' : 'none',
                      }}
                    >
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    <span className="text-[10px] font-mono" style={{ color: i === stepIndex ? '#F7931A' : '#475569' }}>{label}</span>
                  </div>
                  {i < stepLabels.length - 1 && (
                    <div className="h-px w-8 mb-4 transition-all duration-700"
                      style={{ background: i < stepIndex ? 'linear-gradient(90deg,#F7931A,#FFD600)' : 'rgba(255,255,255,0.08)' }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400 animate-pulse" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* ── BƯỚC 1: NHẬP EMAIL ── */}
          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                Nhập địa chỉ email đã đăng ký. Chúng tôi sẽ gửi <span className="text-white font-medium">mã xác nhận 6 số</span> vào hộp thư của bạn.
              </p>
              <div className="space-y-2">
                <label htmlFor="fp-email" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">Địa chỉ Email</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-4 w-4 text-[#475569]" />
                  </div>
                  <input
                    id="fp-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.04)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden rounded-xl py-4 font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50 group"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F7931A,#FFD600)', boxShadow: '0 0 30px -5px rgba(247,147,26,0.55)' }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Đang gửi...</>
                    : <>Gửi mã xác nhận <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                  }
                </span>
              </button>
              <div className="text-center">
                <Link href="/login" className="text-xs font-mono text-[#475569] hover:text-[#94A3B8] transition-colors">← Quay lại đăng nhập</Link>
              </div>
            </form>
          )}

          {/* ── BƯỚC 2: NHẬP MÃ OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <p className="text-sm text-[#94A3B8] text-center leading-relaxed">
                Mã xác nhận đã gửi đến <span className="text-[#F7931A] font-medium">{email}</span>.<br />
                Kiểm tra hộp thư (kể cả spam).
              </p>

              {/* Dev mode banner */}
              {devOtp && (
                <div className="rounded-xl border border-yellow-500/30 px-4 py-3 space-y-1"
                  style={{ background: 'rgba(234,179,8,0.08)' }}>
                  <p className="text-[10px] font-mono text-yellow-500/70 uppercase tracking-widest">⚠ Dev mode — SMTP chưa cấu hình</p>
                  <p className="text-sm text-yellow-300 font-mono">
                    Mã OTP: <span
                      className="text-xl font-bold text-yellow-400 tracking-[0.3em] cursor-pointer"
                      onClick={() => setOtp(devOtp)}
                      title="Click để tự điền"
                    >{devOtp}</span>
                  </p>
                </div>
              )}

              {/* Countdown */}
              <div className="flex justify-center">
                <Countdown key={timerKey} seconds={120} onEnd={() => setCanResend(true)} />
              </div>

              {/* OTP input — dùng 1 ô text đơn giản */}
              <div className="space-y-2">
                <label htmlFor="fp-otp" className="block text-center text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                  Nhập mã 6 chữ số
                </label>
                <input
                  id="fp-otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="_ _ _ _ _ _"
                  autoComplete="one-time-code"
                  className="w-full rounded-xl py-4 text-center text-3xl font-bold font-mono text-white placeholder-[#334155] outline-none transition-all duration-300 tracking-[0.5em]"
                  style={{
                    background: otp.length > 0 ? 'rgba(247,147,26,0.06)' : 'rgba(255,255,255,0.04)',
                    boxShadow: otp.length === 6
                      ? '0 0 0 1.5px rgba(247,147,26,0.7), 0 0 20px -5px rgba(247,147,26,0.3)'
                      : '0 0 0 1px rgba(255,255,255,0.1)',
                  }}
                />
                <p className="text-center text-xs font-mono text-[#475569]">
                  {otp.length}/6 chữ số đã nhập
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.replace(/\D/g, '').length < 6}
                className="relative w-full overflow-hidden rounded-xl py-4 font-semibold text-white text-sm transition-all duration-300 disabled:opacity-40 group"
                style={{
                  background: 'linear-gradient(135deg,#EA580C,#F7931A,#FFD600)',
                  boxShadow: otp.length === 6 ? '0 0 30px -5px rgba(247,147,26,0.55)' : 'none',
                }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Đang xác nhận...</>
                    : <>Xác nhận mã <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                  }
                </span>
              </button>

              <div className="flex items-center justify-between text-xs font-mono">
                <button type="button" onClick={() => { setStep('email'); setOtp('') }}
                  className="text-[#475569] hover:text-[#94A3B8] transition-colors">
                  ← Đổi email
                </button>
                {canResend ? (
                  <button
                    type="button"
                    onClick={() => { setOtp(''); setError(''); handleSendOtp() }}
                    className="flex items-center gap-1.5 text-[#F7931A] hover:text-[#FFD600] transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />Gửi lại mã
                  </button>
                ) : (
                  <span className="text-[#334155]">Chưa nhận? Đợi hết giờ để gửi lại</span>
                )}
              </div>
            </form>
          )}

          {/* ── BƯỚC 3: ĐẶT MẬT KHẨU MỚI ── */}
          {step === 'reset' && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
                <ShieldCheck className="h-5 w-5 text-green-400 shrink-0" />
                <p className="text-sm text-green-400">Xác nhận thành công! Bạn muốn đặt mật khẩu mới hay tiếp tục ngay?</p>
              </div>

              {/* Nút bỏ qua — tự đăng nhập luôn */}
              <button
                type="button"
                disabled={loading}
                onClick={handleSkip}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-medium text-[#94A3B8] transition-all duration-300 hover:bg-white/[0.06] hover:border-[#F7931A]/30 hover:text-white disabled:opacity-50"
              >
                {loading ? 'Đang xử lý...' : '→ Bỏ qua, vào trang chủ ngay'}
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-mono text-[#334155] uppercase tracking-wider">hoặc</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* New password */}
                <div className="space-y-2">
                  <label htmlFor="fp-pass" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">Mật khẩu mới</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-4 w-4 text-[#475569]" />
                    </div>
                    <input
                      id="fp-pass"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-[#334155] outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#475569] hover:text-[#94A3B8]">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <label htmlFor="fp-confirm" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">Xác nhận mật khẩu</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-4 w-4 text-[#475569]" />
                    </div>
                    <input
                      id="fp-confirm"
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-[#334155] outline-none transition-all"
                      style={{ background: 'rgba(255,255,255,0.04)', boxShadow: '0 0 0 1px rgba(255,255,255,0.08)' }}
                    />
                    <button type="button" onClick={() => setShowConfirm((v) => !v)}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#475569] hover:text-[#94A3B8]">
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-xl py-4 font-semibold text-white text-sm transition-all disabled:opacity-50 group"
                  style={{ background: 'linear-gradient(135deg,#EA580C,#F7931A,#FFD600)', boxShadow: '0 0 30px -5px rgba(247,147,26,0.55)' }}
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center justify-center gap-2">
                    {loading
                      ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />Đang lưu...</>
                      : <>Đặt mật khẩu &amp; vào trang chủ <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" /></>
                    }
                  </span>
                </button>
              </form>
            </div>
          )}

          {/* ── BƯỚC 4: HOÀN THÀNH ── */}
          {step === 'done' && (
            <div className="flex flex-col items-center text-center gap-6 py-4">
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30"
                style={{ background: 'rgba(34,197,94,0.1)', boxShadow: '0 0 30px -5px rgba(34,197,94,0.3)' }}
              >
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Đặt lại thành công!</h2>
                <p className="text-sm text-[#94A3B8]">Mật khẩu đã được cập nhật.<br />Hãy đăng nhập với mật khẩu mới.</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 font-semibold text-white text-sm transition-all duration-300 hover:scale-105 group"
                style={{ background: 'linear-gradient(135deg,#EA580C,#F7931A,#FFD600)', boxShadow: '0 0 25px -5px rgba(247,147,26,0.5)' }}
              >
                Đến trang đăng nhập
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] font-mono text-[#334155] uppercase tracking-widest">
          Được bảo vệ bởi mã hóa AES-256 · PC Builder © 2026
        </p>
      </div>
    </div>
  )
}
