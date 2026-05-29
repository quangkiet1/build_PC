const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const p = new PrismaClient()

async function main() {
  const password = 'Admin@123'
  const hash = await bcrypt.hash(password, 10)

  // Upsert admin
  const admin = await p.nguoiDung.upsert({
    where: { email: 'admin@pcbuilder.com' },
    update: { matKhauHash: hash, vaiTro: 'QUAN_TRI_VIEN', hoTen: 'Admin' },
    create: {
      email: 'admin@pcbuilder.com',
      hoTen: 'Admin',
      matKhauHash: hash,
      vaiTro: 'QUAN_TRI_VIEN',
    }
  })
  console.log('✅ Admin:', admin.email, '| Pass:', password)

  // Upsert demo customer
  const userPass = 'User@123'
  const userHash = await bcrypt.hash(userPass, 10)
  const user = await p.nguoiDung.upsert({
    where: { email: 'user@example.com' },
    update: { matKhauHash: userHash, vaiTro: 'KHACH_HANG', hoTen: 'Demo User' },
    create: {
      email: 'user@example.com',
      hoTen: 'Demo User',
      matKhauHash: userHash,
      vaiTro: 'KHACH_HANG',
    }
  })
  console.log('✅ User:', user.email, '| Pass:', userPass)

  await Promise.all([admin, user].map((account) =>
    p.gioHang.upsert({
      where: { nguoiDungId: account.id },
      update: {},
      create: { nguoiDungId: account.id },
    })
  ))

  // List all users
  const all = await p.nguoiDung.findMany({ select: { email: true, hoTen: true, vaiTro: true } })
  console.log('\n📋 Tất cả users:')
  all.forEach(u => console.log(' -', u.email, '|', u.vaiTro))
}

main()
  .catch(e => console.error('❌ Lỗi:', e.message))
  .finally(() => p.$disconnect())
