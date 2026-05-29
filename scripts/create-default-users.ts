import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upsertUser(params: {
  email: string
  fullName: string
  role: 'QUAN_TRI_VIEN' | 'KHACH_HANG'
  rawPassword: string
}) {
  const passwordHash = await bcrypt.hash(params.rawPassword, 10)

  const user = await prisma.nguoiDung.upsert({
    where: { email: params.email },
    update: {
      hoTen: params.fullName,
      vaiTro: params.role,
      matKhauHash: passwordHash
    },
    create: {
      hoTen: params.fullName,
      email: params.email,
      vaiTro: params.role,
      matKhauHash: passwordHash
    }
  })

  await prisma.gioHang.upsert({
    where: { nguoiDungId: user.id },
    update: {},
    create: { nguoiDungId: user.id }
  })

  return user
}

async function main() {
  console.log('Creating default accounts...')

  const admin = await upsertUser({
    email: 'admin@pcbuilder.com',
    fullName: 'Admin',
    role: 'QUAN_TRI_VIEN',
    rawPassword: 'Admin@123'
  })

  const user = await upsertUser({
    email: 'user@example.com',
    fullName: 'Demo User',
    role: 'KHACH_HANG',
    rawPassword: 'User@123'
  })

  console.log('Done.')
  console.log(`Admin account: ${admin.email} (role: ${admin.vaiTro})`)
  console.log(`User account: ${user.email} (role: ${user.vaiTro})`)
}

main()
  .catch((error) => {
    console.error('Failed to create default accounts:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
