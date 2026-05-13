export const MAX_CART_QUANTITY = 99

export function parseCartQuantity(input: unknown): number | null {
  const value = typeof input === 'string' && input.trim() === '' ? Number.NaN : Number(input)

  if (!Number.isInteger(value) || value < 1 || value > MAX_CART_QUANTITY) {
    return null
  }

  return value
}

export function validateDesiredQuantity(stock: number, desiredQuantity: number) {
  if (desiredQuantity > stock) {
    return {
      ok: false as const,
      error: `So luong vuot qua ton kho hien co (${stock})`
    }
  }

  return { ok: true as const }
}