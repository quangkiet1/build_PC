import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Cần đăng nhập để dùng AI tư vấn' }, { status: 401 })
  }

  const body = await request.json()
  const { prompt } = body
  if (!prompt) {
    return NextResponse.json({ error: 'Yêu cầu tư vấn không được để trống' }, { status: 400 })
  }

  const products = await prisma.sanPham.findMany({ include: { danhMuc: true }, take: 8 })
  const productSummary = products
    .map((product) => `• ${product.tenSanPham} (${product.danhMuc?.tenDanhMuc || 'Chung'}) - ${product.gia.toLocaleString('vi-VN')} ₫`) 
    .join('\n')

  const systemPrompt = `Bạn là trợ lý AI cho website bán linh kiện PC. Dựa vào danh sách sản phẩm hiện có và yêu cầu người dùng, hãy gợi ý cấu hình build PC phù hợp.`
  const userPrompt = `Danh sách sản phẩm hiện có:\n${productSummary}\n\nYêu cầu người dùng: ${prompt}\n\nHãy trả về cấu hình đề xuất gồm CPU, Mainboard, RAM, GPU, Storage, PSU và bình luận về tương thích.`

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY chưa được thiết lập trên server' }, { status: 500 })
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 450
    })
  })

  const data = await response.json()
  const message = data?.choices?.[0]?.message?.content || 'Không thể tạo tư vấn tại thời điểm này.'

  return NextResponse.json({ message })
}
