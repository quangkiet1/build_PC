import { Lato } from 'next/font/google'

export const latoFont = Lato({
  weight: ['100', '300', '400', '700', '900'],
  style: ['normal', 'italic'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-lato',
  fallback: ['Arial', 'Helvetica', 'sans-serif'],
})
