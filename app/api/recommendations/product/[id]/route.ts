import { NextRequest, NextResponse } from 'next/server'
import { getSimilarProducts } from '@/lib/recommendations'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params
  const limit = Number(request.nextUrl.searchParams.get('limit') || 4)
  const result = await getSimilarProducts(id, Math.min(Math.max(limit, 1), 12))

  if (!result) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  }

  return NextResponse.json({
    productId: result.product.id,
    recommendations: result.recommendations,
  })
}
