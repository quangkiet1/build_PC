import type { Metadata } from 'next'
import { Suspense } from 'react'
import '../globals.css'

export const metadata: Metadata = {
  title: 'PC Builder - Đăng nhập / Đăng ký',
  description: 'Đăng nhập hoặc tạo tài khoản PC Builder để bắt đầu xây dựng cấu hình PC của bạn.',
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#030304] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F7931A]/30 border-t-[#F7931A]" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}
