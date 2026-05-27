import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const authenticateRequestMock = vi.fn()
const xuLyTinNhanMock = vi.fn()
const createManyMock = vi.fn()

vi.mock('@/lib/auth', () => ({
  authenticateRequest: authenticateRequestMock,
}))

vi.mock('@/lib/chatbotController', () => ({
  xuLyTinNhan: xuLyTinNhanMock,
}))

vi.mock('@/lib/prisma', () => ({
  prisma: {
    tinNhanChat: {
      createMany: createManyMock,
    },
  },
}))

describe('chatbot network fallback', () => {
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  beforeEach(() => {
    authenticateRequestMock.mockReset()
    xuLyTinNhanMock.mockReset()
    createManyMock.mockReset()
    consoleErrorSpy.mockClear()
  })

  afterEach(() => {
    consoleErrorSpy.mockClear()
  })

  it('returns a friendly 500 response when the AI provider fails', async () => {
    authenticateRequestMock.mockResolvedValue({ id: 'user-1' })
    xuLyTinNhanMock.mockRejectedValue(new Error('Gemini upstream timeout'))

    const { POST } = await import('../app/api/ai/chat/route')
    const request = new Request('http://localhost/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: 'Build PC gaming 20 trieu',
        lichSuChat: [],
        keLinhKien: {},
      }),
    })

    const response = await POST(request as any)
    const body = await response.json()

    expect(response.status).toBe(500)
    expect(body.error).toContain('AI')
    expect(createManyMock).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
