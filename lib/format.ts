import type { AppLocale } from '@/i18n/config'

export function toIntlLocale(locale: AppLocale) {
  return locale === 'vi' ? 'vi-VN' : 'en-US'
}

export function formatCurrency(value: number, locale: AppLocale) {
  return new Intl.NumberFormat(toIntlLocale(locale), {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string | Date, locale: AppLocale) {
  return new Intl.DateTimeFormat(toIntlLocale(locale), {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(typeof value === 'string' ? new Date(value) : value)
}