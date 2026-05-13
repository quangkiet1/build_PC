'use client'

import { useCallback, useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface BrandFilterProps {
  selectedBrand: string
  onBrandChange: (brand: string) => void
  brands?: string[]
}

export function BrandFilter({ selectedBrand, onBrandChange, brands = ['Intel', 'AMD', 'Samsung', 'Kingston', 'Corsair', 'NVIDIA', 'Gigabyte', 'ASUS'] }: BrandFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block w-full sm:w-48">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-[#1e2535] border border-[#2d3748] rounded-lg text-slate-300 hover:border-indigo-500/50 transition"
      >
        <span className="text-sm font-medium">
          {selectedBrand === 'all' ? 'Tất cả thương hiệu' : selectedBrand}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1f2e] border border-[#2d3748] rounded-lg shadow-lg z-50 overflow-y-auto max-h-60">
          <button
            onClick={() => {
              onBrandChange('all')
              setIsOpen(false)
            }}
            className={`w-full text-left px-4 py-2 hover:bg-[#2d3748] transition ${
              selectedBrand === 'all' ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300'
            }`}
          >
            Tất cả thương hiệu
          </button>

          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => {
                onBrandChange(brand)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 hover:bg-[#2d3748] transition ${
                selectedBrand === brand ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-300'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
