'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

type AdminModalProps = {
  open: boolean
  title: string
  children: ReactNode
  footer?: ReactNode
  onClose: () => void
  maxWidthClassName?: string
}

export function AdminModal({
  open,
  title,
  children,
  footer,
  onClose,
  maxWidthClassName = 'max-w-2xl',
}: AdminModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!mounted || !open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
        className={`flex max-h-[90vh] w-full ${maxWidthClassName} flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117] text-white shadow-2xl`}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-[#0f1117] p-5 sm:p-6">
          <h2 id="admin-modal-title" className="text-xl font-bold text-white">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-slate-600 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-slate-600">
          {children}
        </div>

        {footer ? (
          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-800 bg-[#0f1117] p-5 sm:p-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  )
}
