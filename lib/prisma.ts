// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Next.js tự động nạp .env.local và .env
const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  console.error('❌ DATABASE_URL không được tìm thấy')
  console.error('Đảm bảo file .env.local có: DATABASE_URL="postgresql://user:1@localhost:5432/db"')
  throw new Error(
    'DATABASE_URL chưa được thiết lập. Kiểm tra file .env.local'
  )
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}