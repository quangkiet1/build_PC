'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface BrandFilterProps {
  selectedBrand: string
  onBrandChange: (brand: string) => void
  brands?: string[]
}

export function BrandFilter({
  selectedBrand,
  onBrandChange,
  brands = ['Intel', 'AMD', 'Samsung', 'Kingston', 'Corsair', 'NVIDIA', 'Gigabyte', 'ASUS']
}: BrandFilterProps) {
  const [isOpen, setIsOpen] = useState(false)
  const allBrandsLabel = 'Tất cả thương hiệu'

  return (
    <div className="relative inline-block w-full sm:w-48">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#0F1115]/90 px-4 py-3 text-[#CBD5E1] shadow-[0_12px_35px_rgba(0,0,0,0.18)] transition hover:border-[#F7931A]/45 hover:bg-[#F7931A]/10"
      >
        <span className="text-sm font-medium">
          {selectedBrand === 'all' ? allBrandsLabel : selectedBrand}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-white/10 bg-[#0F1115] p-1 shadow-[0_18px_45px_rgba(0,0,0,0.35)]">
          <button
            type="button"
            onClick={() => {
              onBrandChange('all')
              setIsOpen(false)
            }}
            className={`w-full rounded-lg px-4 py-2 text-left text-sm transition ${
              selectedBrand === 'all'
                ? 'bg-[#F7931A]/15 text-[#FFD600]'
                : 'text-[#CBD5E1] hover:bg-white/5 hover:text-white'
            }`}
          >
            {allBrandsLabel}
          </button>

          {brands.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => {
                onBrandChange(brand)
                setIsOpen(false)
              }}
              className={`w-full rounded-lg px-4 py-2 text-left text-sm transition ${
                selectedBrand === brand
                  ? 'bg-[#F7931A]/15 text-[#FFD600]'
                  : 'text-[#CBD5E1] hover:bg-white/5 hover:text-white'
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
