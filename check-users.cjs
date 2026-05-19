const { PrismaClient } = require('@prisma/client')
const p = new PrismaClient()
p.nguoiDung.findMany({ 
  select: { email: true, hoTen: true, vaiTro: true }, 
  take: 10 
}).then(u => { 
  console.log(JSON.stringify(u, null, 2))
  return p.$disconnect()
}).catch(e => { 
  console.error(e.message)
  return p.$disconnect()
})
