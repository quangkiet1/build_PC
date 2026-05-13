import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { DEFAULT_LOCALE, isValidLocale, LOCALE_COOKIE_NAME } from '@/i18n/config'
import { getMessages } from '@/i18n/messages'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const requestedLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value
  const locale = isValidLocale(requestedLocale) ? requestedLocale : DEFAULT_LOCALE

  return {
    locale,
    messages: await getMessages(locale),
  }
})