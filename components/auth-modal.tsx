'use client'

import { FormEvent, useMemo, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

type AuthTab = 'login' | 'register'

export function AuthModal() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const authReason = searchParams.get('auth')
  const redirectTarget = searchParams.get('next') || '/'

  const [activeTab, setActiveTab] = useState<AuthTab>(authReason === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ name: '', username: '', password: '' })

  const isOpen = useMemo(
    () => authReason === 'required' || authReason === 'login' || authReason === 'register' || authReason === 'forbidden',
    [authReason]
  )

  const closeModal = () => {
    const nextParams = new URLSearchParams(searchParams.toString())
    nextParams.delete('auth')
    nextParams.delete('next')
    const nextQuery = nextParams.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginForm.username.trim(), password: loginForm.password })
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Đăng nhập thất bại')
        return
      }

      window.dispatchEvent(new Event('auth-changed'))
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.name.trim(),
          email: registerForm.username.trim(),
          password: registerForm.password
        })
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Đăng ký thất bại')
        return
      }

      window.dispatchEvent(new Event('auth-changed'))
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
      <DialogContent className="max-w-md border-slate-700 bg-[#0f1117] text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">Đăng nhập tài khoản</DialogTitle>
          <DialogDescription className="text-slate-400">
            {authReason === 'required' && 'Bạn cần đăng nhập để tiếp tục tính năng này.'}
            {authReason === 'forbidden' && 'Bạn không có quyền truy cập khu vực này.'}
            {(authReason === 'login' || authReason === 'register' || authReason === null) &&
              'Đăng nhập hoặc tạo tài khoản để sử dụng đầy đủ tính năng.'}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-xs text-indigo-200">
          Tài khoản mẫu: admin_Kiet / 1 (admin), phuc / 1 (user)
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg border border-slate-700 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              activeTab === 'login' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
              activeTab === 'register' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {activeTab === 'login' ? (
          <form className="space-y-3" onSubmit={handleLogin}>
            <Input
              placeholder="Tên đăng nhập"
              value={loginForm.username}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, username: event.target.value }))}
              className="border-slate-700 bg-slate-900 text-slate-100"
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={loginForm.password}
              onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
              className="border-slate-700 bg-slate-900 text-slate-100"
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </Button>
          </form>
        ) : (
          <form className="space-y-3" onSubmit={handleRegister}>
            <Input
              placeholder="Họ tên"
              value={registerForm.name}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
              className="border-slate-700 bg-slate-900 text-slate-100"
            />
            <Input
              placeholder="Tên đăng nhập"
              value={registerForm.username}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, username: event.target.value }))}
              className="border-slate-700 bg-slate-900 text-slate-100"
            />
            <Input
              type="password"
              placeholder="Mật khẩu"
              value={registerForm.password}
              onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
              className="border-slate-700 bg-slate-900 text-slate-100"
            />
            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </Button>
          </form>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </DialogContent>
    </Dialog>
  )
}
