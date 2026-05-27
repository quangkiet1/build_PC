import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Product } from '../app/types/builder'

const layTop3LinhKienMock = vi.fn()

vi.mock('../lib/chatbotModel', () => ({
  layTop3LinhKien: layTop3LinhKienMock,
}))

describe('chatbot budget guard', () => {
  beforeEach(() => {
    layTop3LinhKienMock.mockReset()
  })

  it('blocks shopping flow when remaining budget is negative', async () => {
    const existingCpu: Product = {
      id: 'cpu-existing',
      name: 'Intel Core i7 Demo',
      brand: 'Intel',
      category: 'cpu',
      price: 12000000,
      image: '/images/1.jpg',
      rating: 5,
      socket: 'LGA1700',
      tdp: 125,
    }

    const suggestedGpu: Product = {
      id: 'gpu-demo',
      name: 'RTX 4060 Demo',
      brand: 'NVIDIA',
      category: 'gpu',
      price: 9000000,
      image: '/images/46.jpg',
      rating: 5,
      tdp: 115,
    }

    layTop3LinhKienMock.mockResolvedValue([suggestedGpu])

    const { diChoVaRapThu } = await import('../lib/chatbotController')
    const shelfBefore = [existingCpu]
    const result = await diChoVaRapThu(
      [{ loai: 'gpu', tuKhoa: '' }],
      [...shelfBefore],
      -2000000,
      []
    )

    expect(layTop3LinhKienMock).toHaveBeenCalledWith('gpu', null, '', null)
    expect(result.doGoiYTuKho).toEqual([])
    expect(result.danhSachTrenKeNganSachMoi).toEqual(shelfBefore)
  })
})
