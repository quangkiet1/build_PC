const fs = require('fs');
let content = fs.readFileSync('prisma/seed.ts', 'utf8');

const targetStr = '// Tạo user admin';
const adminIndex = content.lastIndexOf(targetStr);
if (adminIndex !== -1) {
  // Find the closing brace of main just before this index
  const mainClosingBraceIndex = content.lastIndexOf('}', adminIndex);
  
  if (mainClosingBraceIndex !== -1) {
    const adminLogic = `
  // Tạo user admin nếu chưa tồn tại, rồi cập nhật vai trò
  const adminEmail = 'huynhkietzuki@gmail.com'
  const existingAdmin = await prisma.nguoiDung.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    await prisma.nguoiDung.create({
      data: {
        hoTen: 'Admin User',
        email: adminEmail,
        matKhauHash: '$2a$10$dummyhashfortestingonly',
        vaiTro: VaiTro.QUAN_TRI_VIEN
      }
    })
    console.log(\`✅ Created admin user: \${adminEmail}\`)
  } else {
    await prisma.nguoiDung.update({
      where: { email: adminEmail },
      data: { vaiTro: VaiTro.QUAN_TRI_VIEN }
    })
    console.log(\`✅ Updated admin role: \${adminEmail}\`)
  }
`;

    const endCodeStr = `
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
`;

    content = content.substring(0, mainClosingBraceIndex) + adminLogic + '\n}\n' + endCodeStr;

    // Fix the counts
    content = content.replace(/console\.log\('   - 51 CPU'\)/, "console.log('   - 45 CPU')");
    content = content.replace(/console\.log\('   - 32 RAM'\)/, "console.log('   - 14 RAM')");
    content = content.replace(/console\.log\('   - 34 Storage'\)/, "console.log('   - 14 Storage')");
    content = content.replace(/console\.log\('   - 40 Motherboard'\)/, "console.log('   - 14 Motherboard')");
    content = content.replace(/console\.log\('   = 170 sản phẩm'\)/, "console.log('   = 100 sản phẩm')");

    fs.writeFileSync('prisma/seed.ts', content, 'utf8');
    console.log('Fixed successfully.');
  }
} else {
  console.log('Could not find the target string');
}
