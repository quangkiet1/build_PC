'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Circle,
  Cpu,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import {
  AuthPageShell,
  authCardClass,
  authInputClass,
  authLabelClass,
  authWorkspaceClass,
} from '@/app/(auth)/_components/AuthPageShell'

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: '6 ký tự', pass: password.length >= 6 },
    { label: 'Chữ hoa', pass: /[A-Z]/.test(password) },
    { label: 'Chữ số', pass: /[0-9]/.test(password) },
    { label: 'Ký tự đặc biệt', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  const strength = checks.filter((check) => check.pass).length
  const colors = ['#475569', '#EF4444', '#F7931A', '#FFD600', '#22C55E']
  const labels = ['', 'Rất yếu', 'Yếu', 'Ổn', 'Mạnh']

  if (!password) return null

  return (
    <div className="mt-3 space-y-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className="h-1 flex-1 rounded-full transition"
            style={{ background: index <= strength ? colors[strength] : 'rgb(226,232,240)' }}
          />
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-mono" style={{ color: colors[strength] }}>
          {labels[strength]}
        </span>
        <div className="flex flex-wrap gap-2">
          {checks.map((check) => (
            <span
              key={check.label}
              className="flex items-center gap-1 text-[10px] font-mono"
              style={{ color: check.pass ? '#22C55E' : '#64748B' }}
            >
              {check.pass ? <CheckCircle className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
              {check.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
function StepIndicator({ step }: { step: number }) {
  const steps = ['Tài khoản', 'Thông tin']

  return (
    <div className="mb-7 flex items-center justify-center gap-2">
      {steps.map((label, index) => (
        <div key={label} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition"
              style={{
                background:
                  index < step
                    ? 'linear-gradient(135deg, #0EA5E9, #38BDF8)'
                    : index === step
                      ? 'rgba(56,189,248,0.12)'
                      : 'rgb(248,250,252)',
                borderColor: index <= step ? 'rgba(56,189,248,0.48)' : 'rgb(226,232,240)',
                color: index <= step ? '#0369A1' : '#64748B',
              }}
            >
              {index < step ? '✓' : index + 1}
            </div>
            <span className="text-[10px] font-mono text-slate-500">{label}</span>
          </div>
          {index < steps.length - 1 && (
            <div
              className="mb-4 h-px w-16"
              style={{
                background:
                  index < step
                    ? 'linear-gradient(90deg, #38BDF8, #F7931A)'
                    : 'rgb(226,232,240)',
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
  const [step, setStep] = useState(0)
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

  function handleNextStep(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Vui lòng nhập họ tên.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Email không đúng định dạng.')
      return
    }
    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.')
      return
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.')
      return
    }

    setStep(1)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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

      await refreshUser()
      toast.success('Đăng ký thành công. Chào mừng bạn đến với PC Builder!', {
        style: {
          borderRadius: '12px',
          background: '#0f172a',
          color: '#e2e8f0',
          border: '1px solid rgba(56,189,248,0.24)',
        },
      })
      window.dispatchEvent(new Event('auth-changed'))
      router.push('/')
      router.refresh()
    } catch {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.')
      setLoading(false)
    }
  }

  return (
    <AuthPageShell tone="cyan">
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
                'linear-gradient(90deg, transparent, rgba(56,189,248,0.76), rgba(247,147,26,0.64), transparent)',
            }}
          />

          <div data-auth-item className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-sky-100 bg-sky-50">
              <Cpu className="h-7 w-7 text-[#38BDF8]" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Đăng ký</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Tạo tài khoản để lưu cấu hình, theo dõi đơn hàng và nhận ưu đãi.
            </p>
          </div>

          <div data-auth-item>
            <StepIndicator step={step} />
          </div>

          <div data-auth-item className="mb-6 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-sky-700">
              <ShieldCheck className="h-4 w-4" />
              {step === 0 ? 'Bảo vệ tài khoản' : 'Thông tin giao hàng'}
            </div>
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

          {step === 0 && (
            <form data-auth-item onSubmit={handleNextStep} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reg-name" className={authLabelClass}>
                  Họ và tên
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="reg-name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={authInputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-email" className={authLabelClass}>
                  Địa chỉ email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="reg-email"
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
                <label htmlFor="reg-password" className={authLabelClass}>
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
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
                <PasswordStrength password={password} />
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-confirm" className={authLabelClass}>
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className={`${authInputClass} pr-12 ${
                      confirmPassword && confirmPassword === password
                        ? 'border-green-500/60'
                        : confirmPassword
                          ? 'border-red-500/60'
                          : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-950"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <p
                    className={`flex items-center gap-1 text-xs font-mono ${
                      confirmPassword === password ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {confirmPassword === password ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" /> Mật khẩu khớp
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5" /> Mật khẩu chưa khớp
                      </>
                    )}
                  </p>
                )}
              </div>

              <button
                id="register-next-btn"
                type="submit"
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#0EA5E9] via-[#38BDF8] to-[#7DD3FC] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_-22px_rgba(14,165,233,0.9)] transition hover:translate-y-[-1px]"
              >
                Tiếp theo
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
            </form>
          )}

          {step === 1 && (
            <form data-auth-item onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="reg-phone" className={authLabelClass}>
                  Số điện thoại <span className="normal-case text-slate-500">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                  <input
                    id="reg-phone"
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0912 345 678"
                    className={authInputClass}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reg-address" className={authLabelClass}>
                  Địa chỉ <span className="normal-case text-slate-500">(tùy chọn)</span>
                </label>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-4 h-4 w-4 text-[#64748B]" />
                  <textarea
                    id="reg-address"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Đường ABC, Quận 1, TP.HCM"
                    className={`${authInputClass} resize-none`}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-[10px] font-mono uppercase tracking-widest text-slate-500">
                  Tài khoản
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Tên</span>
                    <span className="truncate font-medium text-slate-950">{name}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-slate-500">Email</span>
                    <span className="truncate font-mono text-sky-700">{email}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setError('')
                    setStep(0)
                  }}
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
                >
                  Quay lại
                </button>
                <button
                  id="register-submit-btn"
                  type="submit"
                  disabled={loading}
                  className="group relative flex flex-[1.6] items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-[#EA580C] via-[#F7931A] to-[#FFD600] px-4 py-3.5 text-sm font-semibold text-white shadow-[0_16px_34px_-22px_rgba(234,88,12,0.9)] transition hover:translate-y-[-1px] disabled:pointer-events-none disabled:opacity-60"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" />
                  )}
                  {loading ? 'Đang tạo...' : 'Hoàn tất'}
                  {!loading && <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />}
                </button>
              </div>
            </form>
          )}

          <div data-auth-item className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200" />
            <span className="text-xs font-mono uppercase tracking-wider text-[#475569]">
              Đã có tài khoản?
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200" />
          </div>

          <Link
            data-auth-item
            id="go-to-login-link"
            href="/login"
            className="group flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm font-medium text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#F7931A]"
          >
            Đăng nhập ngay
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
