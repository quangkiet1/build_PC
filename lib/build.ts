import { prisma } from '@/lib/prisma'
import { readSpecNumber, readSpecString } from '@/lib/types'

export type BuildItemInput = {
  productId: string
  quantity: number
}

export type CompatibilityResult = {
  valid: boolean
  errors: string[]
  warnings: string[]
}

type BuildProduct = {
  thongSoKyThuat?: unknown
  danhMuc?: { tenDanhMuc?: string | null } | null
}

export function buildTotal(items: Array<{ price: number; quantity: number }>) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0)
}

export function checkBuildCompatibility(products: BuildProduct[]): CompatibilityResult {
  const errors: string[] = []
  const warnings: string[] = []
  const findCategory = (name: string) =>
    products.find((item) => item.danhMuc?.tenDanhMuc?.toLowerCase().includes(name))

  const cpu = findCategory('cpu')
  const motherboard = findCategory('mainboard') || findCategory('motherboard')
  const ram = findCategory('ram')
  const gpu = findCategory('gpu')
  const psu = findCategory('psu')

  const cpuSocket = readSpecString(cpu?.thongSoKyThuat as never, 'socket')
  const boardSocket = readSpecString(motherboard?.thongSoKyThuat as never, 'socket')
  if (cpu && motherboard && cpuSocket && boardSocket && cpuSocket !== boardSocket) {
    errors.push(`CPU va mainboard khong tuong thich: ${cpuSocket} != ${boardSocket}`)
  }

  const ramType = readSpecString(ram?.thongSoKyThuat as never, 'ram_type', 'type', 'memoryType', 'memory')
  const boardRamType = readSpecString(
    motherboard?.thongSoKyThuat as never,
    'ram_type',
    'memoryType',
    'memory'
  )
  if (ram && motherboard && ramType && boardRamType && ramType.toUpperCase() !== boardRamType.toUpperCase()) {
    errors.push(`RAM va mainboard khong tuong thich: ${ramType} != ${boardRamType}`)
  }

  const cpuPower = readSpecNumber(cpu?.thongSoKyThuat as never, 'tdp', 'watt') || 0
  const gpuPower = readSpecNumber(gpu?.thongSoKyThuat as never, 'tdp', 'tgp', 'watt') || 0
  const psuPower = readSpecNumber(psu?.thongSoKyThuat as never, 'wattage', 'watt') || 0
  const requiredPower = cpuPower + gpuPower + 150

  if (gpu && psu && gpuPower && psuPower && requiredPower > psuPower) {
    errors.push(`PSU khong du cong suat: can ${requiredPower}W, hien tai ${psuPower}W`)
  } else if (gpu && psu && psuPower && requiredPower + 100 > psuPower) {
    warnings.push(`PSU du dung nhung headroom thap. Nen tu ${requiredPower + 100}W`)
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

export async function loadProductsByIds(ids: string[]) {
  return prisma.sanPham.findMany({
    where: { id: { in: ids } },
    include: { danhMuc: true }
  })
}
