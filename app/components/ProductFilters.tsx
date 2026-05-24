'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { Search } from 'lucide-react'

interface Category {
  id: string
  tenDanhMuc: string
  moTa?: string | null
}

interface ProductFiltersProps {
  categories: Category[]
  initialSearch: string
  initialCategory: string
  initialSort: string
}

export function ProductFilters({
  categories,
  initialSearch,
  initialCategory,
  initialSort
}: ProductFiltersProps) {
  const [search, setSearch] = useState(initialSearch)
  const [category] = useState(initialCategory)
  const [sort] = useState(initialSort)

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(window.location.search)
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    params.delete('category')
    params.delete('sort')
    window.location.href = `/products?${params.toString()}`
  }

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value !== 'all') {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    params.delete('search')
    window.location.href = `/products?${params.toString()}`
  }

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value !== 'newest') {
      params.set('sort', value)
    } else {
      params.delete('sort')
    }
    window.location.href = `/products?${params.toString()}`
  }

  return (
    <div className="mb-8 rounded-2xl border border-white/10 bg-[#0F1115]/85 p-5 shadow-[0_22px_55px_rgba(0,0,0,0.24)]">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="min-h-11 flex-1 rounded-xl border border-white/10 bg-[#030304] px-4 py-2 text-white outline-none transition placeholder:text-[#64748B] hover:border-white/20 focus:border-[#F7931A]/55 focus:ring-1 focus:ring-[#F7931A]/20"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F7931A] px-4 py-2 text-white shadow-[0_0_18px_rgba(247,147,26,0.28)] transition hover:bg-[#ff9f2d]"
              aria-label="Tìm kiếm"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-white/10 bg-[#030304] px-4 py-2 text-white outline-none transition hover:border-white/20 focus:border-[#F7931A]/55 focus:ring-1 focus:ring-[#F7931A]/20"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.tenDanhMuc}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="min-h-11 w-full rounded-xl border border-white/10 bg-[#030304] px-4 py-2 text-white outline-none transition hover:border-white/20 focus:border-[#F7931A]/55 focus:ring-1 focus:ring-[#F7931A]/20"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp đến cao</option>
            <option value="price_desc">Giá cao đến thấp</option>
            <option value="name_asc">Tên A-Z</option>
            <option value="name_desc">Tên Z-A</option>
          </select>
        </div>
      </div>
    </div>
  )
}
