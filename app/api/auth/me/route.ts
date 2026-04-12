import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const user = await authenticateRequest(request)

  if (!user) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
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
