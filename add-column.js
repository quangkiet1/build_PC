const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Execute raw SQL to add the column
    await prisma.$executeRawUnsafe(`ALTER TABLE "san_pham" ADD COLUMN IF NOT EXISTS "phanTramGiam" INTEGER;`);
    console.log('✓ Column added successfully');
    
    // Verify the column exists
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'san_pham' AND column_name = 'phanTramGiam'
    `);
    
    if (result.length > 0) {
      console.log('✓ Column verified');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
