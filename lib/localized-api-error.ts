export function getLocalizedApiError(data: unknown, locale: string, fallback: string) {
  if (locale !== 'vi' || !data || typeof data !== 'object') {
    return fallback
  }

  const error = 'error' in data ? data.error : null
  return typeof error === 'string' && error.trim() ? error : fallback
}
