import { NextRequest, NextResponse } from 'next/server'
import { recommendBuild } from '@/lib/recommendations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as {
      purpose?: string
      budget?: number
      selectedProductIds?: string[]
    }

    const recommendation = await recommendBuild({
      purpose: body.purpose,
      budget: body.budget,
      selectedProductIds: Array.isArray(body.selectedProductIds) ? body.selectedProductIds : [],
    })

    return NextResponse.json({ recommendation })
  } catch (error) {
    console.error('POST /api/recommendations/build:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
