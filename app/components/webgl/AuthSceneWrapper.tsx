'use client'

import dynamic from 'next/dynamic'

const AuthScene = dynamic(
  () => import('./AuthScene').then((m) => ({ default: m.AuthScene })),
  { ssr: false }
)

export function AuthSceneWrapper() {
  return <AuthScene />
}
