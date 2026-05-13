import { describe, expect, it } from 'vitest'
import { createOrderCode, validateOrderInput } from '../lib/orders'

describe('order validation', () => {
  it('validates address and payment method', () => {
    expect(validateOrderInput({ shippingAddress: 'short', paymentMethod: 'COD' }).ok).toBe(false)
    expect(validateOrderInput({ shippingAddress: '123 duong abc, quan 1', paymentMethod: 'cash' }).ok).toBe(false)
    expect(validateOrderInput({ shippingAddress: '123 duong abc, quan 1', paymentMethod: 'momo' }).ok).toBe(true)
  })

  it('creates prefixed order codes', () => {
    expect(createOrderCode('DH')).toMatch(/^DH-/)
    expect(createOrderCode('TT')).toMatch(/^TT-/)
  })
})