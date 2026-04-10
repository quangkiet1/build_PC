import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Đã đăng xuất' })
  response.headers.set('Set-Cookie', 'pcbuilder_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
  return response
}
