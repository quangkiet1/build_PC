'use client'

import { Languages } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { LOCALE_COOKIE_NAME, type AppLocale } from '@/i18n/config'

const AVAILABLE_LOCALES: AppLocale[] = ['vi', 'en']

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale
  const router = useRouter()
  const t = useTranslations('languageSwitcher')
  const [isPending, startTransition] = useTransition()

  const handleChangeLocale = (nextLocale: AppLocale) => {
    if (nextLocale === locale) {
      return
    }

    document.cookie = `${LOCALE_COOKIE_NAME}=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    window.localStorage.setItem(LOCALE_COOKIE_NAME, nextLocale)

    startTransition(() => {
      router.refresh()
    })
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-xl border border-[#27314a] bg-[#101726] px-2 py-1.5 text-xs text-slate-300">
      <Languages className="h-3.5 w-3.5 text-sky-300" />
      <span className="sr-only">{t('label')}</span>
      {AVAILABLE_LOCALES.map((item, index) => (
        <button
          key={item}
          type="button"
          onClick={() => handleChangeLocale(item)}
          disabled={isPending}
          className={`rounded-lg px-2.5 py-1 font-semibold uppercase transition ${
            locale === item ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:bg-white/5 hover:text-white'
          } ${isPending ? 'cursor-not-allowed opacity-60' : ''}`}
        >
          {t(item)}
          {index === 0 && <span className="mx-2 text-slate-600">|</span>}
        </button>
      ))}
    </div>
  )
}