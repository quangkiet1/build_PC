'use client'

import dynamic from 'next/dynamic'

const Hero3DNoSsr = dynamic(() => import('./Hero3D').then((mod) => mod.Hero3D), {
  ssr: false,
  loading: () => null,
})

export function Hero3DWrapper() {
  return <Hero3DNoSsr />
}
