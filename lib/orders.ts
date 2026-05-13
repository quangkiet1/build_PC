const ALLOWED_PAYMENT_METHOD_SET = new Set(['COD', 'VNPAY', 'MOMO'])

export type OrderInput = {
  shippingAddress: string
  paymentMethod: string
}

export function validateOrderInput(input: OrderInput) {
  const shippingAddress = input.shippingAddress.trim()
  const paymentMethod = input.paymentMethod.trim().toUpperCase()

  if (shippingAddress.length < 10) {
    return { ok: false as const, error: 'Dia chi giao hang khong hop le' }
  }

  if (!ALLOWED_PAYMENT_METHOD_SET.has(paymentMethod)) {
    return { ok: false as const, error: 'Phuong thuc thanh toan khong hop le' }
  }

  return {
    ok: true as const,
    data: {
      shippingAddress,
      paymentMethod
    }
  }
}

export function createOrderCode(prefix: 'DH' | 'TT') {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}