'use client'

import dynamic from 'next/dynamic'

const Chatbot = dynamic(() => import('@/app/components/Chatbot-page'), {
  ssr: false,
  loading: () => null,
})

export function ChatbotWrapper() {
  return <Chatbot />
}
