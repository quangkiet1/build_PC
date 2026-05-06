'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface BuildItem {
  id: string
  tenSanPham: string
  gia: number
  hinhAnh?: string | null
  soLuong: number
}

interface CurrentBuild {
  items: BuildItem[]
  tongGia: number
}

interface SaveBuildModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, isCompleted: boolean, isPublic: boolean) => void
  currentBuild: CurrentBuild
}

export function SaveBuildModal({ isOpen, onClose, onSave, currentBuild }: SaveBuildModalProps) {
  const [name, setName] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPublic, setIsPublic] = useState(false)

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên build')
      return
    }
    onSave(name.trim(), isCompleted, isPublic)
    setName('')
    setIsCompleted(false)
    setIsPublic(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Lưu build</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300">Tên build</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-sky-400"
              placeholder="Nhập tên build..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isCompleted"
              checked={isCompleted}
              onChange={(e) => setIsCompleted(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-400"
            />
            <label htmlFor="isCompleted" className="text-sm text-slate-300">
              Build hoàn thành
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-sky-500 focus:ring-sky-400"
            />
            <label htmlFor="isPublic" className="text-sm text-slate-300">
              Công khai build
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-xl bg-sky-500 px-4 py-3 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
          >
            Lưu
          </button>
        </div>
      </div>
    </div>
  )
}