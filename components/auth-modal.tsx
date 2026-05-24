'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Loader2, LogIn, Mail, ShieldCheck, Sparkles, UserPlus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/app/providers/toast-provider'

type AuthTab = 'login' | 'register'
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function AuthModal() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { addToast } = useToast()

  const authReason = searchParams.get('auth')
  const redirectTarget = searchParams.get('next') || '/'

  const [activeTab, setActiveTab] = useState<AuthTab>(authReason === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' })

  const isOpen = useMemo(
    () => authReason === 'required' || authReason === 'login' || authReason === 'register' || authReason === 'forbidden',
    [authReason]
  )

  useEffect(() => {
    if (authReason === 'register') {
      setActiveTab('register')
      setError(null)
      return
    }

    if (authReason === 'login' || authReason === 'required' || authReason === 'forbidden') {
      setActiveTab('login')
      setError(null)
    }
  }, [authReason])

  const closeModal = () => {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('auth')
    nextParams.delete('next')
    const nextQuery = nextParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
  }

  const validateLogin = () => {
    if (!loginForm.email.trim() || !loginForm.password) {
      return 'Vui lòng nhập đầy đủ email và mật khẩu'
    }

    if (!EMAIL_REGEX.test(loginForm.email.trim())) {
      return 'Email không đúng định dạng'
    }

    if (loginForm.password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    return null
  }

  const validateRegister = () => {
    if (!registerForm.name.trim() || !registerForm.email.trim() || !registerForm.password) {
      return 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu'
    }

    if (!EMAIL_REGEX.test(registerForm.email.trim())) {
      return 'Email không đúng định dạng'
    }

    if (registerForm.password.length < 6) {
      return 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    return null
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const validationError = validateLogin()
      if (validationError) {
        setError(validationError)
        return
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.email.trim(), password: loginForm.password })
      })
      const data = await response.json().catch(() => ({ error: 'Server trả về phản hồi không hợp lệ' }))

      if (!response.ok) {
        setError(data.error || 'Đăng nhập thất bại')
        return
      }

      window.dispatchEvent(new Event('auth-changed'))
      addToast(data.message || 'Đăng nhập thành công', 'success')
      router.replace(redirectTarget)
      router.refresh()
    } catch {
      setError('Không thể kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const validationError = validateRegister()
      if (validationError) {
        setError(validationError)
        return
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name.trim(),
          email: registerForm.email.trim(),
          password: registerForm.password
        })
      })
      const data = await response.json().catch(() => ({ error: 'Server trả về phản hồi không hợp lệ' }))

      if (!response.ok) {
        setError(data.error || 'Đăng ký thất bại')
        return
      }

      window.dispatchEvent(new Event('auth-changed'))
      addToast(data.message || 'Đăng ký thành công', 'success')
      router.replace(redirectTarget)
      router.refresh()
    } catch {
      setError('Không thể kết nối đến server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="max-w-4xl overflow-hidden border-white/10 bg-[#0F1115] p-0 text-slate-100 shadow-[0_30px_120px_rgba(0,0,0,0.7)]">
        <div className="grid md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden min-h-full overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(247,147,26,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,214,0,0.12),transparent_36%),linear-gradient(180deg,#111315,#060607)] p-8 md:flex md:flex-col md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F7931A]/25 bg-[#F7931A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#FFD600]">
                <Sparkles className="h-3.5 w-3.5" />
                Account Access
              </div>
              <h2 className="mt-6 text-3xl font-bold leading-tight text-white">
                {activeTab === 'login' ? 'Quay lại build và mua sắm ngay' : 'Tạo tài khoản và vào hệ thống ngay lập tức'}
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">
                {activeTab === 'login'
                  ? 'Đăng nhập để tiếp tục giỏ hàng, theo dõi đơn hàng và quay lại đúng trang bạn đang xem.'
                  : 'Đăng ký xong sẽ tự động đăng nhập, tạo sẵn trạng thái người dùng và quay lại đúng luồng trước đó.'}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />
                <div>
                  <div className="font-medium text-white">Không mất ngữ cảnh</div>
                  <div className="text-sm text-slate-400">Đăng nhập xong quay lại đúng trang sản phẩm, cart hoặc checkout flow hiện tại.</div>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#FFD600]" />
                <div>
                  <div className="font-medium text-white">Xác thực an toàn</div>
                  <div className="text-sm text-slate-400">Không lộ password, cookie auth được xử lý ở backend như hiện tại.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="text-2xl font-bold text-white">{activeTab === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}</DialogTitle>
              <DialogDescription className="text-slate-400">
            {authReason === 'required' && 'Bạn cần đăng nhập để tiếp tục tính năng này.'}
            {authReason === 'forbidden' && 'Bạn không có quyền truy cập khu vực này.'}
            {(authReason === 'login' || authReason === 'register' || authReason === null) &&
              'Đăng nhập hoặc tạo tài khoản để sử dụng đầy đủ tính năng.'}
              </DialogDescription>
            </DialogHeader>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#030304] p-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login')
              setError(null)
            }}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'login'
                ? 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_10px_30px_rgba(247,147,26,0.28)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register')
              setError(null)
            }}
            className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_10px_30px_rgba(247,147,26,0.28)]'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Sign up
            </span>
          </button>
        </div>

        {activeTab === 'login' ? (
          <form className="mt-6 space-y-4" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="email"
                  placeholder="ban@example.com"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="h-12 rounded-2xl border-white/10 bg-[#030304] pl-11 text-slate-100 transition focus:border-[#F7931A]/50 focus:ring-[#F7931A]/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Mật khẩu</label>
              <Input
                type="password"
                placeholder="Nhập mật khẩu"
                value={loginForm.password}
                onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                className="h-12 rounded-2xl border-white/10 bg-[#030304] text-slate-100 transition focus:border-[#F7931A]/50 focus:ring-[#F7931A]/20"
              />
            </div>
            <Button type="submit" className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_10px_30px_rgba(247,147,26,0.28)] hover:opacity-95" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đăng nhập'}
            </Button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleRegister}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Họ tên</label>
              <Input
                placeholder="Nguyễn Văn A"
                value={registerForm.name}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
                className="h-12 rounded-2xl border-white/10 bg-[#030304] text-slate-100 transition focus:border-[#F7931A]/50 focus:ring-[#F7931A]/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  type="email"
                  placeholder="ban@example.com"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                  className="h-12 rounded-2xl border-white/10 bg-[#030304] pl-11 text-slate-100 transition focus:border-[#F7931A]/50 focus:ring-[#F7931A]/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Mật khẩu</label>
              <Input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={registerForm.password}
                onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                className="h-12 rounded-2xl border-white/10 bg-[#030304] text-slate-100 transition focus:border-[#F7931A]/50 focus:ring-[#F7931A]/20"
              />
            </div>
            <Button type="submit" className="h-12 w-full rounded-2xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_10px_30px_rgba(247,147,26,0.28)] hover:opacity-95" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Đăng ký và đăng nhập ngay'}
            </Button>
          </form>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div className="mt-5 rounded-2xl border border-white/10 bg-[#030304] px-4 py-3 text-xs leading-6 text-slate-400">
          {activeTab === 'login'
            ? 'Sau khi đăng nhập thành công, hệ thống sẽ đưa bạn quay lại đúng trang trước đó nếu có.'
            : 'Sau khi đăng ký thành công, tài khoản sẽ được tự động đăng nhập mà không cần thao tác thêm.'}
        </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
