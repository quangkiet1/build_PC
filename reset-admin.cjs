const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'admin@pcbuilder.com'
  const newPassword = 'Admin@123'

  const hash = await bcrypt.hash(newPassword, 10)

  const user = await prisma.nguoiDung.upsert({
    where: { email: adminEmail },
    update: { matKhauHash: hash, vaiTro: 'QUAN_TRI_VIEN', hoTen: 'Admin' },
    create: {
      email: adminEmail,
      hoTen: 'Admin',
      matKhauHash: hash,
      vaiTro: 'QUAN_TRI_VIEN',
    },
  })

  await prisma.gioHang.upsert({
    where: { nguoiDungId: user.id },
    update: {},
    create: { nguoiDungId: user.id },
  })

  console.log(`✅ Đặt lại mật khẩu thành công cho: ${user.email}`)
  console.log(`   Vai trò: ${user.vaiTro}`)
  console.log(`   Mật khẩu mới: ${newPassword}`)
}

main()
  .catch((e) => {
    console.error('❌ Lỗi:', e.message)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
