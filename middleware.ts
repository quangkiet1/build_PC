import { NextRequest, NextResponse } from 'next/server'

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null

    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

function redirectWithAuthReason(request: NextRequest, reason: 'required' | 'forbidden') {
  const url = request.nextUrl.clone()
  if (reason === 'forbidden') {
    url.pathname = '/'
    url.searchParams.set('auth', 'forbidden')
  } else {
    url.pathname = '/login'
    url.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  }
  return NextResponse.redirect(url)
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('pcbuilder_token')?.value

  if (!token) {
    return redirectWithAuthReason(request, 'required')
  }

  const payload = decodeJwtPayload(token)
  if (!payload || typeof payload.sub !== 'string') {
    return redirectWithAuthReason(request, 'required')
  }

  if (request.nextUrl.pathname.startsWith('/admin')) {
    const role = payload.role
    if (role !== 'QUAN_TRI_VIEN') {
      return redirectWithAuthReason(request, 'forbidden')
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*']
}
