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

  // Reset user@example.com password
  const userPass = 'User@123'
  const userHash = await bcrypt.hash(userPass, 10)
  const user = await p.nguoiDung.update({
    where: { email: 'user@example.com' },
    data: { matKhauHash: userHash }
  })
  console.log('✅ User:', user.email, '| Pass:', userPass)

  // List all users
  const all = await p.nguoiDung.findMany({ select: { email: true, hoTen: true, vaiTro: true } })
  console.log('\n📋 Tất cả users:')
  all.forEach(u => console.log(' -', u.email, '|', u.vaiTro))
}

main()
  .catch(e => console.error('❌ Lỗi:', e.message))
  .finally(() => p.$disconnect())
