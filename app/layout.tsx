import type { Metadata } from 'next'
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
import { getI18nServer, getTranslator } from '@/i18n/server'
import { ChatbotWrapper } from '@/components/ChatbotWrapper'
import { ContentWrapper } from '@/components/ContentWrapper'
import { latoFont } from './fonts'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslator('metadata')

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { locale, messages } = await getI18nServer()

  return (
    <html
      lang={locale}
      className={`${latoFont.variable} dark h-full antialiased overflow-x-hidden`}
    >
      <body className="flex min-h-full flex-col bg-[#030304] font-sans text-white selection:bg-[#F7931A] selection:text-white overflow-x-hidden">
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
                  <ContentWrapper>
                    <PageTransition className="flex-1 min-h-screen">{children}</PageTransition>
                  </ContentWrapper>
                  <BackToTop />
                  <ChatbotWrapper />
                </CompareProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
