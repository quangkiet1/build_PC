import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { mapProductToBuilder } from '@/lib/catalog'
import { PCBuilder } from '@/app/components/PCBuilder'
import type { Product } from '@/app/types/builder'
import { getCurrentUser } from '@/lib/server-user'
<<<<<<< HEAD
=======
import Chatbot from '@/app/components/Chatbot-page'
>>>>>>> back_end

export default async function BuilderPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/?auth=required&next=/builder')
  }

  const products = await prisma.sanPham.findMany({
    include: { danhMuc: true },
    orderBy: [{ gia: 'asc' }]
  })

  const builderProducts = products
    .map(mapProductToBuilder)
    .filter((item): item is Product => item !== null)

<<<<<<< HEAD
  return <PCBuilder products={builderProducts} />
=======
  return (
    <>
      <PCBuilder products={builderProducts} />
      <Chatbot />
    </>
  )
>>>>>>> back_end
}
