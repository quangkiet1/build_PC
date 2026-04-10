import { prisma } from '@/lib/prisma'

export type BuildItemInput = {
  productId: string
  quantity: number
}

export type CompatibilityResult = {
  valid: boolean
  errors: string[]
}

export function buildTotal(items: Array<{ price: number; quantity: number }>) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function checkBuildCompatibility(products: Array<{ thongSoKyThuat?: any; danhMuc?: { tenDanhMuc?: string } }>): CompatibilityResult {
  const errors: string[] = []
  const findCategory = (name: string) =>
    products.find((item) => item.danhMuc?.tenDanhMuc?.toLowerCase().includes(name))

  const cpu = findCategory('cpu')
  const motherboard = findCategory('mainboard') || findCategory('motherboard')
  const ram = findCategory('ram')
  const gpu = findCategory('gpu')
  const psu = findCategory('psu')

  const socketCpu = cpu?.thongSoKyThuat?.socket
  const socketMb = motherboard?.thongSoKyThuat?.socket
  if (cpu && motherboard && socketCpu && socketMb && socketCpu !== socketMb) {
    errors.push(`CPU và Mainboard không tương thích: ${socketCpu} ≠ ${socketMb}`)
  }

  const ramType = ram?.thongSoKyThuat?.ram_type || ram?.thongSoKyThuat?.memoryType
  const mbRamType = motherboard?.thongSoKyThuat?.ram_type || motherboard?.thongSoKyThuat?.memoryType
  if (ram && motherboard && ramType && mbRamType && ramType !== mbRamType) {
    errors.push(`RAM và Mainboard không tương thích: ${ramType} ≠ ${mbRamType}`)
  }

  const gpuWatt = Number(gpu?.thongSoKyThuat?.tdp || gpu?.thongSoKyThuat?.watt || 0)
  const psuWatt = Number(psu?.thongSoKyThuat?.tdp || psu?.thongSoKyThuat?.watt || 0)
  if (gpu && psu && gpuWatt && psuWatt && gpuWatt + 150 > psuWatt) {
    errors.push(`PSU có thể không đủ cho GPU: cần ${gpuWatt + 150}W, hiện tại ${psuWatt}W`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export async function loadProductsByIds(ids: string[]) {
  return prisma.sanPham.findMany({
    where: { id: { in: ids } },
    include: { danhMuc: true }
  })
}
