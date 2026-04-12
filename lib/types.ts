import { Prisma } from '@prisma/client'

export type ProductSpecs = Prisma.JsonObject

export function isJsonObject(
  value: Prisma.JsonValue | null | undefined
): value is Prisma.JsonObject {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function readSpecString(
  specs: Prisma.JsonValue | null | undefined,
  ...keys: string[]
) {
  if (!isJsonObject(specs)) return undefined

  for (const key of keys) {
    const value = specs[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number') return String(value)
  }

  return undefined
}

export function readSpecNumber(
  specs: Prisma.JsonValue | null | undefined,
  ...keys: string[]
) {
  const raw = readSpecString(specs, ...keys)
  if (!raw) return undefined

  const normalized = raw.replace(/,/g, '.')
  const match = normalized.match(/-?\d+(\.\d+)?/)
  if (!match) return undefined

  return Number(match[0])
}
