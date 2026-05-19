'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Sparkles } from 'lucide-react'

interface SaveBuildModalProps {
  isOpen: boolean
  onClose: () => void
  buildId: string
  onSave: (name: string, isCompleted: boolean, isPublic: boolean) => Promise<void>
}

export function SaveBuildModal({ isOpen, onClose, buildId, onSave }: SaveBuildModalProps) {
  const [name, setName] = useState('Build mới')
  const [isCompleted, setIsCompleted] = useState(true)
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(`Build ${new Date().toLocaleDateString('vi-VN')}`)
  }, [])

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#030304]/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0F1115] p-6 shadow-[0_0_50px_rgba(247,147,26,0.15)] relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-[#F7931A]/10 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#F7931A]/30 bg-[#F7931A]/10 px-2.5 py-0.5 text-[10px] font-mono font-medium text-[#FFD600] uppercase tracking-widest">
              <Sparkles className="h-3 w-3" />
              Lưu trữ
            </div>
            <button onClick={onClose} className="text-muted hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <h2 className="text-2xl font-heading font-bold text-white mb-4">Lưu Cấu Hình</h2>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-mono uppercase tracking-wide">
              {error}
            </div>
          )}

          {/* Name Input */}
          <div className="mb-4">
            <label className="block text-xs font-mono uppercase tracking-widest text-muted mb-2">
              Tên Cấu Hình
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên cấu hình..."
              className="w-full rounded-xl border border-white/10 bg-[#030304] px-4 py-3 text-sm text-white outline-none transition-all focus:border-[#F7931A]/50 focus:shadow-[0_0_15px_rgba(247,147,26,0.15)] placeholder:text-muted"
            />
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 mb-8 p-4 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={(e) => setIsCompleted(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-[#030304] checked:bg-[#F7931A] checked:border-[#F7931A] transition-colors cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-[#030304] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="text-sm font-medium text-white group-hover:text-[#F7931A] transition-colors">Đánh dấu là hoàn thành</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border border-white/20 rounded bg-[#030304] checked:bg-[#F7931A] checked:border-[#F7931A] transition-colors cursor-pointer"
                />
                <svg className="absolute w-3 h-3 text-[#030304] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <span className="text-sm font-medium text-white group-hover:text-[#F7931A] transition-colors">Công khai cấu hình (cho phép người khác xem)</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-mono font-medium text-muted transition hover:bg-white/10 hover:text-white disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-4 py-3 text-sm font-semibold text-white shadow-[0_0_15px_-5px_rgba(247,147,26,0.5)] transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_rgba(247,147,26,0.7)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
              {loading ? 'Đang lưu...' : 'Lưu cấu hình'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
