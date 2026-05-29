import { NextResponse } from 'next/server'
import { getAuthCookieOptions, TOKEN_NAME } from '@/lib/auth'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Đã đăng xuất' })
  response.cookies.set(TOKEN_NAME, '', getAuthCookieOptions(0))
  return response
}
