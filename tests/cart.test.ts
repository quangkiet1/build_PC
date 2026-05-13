import { describe, expect, it } from 'vitest'
import { MAX_CART_QUANTITY, parseCartQuantity, validateDesiredQuantity } from '../lib/cart'

describe('cart validation', () => {
  it('rejects invalid quantities', () => {
    expect(parseCartQuantity(0)).toBeNull()
    expect(parseCartQuantity(-1)).toBeNull()
    expect(parseCartQuantity(1.5)).toBeNull()
    expect(parseCartQuantity(MAX_CART_QUANTITY + 1)).toBeNull()
  })

  it('accepts valid integer quantities', () => {
    expect(parseCartQuantity(1)).toBe(1)
    expect(parseCartQuantity('5')).toBe(5)
  })

  it('fails when desired quantity exceeds stock', () => {
    const result = validateDesiredQuantity(3, 4)

    expect(result.ok).toBe(false)
  })
})