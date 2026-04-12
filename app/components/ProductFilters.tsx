'use client'

import { useState } from 'react'

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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(window.location.search)
    if (search.trim()) {
      params.set('search', search.trim())
    } else {
      params.delete('search')
    }
    params.delete('category') // Reset category when searching
    params.delete('sort') // Reset sort when searching
    window.location.href = `/products?${params.toString()}`
  }

  const handleCategoryChange = (value: string) => {
    const params = new URLSearchParams(window.location.search)
    if (value !== 'all') {
      params.set('category', value)
    } else {
      params.delete('category')
    }
    params.delete('search') // Reset search when filtering by category
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
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="md:col-span-2">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              🔍
            </button>
          </form>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.tenDanhMuc}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div>
          <select
            value={sort}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá thấp → cao</option>
            <option value="price_desc">Giá cao → thấp</option>
            <option value="name_asc">Tên A-Z</option>
            <option value="name_desc">Tên Z-A</option>
          </select>
        </div>
      </div>
    </div>
  )
}
