import type { Metadata } from 'next'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import { Suspense } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { Toaster } from 'react-hot-toast'
import './globals.css'
import { ToastProvider } from './providers/toast-provider'
import { CartProvider } from './providers/cart-provider'
import { ToastContainer } from '@/components/toast-container'
import { Header } from '@/components/header'
import { CompareProvider } from '@/components/compare-provider'
import { AuthModal } from '@/components/AuthModal'
import { PageTransition } from '@/components/motion/PageTransition'
import { BackToTop } from '@/components/motion/BackToTop'
import { AuthProvider } from '@/context/AuthContext'
import { getI18nServer } from '@/i18n/server'

const inter = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-heading',
  subsets: ['latin'],
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'PC Builder - Xay dung cau hinh PC cua ban',
  description: 'Nen tang ban linh kien va xay dung cau hinh truc tuyen voi bo loc thong minh va kiem tra tuong thich',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { locale, messages } = await getI18nServer()

  return (
    <html lang={locale} className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-[#030304] font-sans text-white selection:bg-[#F7931A] selection:text-white">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <CompareProvider>
                  <Header />
                  <Suspense fallback={null}>
                    <AuthModal />
                  </Suspense>
                  <ToastContainer />
                  <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
                  <PageTransition className="flex-1">{children}</PageTransition>
                  <BackToTop />
                </CompareProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
