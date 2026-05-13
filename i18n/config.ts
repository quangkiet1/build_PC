export const LOCALES = ['vi', 'en'] as const
export type AppLocale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'vi'
export const LOCALE_COOKIE_NAME = 'pc-builder-locale'

export function isValidLocale(value: string | null | undefined): value is AppLocale {
  return Boolean(value && LOCALES.includes(value as AppLocale))
}
