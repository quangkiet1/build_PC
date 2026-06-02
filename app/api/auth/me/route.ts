import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest, getAuthCookieOptions, TOKEN_NAME } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request)

  if (!user) {
    const response = NextResponse.json({ authenticated: false, user: null }, { status: 401 })
    response.cookies.set(TOKEN_NAME, '', getAuthCookieOptions(0, request))
    return response
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      name: user.hoTen,
      email: user.email,
      role: user.vaiTro
    }
  })
}
