export type CategoryMessageKey =
  | 'cpu'
  | 'mainboard'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'psu'
  | 'case'
  | 'cooling'
  | 'monitor'
  | 'prebuilt'
  | 'accessories'

function normalizeCategory(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function getCategoryMessageKey(categoryName?: string | null): CategoryMessageKey | null {
  const value = normalizeCategory(categoryName || '')

  if (value.includes('cpu') || value.includes('processor') || value.includes('bo xu ly')) return 'cpu'
  if (value.includes('mainboard') || value.includes('motherboard') || value.includes('bo mach')) return 'mainboard'
  if (value.includes('ram')) return 'ram'
  if (value.includes('gpu') || value.includes('card do hoa') || value.includes('vga')) return 'gpu'
  if (value.includes('storage') || value.includes('o cung') || value.includes('ssd') || value.includes('hdd')) return 'storage'
  if (value.includes('psu') || value.includes('nguon')) return 'psu'
  if (value.includes('case') || value.includes('vo may')) return 'case'
  if (value.includes('cool') || value.includes('tan nhiet') || value.includes('fan')) return 'cooling'
  if (value.includes('monitor') || value.includes('man hinh')) return 'monitor'
  if (value.includes('prebuilt') || value.includes('pc lap san') || value.includes('may bo')) return 'prebuilt'
  if (value.includes('accessor') || value.includes('phu kien')) return 'accessories'

  return null
}
