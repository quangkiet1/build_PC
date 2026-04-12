import { prisma } from '@/lib/prisma'
import { mapProductToBuilder } from '@/lib/catalog'
import { PCBuilder } from '@/app/components/PCBuilder'
import type { Product } from '@/app/types/builder'

export default async function BuilderPage() {
  const products = await prisma.sanPham.findMany({
    include: { danhMuc: true },
    orderBy: [{ gia: 'asc' }]
  })

  const builderProducts = products
    .map(mapProductToBuilder)
    .filter((item): item is Product => item !== null)

  return <PCBuilder products={builderProducts} />
}
