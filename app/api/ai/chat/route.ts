import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'
import { checkBuildCompatibility } from '@/lib/build'
import { normalizeCategoryName } from '@/lib/catalog'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

type AIProduct = {
  id: string
  tenSanPham: string
  gia: number
  danhMuc?: { tenDanhMuc: string } | null
  thongSoKyThuat: unknown
}

function buildLocalRecommendation(prompt: string, products: AIProduct[]) {
  const budgetMatch = prompt.match(/(\d+[\.,]?\d*)\s*(trieu|m|000)/i)
  const budget = budgetMatch
    ? Number(budgetMatch[1].replace(',', '.')) * (budgetMatch[2].toLowerCase() === '000' ? 1000 : 1000000)
    : 25000000

  const picks: AIProduct[] = []
  const required = ['cpu', 'mainboard', 'ram', 'storage', 'psu']
  const optional = ['gpu']

  for (const category of [...required, ...optional]) {
    const candidate = products.find((product) => normalizeCategoryName(product.danhMuc?.tenDanhMuc) === category)
    if (candidate) picks.push(candidate)
  }

  let total = picks.reduce((sum, item) => sum + item.gia, 0)
  while (total > budget && picks.some((item) => normalizeCategoryName(item.danhMuc?.tenDanhMuc) === 'gpu')) {
    const index = picks.findIndex((item) => normalizeCategoryName(item.danhMuc?.tenDanhMuc) === 'gpu')
    if (index === -1) break
    picks.splice(index, 1)
    total = picks.reduce((sum, item) => sum + item.gia, 0)
  }

  const compatibility = checkBuildCompatibility(picks)
  const lines = picks
    .map((item) => `- ${item.danhMuc?.tenDanhMuc}: ${item.tenSanPham} (${item.gia.toLocaleString('vi-VN')} VND)`)
    .join('\n')

  return [
    `De xuat build theo ngan sach khoang ${budget.toLocaleString('vi-VN')} VND:`,
    lines,
    `Tong tam tinh: ${total.toLocaleString('vi-VN')} VND`,
    compatibility.valid
      ? 'Cau hinh hien tai khong phat hien loi tuong thich co ban.'
      : `Can dieu chinh: ${compatibility.errors.join('; ')}`
  ].join('\n\n')
}

export async function POST(request: NextRequest) {
  const user = await authenticateRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Can dang nhap de dung AI tu van' }, { status: 401 })
  }

  const body = await request.json()
  const prompt = body.prompt?.trim()
  if (!prompt) {
    return NextResponse.json({ error: 'Yeu cau tu van khong duoc de trong' }, { status: 400 })
  }

  const products = await prisma.sanPham.findMany({
    include: { danhMuc: true },
    orderBy: [{ soLuongTon: 'desc' }, { createdAt: 'desc' }],
    take: 24
  })

  const productSummary = products
    .map(
      (product) =>
        `- ${product.tenSanPham} | ${product.danhMuc?.tenDanhMuc || 'Khac'} | ${product.gia.toLocaleString('vi-VN')} VND`
    )
    .join('\n')

  let message = buildLocalRecommendation(prompt, products)

  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'Ban la AI tu van build PC. Chi de xuat cau hinh tu danh sach san pham da cho va luon nhac ve tuong thich CPU-mainboard, RAM-mainboard, GPU-PSU.'
            },
            {
              role: 'user',
              content: `Danh sach san pham:\n${productSummary}\n\nYeu cau: ${prompt}\n\nTra loi bang tieng Viet ngan gon, co tong gia du kien va ghi chu tuong thich.`
            }
          ],
          temperature: 0.6,
          max_tokens: 500
        })
      })

      const data = await response.json()
      message = data?.choices?.[0]?.message?.content || message
    } catch {
      message = `${message}\n\nLuu y: Da su dung bo de xuat noi bo vi khong goi duoc AI provider.`
    }
  }

  await prisma.tinNhanChat.createMany({
    data: [
      { noiDung: prompt, vaiTro: 'USER', nguoiDungId: user.id },
      { noiDung: message, vaiTro: 'AI', nguoiDungId: user.id }
    ]
  })

  return NextResponse.json({ message })
}
