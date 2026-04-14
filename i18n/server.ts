import { cookies } from 'next/headers'
import { createTranslator } from 'next-intl'
import { DEFAULT_LOCALE, isValidLocale, LOCALE_COOKIE_NAME } from '@/i18n/config'
import { getMessages, type Messages } from '@/i18n/messages'

type MessageNamespace = keyof Messages

async function getRequestLocale() {
  const cookieStore = await cookies()
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value

  if (isValidLocale(locale)) {
    return locale
  }

  return DEFAULT_LOCALE
}

export async function getI18nServer() {
  const locale = await getRequestLocale()
  const messages = await getMessages(locale)

  return { locale, messages }
}

export async function getTranslator(namespace?: MessageNamespace) {
  const { locale, messages } = await getI18nServer()

  if (namespace) {
    return createTranslator({
      locale,
      messages,
      namespace,
    })
  }

  return createTranslator({
    locale,
    messages,
  })
}