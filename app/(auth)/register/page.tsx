'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Cpu, Eye, EyeOff, Lock, Mail, ArrowRight, User, Phone,
  MapPin, CheckCircle, Circle, Zap, Shield,
} from 'lucide-react'
import { AuthSceneWrapper } from '@/app/components/webgl/AuthSceneWrapper'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'

// Password strength meter
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'Ít nhất 6 ký tự', pass: password.length >= 6 },
    { label: 'Có chữ hoa', pass: /[A-Z]/.test(password) },
    { label: 'Có số', pass: /[0-9]/.test(password) },
    { label: 'Ký tự đặc biệt', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const strength = checks.filter((c) => c.pass).length
  const colors = ['#334155', '#EF4444', '#F7931A', '#FFD600', '#22C55E']
  const labels = ['', 'Rất yếu', 'Yếu', 'Trung bình', 'Mạnh']

  if (!password) return null

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ background: i <= strength ? colors[strength] : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono" style={{ color: colors[strength] }}>
          {labels[strength]}
        </span>
        <div className="flex gap-3">
          {checks.map((c) => (
            <span key={c.label} className="flex items-center gap-1 text-[10px] font-mono" style={{ color: c.pass ? '#22C55E' : '#475569' }}>
              {c.pass ? <CheckCircle className="h-2.5 w-2.5" /> : <Circle className="h-2.5 w-2.5" />}
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// Step indicator
function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all duration-500"
            style={{
              background: i < current
                ? 'linear-gradient(135deg, #EA580C, #F7931A)'
                : i === current
                ? 'rgba(247,147,26,0.15)'
                : 'rgba(255,255,255,0.05)',
              border: i === current
                ? '1px solid rgba(247,147,26,0.6)'
                : i < current
                ? '1px solid transparent'
                : '1px solid rgba(255,255,255,0.08)',
              color: i <= current ? '#F7931A' : '#475569',
              boxShadow: i === current ? '0 0 15px -3px rgba(247,147,26,0.4)' : 'none',
            }}
          >
            {i < current ? '✓' : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className="h-px w-8 transition-all duration-700"
              style={{
                background: i < current
                  ? 'linear-gradient(90deg, #F7931A, #FFD600)'
                  : 'rgba(255,255,255,0.08)',
              }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function RegisterPage() {
  const router = useRouter()
  const { refreshUser } = useAuth()
  const [step, setStep] = useState(0) // 0 = account info, 1 = personal info
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [focusField, setFocusField] = useState<string | null>(null)

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Vui lòng nhập họ tên')
      return
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không đúng định dạng')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      return
    }

    setStep(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, address }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Đăng ký thất bại')
        setLoading(false)
        return
      }

      // Cập nhật auth state ngay lập tức, sau đó navigate
      await refreshUser()
      toast.success('Đăng ký thành công! Chào mừng bạn đến với PC Builder 🎉', {
        style: {
          borderRadius: '16px',
          background: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid rgba(59,130,246,0.18)',
        },
      })
      window.dispatchEvent(new Event('auth-changed'))
      router.push('/')
      router.refresh()
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  // Shared input styles
  const getInputStyle = (field: string) => ({
    background: focusField === field ? 'rgba(247,147,26,0.05)' : 'rgba(255,255,255,0.03)',
  })
  const getWrapperStyle = (field: string) => ({
    boxShadow: focusField === field
      ? '0 0 0 1px rgba(247,147,26,0.6), 0 0 20px -5px rgba(247,147,26,0.3)'
      : '0 0 0 1px rgba(255,255,255,0.08)',
  })

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030304] py-10">
      {/* WebGL Background */}
      <AuthSceneWrapper />

      {/* Background overlays */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-20" />
        <div
          className="absolute -top-1/4 -right-1/4 w-3/4 h-3/4 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at center, rgba(247,147,26,0.10) 0%, transparent 70%)',
            filter: 'blur(80px)',
          }}
        />
        <div
          className="absolute -bottom-1/4 -left-1/4 w-3/4 h-3/4 pointer-events-none"
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
          style={{ background: 'linear-gradient(90deg, transparent, #38BDF8, #F7931A, transparent)' }}
        />

        <div
          className="relative rounded-2xl border border-white/10 p-8 md:p-10 overflow-hidden"
          style={{
            background: 'rgba(9, 11, 16, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            boxShadow: '0 0 60px -10px rgba(56,189,248,0.12), 0 40px 80px -20px rgba(0,0,0,0.6)',
          }}
        >
          {/* Inner top border glow */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(56,189,248,0.4), rgba(247,147,26,0.4), transparent)' }}
          />

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl mb-4 border border-[#38BDF8]/30"
              style={{
                background: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(247,147,26,0.08))',
                boxShadow: '0 0 30px -5px rgba(56,189,248,0.3)',
              }}
            >
              <Cpu className="h-7 w-7 text-[#38BDF8]" />
            </div>
            <h1 className="text-2xl font-bold text-white font-heading tracking-tight">
              Tạo tài khoản
            </h1>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Tham gia cộng đồng{' '}
              <span className="text-[#F7931A] font-medium">PC Builder</span>
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex justify-center">
            <StepIndicator current={step} total={2} />
          </div>

          {/* Status badges */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#38BDF8]/20 bg-[#38BDF8]/5 text-[10px] font-mono text-[#38BDF8] uppercase tracking-wider">
              <Shield className="h-3 w-3" />
              {step === 0 ? 'Thông tin tài khoản' : 'Thông tin cá nhân'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[10px] font-mono text-[#475569] uppercase tracking-wider">
              <Zap className="h-3 w-3" />
              Bước {step + 1}/2
            </span>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-red-400 animate-pulse" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: Account Info */}
          {step === 0 && (
            <form onSubmit={handleNextStep} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="reg-name" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                  Họ và tên
                </label>
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none" style={getWrapperStyle('name')} />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <User className="h-4 w-4 transition-colors duration-300" style={{ color: focusField === 'name' ? '#F7931A' : '#475569' }} />
                  </div>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setFocusField('name')}
                    onBlur={() => setFocusField(null)}
                    placeholder="Nguyễn Văn A"
                    className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300"
                    style={getInputStyle('name')}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="reg-email" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none" style={getWrapperStyle('email')} />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-4 w-4 transition-colors duration-300" style={{ color: focusField === 'email' ? '#F7931A' : '#475569' }} />
                  </div>
                  <input
                    id="reg-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    placeholder="email@example.com"
                    className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300"
                    style={getInputStyle('email')}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label htmlFor="reg-password" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                  Mật khẩu
                </label>
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none" style={getWrapperStyle('password')} />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-4 w-4 transition-colors duration-300" style={{ color: focusField === 'password' ? '#F7931A' : '#475569' }} />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusField('password')}
                    onBlur={() => setFocusField(null)}
                    placeholder="••••••••"
                    className="w-full rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300"
                    style={getInputStyle('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#475569] hover:text-[#94A3B8] transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label htmlFor="reg-confirm" className="block text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <div
                    className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none"
                    style={{
                      boxShadow: confirmPassword && confirmPassword !== password
                        ? '0 0 0 1px rgba(239,68,68,0.6)'
                        : confirmPassword && confirmPassword === password
                        ? '0 0 0 1px rgba(34,197,94,0.6)'
                        : getWrapperStyle('confirm').boxShadow,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-4 w-4 transition-colors duration-300" style={{ color: focusField === 'confirm' ? '#F7931A' : '#475569' }} />
                  </div>
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusField('confirm')}
                    onBlur={() => setFocusField(null)}
                    placeholder="••••••••"
                    className="w-full rounded-xl py-3.5 pl-11 pr-12 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300"
                    style={getInputStyle('confirm')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#475569] hover:text-[#94A3B8] transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <p className="text-xs text-red-400 font-mono">Mật khẩu không khớp</p>
                )}
                {confirmPassword && confirmPassword === password && (
                  <p className="text-xs text-green-400 font-mono flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> Mật khẩu khớp
                  </p>
                )}
              </div>

              <button
                id="register-next-btn"
                type="submit"
                className="relative w-full overflow-hidden rounded-xl py-4 font-semibold text-white text-sm transition-all duration-300 group mt-2"
                style={{
                  background: 'linear-gradient(135deg, #0EA5E9, #38BDF8, #7DD3FC)',
                  boxShadow: '0 0 30px -5px rgba(56,189,248,0.5)',
                }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2">
                  Tiếp theo
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            </form>
          )}

          {/* Step 2: Personal Info */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="reg-phone" className="flex items-center gap-2 text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                  Số điện thoại
                  <span className="text-[#334155] normal-case">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none" style={getWrapperStyle('phone')} />
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Phone className="h-4 w-4 transition-colors duration-300" style={{ color: focusField === 'phone' ? '#F7931A' : '#475569' }} />
                  </div>
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => setFocusField('phone')}
                    onBlur={() => setFocusField(null)}
                    placeholder="0912 345 678"
                    className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300"
                    style={getInputStyle('phone')}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label htmlFor="reg-address" className="flex items-center gap-2 text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                  Địa chỉ
                  <span className="text-[#334155] normal-case">(Tùy chọn)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-0 rounded-xl transition-all duration-300 pointer-events-none" style={getWrapperStyle('address')} />
                  <div className="pointer-events-none absolute top-3.5 left-0 flex items-center pl-4">
                    <MapPin className="h-4 w-4 transition-colors duration-300" style={{ color: focusField === 'address' ? '#F7931A' : '#475569' }} />
                  </div>
                  <textarea
                    id="reg-address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    onFocus={() => setFocusField('address')}
                    onBlur={() => setFocusField(null)}
                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                    rows={3}
                    className="w-full rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#334155] outline-none transition-all duration-300 resize-none"
                    style={getInputStyle('address')}
                  />
                </div>
              </div>

              {/* Summary card */}
              <div
                className="rounded-xl border border-white/8 p-4 space-y-2"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-[10px] font-mono text-[#475569] uppercase tracking-widest mb-3">Thông tin tài khoản</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] font-mono">Tên</span>
                  <span className="text-xs text-white font-medium">{name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] font-mono">Email</span>
                  <span className="text-xs text-[#F7931A] font-mono">{email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#64748B] font-mono">Mật khẩu</span>
                  <span className="text-xs text-white font-mono">{'•'.repeat(Math.min(password.length, 10))}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setError(''); setStep(0) }}
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-medium text-[#94A3B8] transition-all duration-300 hover:bg-white/[0.06] hover:text-white"
                >
                  ← Quay lại
                </button>
                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="relative flex-[2] overflow-hidden rounded-xl py-3.5 font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        Hoàn thành
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </>
                    )}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
            <span className="text-xs font-mono text-[#334155] uppercase tracking-wider">Đã có tài khoản?</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
          </div>

          {/* Login link */}
          <Link
            href="/login"
            id="go-to-login-link"
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/[0.06] hover:border-[#F7931A]/30 hover:text-[#F7931A] group"
          >
            Đăng nhập ngay
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Back to home */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-xs font-mono text-[#475569] hover:text-[#94A3B8] transition-colors">
              ← Về trang chủ
            </Link>
          </div>
        </div>

        {/* Bottom info */}
        <p className="mt-6 text-center text-[11px] font-mono text-[#334155] uppercase tracking-widest">
          Đăng ký = đồng ý với Điều khoản & Chính sách · PC Builder © 2026
        </p>
      </div>

      <style jsx>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        textarea:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px rgba(9, 11, 16, 0.9) inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>
    </div>
  )
}
