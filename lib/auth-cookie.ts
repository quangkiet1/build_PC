export const TOKEN_NAME = 'pcbuilder_token'
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7

type AuthCookieRequest = Pick<Request, 'headers' | 'url'>

function getRequestUrl(request?: AuthCookieRequest) {
  if (!request?.url) return null

  try {
    return new URL(request.url)
  } catch {
    return null
  }
}

function getForwardedProtocol(request?: AuthCookieRequest) {
  return request?.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    ?.trim()
    .toLowerCase()
}

function isLocalhost(hostname: string) {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]' || hostname === '::1'
}

export function shouldUseSecureAuthCookie(request?: AuthCookieRequest) {
  if (process.env.NODE_ENV !== 'production') return false

  const requestUrl = getRequestUrl(request)
  if (requestUrl && isLocalhost(requestUrl.hostname)) return false

  const forwardedProtocol = getForwardedProtocol(request)
  if (forwardedProtocol) return forwardedProtocol === 'https'

  if (requestUrl) return requestUrl.protocol === 'https:'

  return true
}

export function createAuthCookie(token: string, request?: AuthCookieRequest) {
  const secure = shouldUseSecureAuthCookie(request) ? '; Secure' : ''
  return `${TOKEN_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${AUTH_COOKIE_MAX_AGE}${secure}`
}

export function clearAuthCookie(request?: AuthCookieRequest) {
  const secure = shouldUseSecureAuthCookie(request) ? '; Secure' : ''
  return `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`
}

export function getAuthCookieOptions(maxAge = AUTH_COOKIE_MAX_AGE, request?: AuthCookieRequest) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: shouldUseSecureAuthCookie(request),
    path: '/',
    maxAge,
  }
}
