import type { AppLocale } from '@/i18n/config'

export type Messages = typeof import('@/messages/vi.json')

export async function getMessages(locale: AppLocale) {
  switch (locale) {
    case 'en':
      return (await import('@/messages/en.json')).default
    case 'vi':
    default:
      return (await import('@/messages/vi.json')).default
  }
}