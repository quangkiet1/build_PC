import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslator } from '@/i18n/server'
import '../globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator('auth')

  return {
    title: t('metadata.title'),
    description: t('metadata.description'),
  }
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
