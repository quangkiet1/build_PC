const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = 'huynhkietzuki@gmail.com'
  const newPassword = 'Admin@2026'

  const hash = await bcrypt.hash(newPassword, 10)

  const user = await prisma.nguoiDung.update({
    where: { email: adminEmail },
    data: { matKhauHash: hash },
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
