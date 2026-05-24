'use client'

import { Languages } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LOCALE_COOKIE_NAME, type AppLocale } from '@/i18n/config'

const AVAILABLE_LOCALES: AppLocale[] = ['vi', 'en']

const persistLocale = (nextLocale: AppLocale) => {
  document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`
  window.localStorage.setItem(LOCALE_COOKIE_NAME, nextLocale)
}

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const t = useTranslations('languageSwitcher')
  const [isPending, startTransition] = useTransition()

  const handleChangeLocale = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      return
    }

    persistLocale(nextLocale)

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-[#CBD5E1] shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
      <Languages className="h-3.5 w-3.5 text-[#FFD600]" />
      <span className="sr-only">{t('label')}</span>
      {AVAILABLE_LOCALES.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => handleChangeLocale(item)}
          disabled={isPending}
          className={`rounded-full px-2.5 py-1 font-semibold uppercase transition ${
            locale === item ? 'bg-[#F7931A] text-white shadow-[0_0_16px_rgba(247,147,26,0.28)]' : 'text-[#CBD5E1] hover:bg-[#F7931A]/10 hover:text-[#FFD600]'
          } ${isPending ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {t(item)}
        </button>
      ))}
    </div>
  )
}
