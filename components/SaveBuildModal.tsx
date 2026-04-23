'use client'

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'

interface SaveBuildModalProps {
  isOpen: boolean
  onClose: () => void
  buildId: string
  onSave: (name: string, isCompleted: boolean, isPublic: boolean) => Promise<void>
}

export function SaveBuildModal({ isOpen, onClose, buildId, onSave }: SaveBuildModalProps) {
  const [name, setName] = useState(`Build ${new Date().toLocaleDateString('vi-VN')}`)
  const [isCompleted, setIsCompleted] = useState(true)
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Tên cấu hình không được để trống')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await onSave(name.trim(), isCompleted, isPublic)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi lưu cấu hình')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#1e2535] rounded-lg border border-[#2d3748] p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Lưu Cấu Hình</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Name Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Tên Cấu Hình
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên cấu hình..."
            className="w-full px-4 py-2 bg-[#141a26] border border-[#2d3748] rounded-lg text-white placeholder:text-slate-500 focus:border-indigo-500/50 outline-none"
          />
        </div>

        {/* Checkboxes */}
        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <span className="text-sm text-slate-300">Đánh dấu là hoàn thành</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded accent-indigo-600"
            />
            <span className="text-sm text-slate-300">Công khai cấu hình (cho phép người khác xem)</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  )
}
