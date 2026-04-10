'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown, Filter, Cpu, Monitor, Database, HardDrive, Zap, Package } from 'lucide-react'
import { AddToCartButton } from '@/components/add-to-cart-button'

type Category = 'all' | 'CPU' | 'GPU' | 'RAM' | 'Storage' | 'PSU'

type Product = {
  id: string
  name: string
  brand: string
  category: Category
  price: number
  rating: number
  reviews: number
  image: string
  specs: string[]
  inStock: boolean
  discount: number
  isSale: boolean
  isNew: boolean
  description: string
}

const products: Product[] = [
  {
    id: 'intel-i7-13700k',
    name: 'Intel Core i7-13700K',
    brand: 'Intel',
    category: 'CPU',
    price: 18500000,
    rating: 4.8,
    reviews: 1247,
    image: '/cpu-intel.jpg',
    specs: ['24 cores / 32 threads', '5.4 GHz boost', 'LGA 1700', '125W TDP'],
    inStock: true,
    discount: 5,
    isSale: false,
    isNew: true,
    description: 'Hiệu năng cao cho game và xử lý đa nhiệm.'
  },
  {
    id: 'amd-ryzen-7-7800x3d',
    name: 'AMD Ryzen 7 7800X3D',
    brand: 'AMD',
    category: 'CPU',
    price: 16500000,
    rating: 4.9,
    reviews: 892,
    image: '/cpu-amd.jpg',
    specs: ['8 cores / 16 threads', '5.0 GHz boost', 'AM5 socket', '120W TDP'],
    inStock: true,
    discount: 6,
    isSale: true,
    isNew: false,
    description: 'Lựa chọn tốt cho game và đa nhiệm với 3D V-Cache.'
  },
  {
    id: 'rtx-4070-ti',
    name: 'ASUS ROG Strix RTX 4070 Ti',
    brand: 'ASUS',
    category: 'GPU',
    price: 28500000,
    rating: 4.7,
    reviews: 2156,
    image: '/gpu-rtx4070ti.jpg',
    specs: ['12GB GDDR6X', 'Ray Tracing', 'DLSS 3', '7680 CUDA cores'],
    inStock: true,
    discount: 3,
    isSale: false,
    isNew: false,
    description: 'Card đồ họa mạnh mẽ cho chơi game 1440p và sáng tạo nội dung.'
  },
  {
    id: 'corsair-ddr5-32gb',
    name: 'Corsair Vengeance DDR5 32GB',
    brand: 'Corsair',
    category: 'RAM',
    price: 4500000,
    rating: 4.5,
    reviews: 543,
    image: '/ram-corsair.jpg',
    specs: ['DDR5-6400', 'CL32', '1.35V', 'Lifetime warranty'],
    inStock: true,
    discount: 6,
    isSale: true,
    isNew: true,
    description: 'RAM DDR5 hiệu năng cao, phù hợp cho nhiều dòng máy.'
  },
  {
    id: 'samsung-990-pro-2tb',
    name: 'Samsung 990 PRO 2TB',
    brand: 'Samsung',
    category: 'Storage',
    price: 8500000,
    rating: 4.9,
    reviews: 1234,
    image: '/ssd-samsung.jpg',
    specs: ['PCIe 4.0', '7450MB/s read', '6900MB/s write', '5-year warranty'],
    inStock: true,
    discount: 6,
    isSale: false,
    isNew: false,
    description: 'SSD NVMe tốc độ cao phù hợp cho hệ thống và game.'
  },
  {
    id: 'corsair-rm850x',
    name: 'Corsair RM850x 850W',
    brand: 'Corsair',
    category: 'PSU',
    price: 3200000,
    rating: 4.6,
    reviews: 421,
    image: '/psu-corsair.jpg',
    specs: ['850W', '80+ Gold', 'Modular', 'Ultra Quiet'],
    inStock: true,
    discount: 0,
    isSale: false,
    isNew: false,
    description: 'Nguồn ổn định cho cấu hình gaming và làm việc.'
  }
]

const categories = [
  { id: 'all', name: 'Tất cả', icon: Package },
  { id: 'CPU', name: 'CPU', icon: Cpu },
  { id: 'GPU', name: 'Card đồ họa', icon: Monitor },
  { id: 'RAM', name: 'RAM', icon: Database },
  { id: 'Storage', name: 'Ổ cứng', icon: HardDrive },
  { id: 'PSU', name: 'Nguồn', icon: Zap }
]

const brands = Array.from(new Set(products.map((product) => product.brand))).sort()

const priceRanges = [
  { label: 'Dưới 2 triệu', min: 0, max: 2000000 },
  { label: '2 - 5 triệu', min: 2000000, max: 5000000 },
  { label: '5 - 10 triệu', min: 5000000, max: 10000000 },
  { label: '10 - 20 triệu', min: 10000000, max: 20000000 },
  { label: 'Trên 20 triệu', min: 20000000, max: Infinity }
]

const sortOptions = [
  { value: 'featured', label: 'Nổi bật' },
  { value: 'price-asc', label: 'Giá tăng dần' },
  { value: 'price-desc', label: 'Giá giảm dần' },
  { value: 'rating', label: 'Đánh giá cao nhất' },
  { value: 'new', label: 'Mới nhất' }
]

const formatPrice = (price: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(price)

export default function Products() {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('featured')
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const categoriesWithCount = categories.map((category) => ({
    ...category,
    count:
      category.id === 'all'
        ? products.length
        : products.filter((product) => product.category === category.id).length
  }))

  const filteredProducts = useMemo(() => {
    let result = [...products]

    if (selectedCategory !== 'all') {
      result = result.filter((product) => product.category === selectedCategory)
    }

    if (searchTerm) {
      const query = searchTerm.toLowerCase()
      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query)
      )
    }

    if (selectedBrands.length > 0) {
      result = result.filter((product) => selectedBrands.includes(product.brand))
    }

    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange]
      result = result.filter((product) => product.price >= range.min && product.price <= range.max)
    }

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        result.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        result.sort((a, b) => b.rating - a.rating)
        break
      case 'new':
        result.sort((a, b) => Number(b.isNew) - Number(a.isNew))
        break
      default:
        result.sort((a, b) => Number(b.isSale) - Number(a.isSale))
    }

    return result
  }, [selectedCategory, selectedBrands, selectedPriceRange, searchTerm, sortBy])

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((item) => item !== brand) : [...prev, brand]
    )
  }

  const clearFilters = () => {
    setSelectedCategory('all')
    setSelectedBrands([])
    setSelectedPriceRange(null)
    setSearchTerm('')
  }

  const activeFilterCount =
    selectedBrands.length +
    (selectedPriceRange !== null ? 1 : 0) +
    (selectedCategory !== 'all' ? 1 : 0) +
    (searchTerm ? 1 : 0)

  const currentCategory = categories.find((category) => category.id === selectedCategory)

  const FilterSidebar = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-slate-300 text-sm font-semibold mb-3">Danh mục</h3>
        <div className="space-y-1">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Tất cả sản phẩm
          </button>
          {categoriesWithCount.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as Category)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex justify-between items-center ${
                selectedCategory === category.id
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{category.name}</span>
              <span className="text-xs bg-[#1a1d26] px-1.5 py-0.5 rounded text-slate-500">{category.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-slate-300 text-sm font-semibold mb-3">Khoảng giá</h3>
        <div className="space-y-1">
          {priceRanges.map((range, index) => (
            <button
              key={range.label}
              onClick={() => setSelectedPriceRange(selectedPriceRange === index ? null : index)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedPriceRange === index
                  ? 'bg-indigo-500/20 text-indigo-400'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-slate-300 text-sm font-semibold mb-3">Thương hiệu</h3>
        <div className="space-y-1.5">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => toggleBrand(brand)}
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                  selectedBrands.includes(brand)
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-[#2a3045] group-hover:border-indigo-500/50'
                }`}
              >
                {selectedBrands.includes(brand) && (
                  <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 10" fill="currentColor">
                    <path d="M1 5l3.5 3.5L11 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <span
                className={`text-sm transition-colors cursor-pointer ${
                  selectedBrands.includes(brand) ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'
                }`}
                onClick={() => toggleBrand(brand)}
              >
                {brand}
              </span>
            </label>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearFilters}
          className="w-full flex items-center justify-center gap-2 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-lg text-sm transition-all"
        >
          <X className="w-4 h-4" /> Xóa bộ lọc ({activeFilterCount})
        </button>
      )}
    </div>
  )

  return (
    <div className="min-h-screen text-white">
      <div className="bg-[#0a0b10] border-b border-[#1e2535] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
            <Link href="/" className="hover:text-indigo-400 transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-slate-300">
              {currentCategory ? currentCategory.name : searchTerm ? `Kết quả: "${searchTerm}"` : 'Tất cả sản phẩm'}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h1 className="text-white font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {currentCategory ? currentCategory.name : 'Tất cả sản phẩm'}
            </h1>
            <div className="flex gap-2 sm:w-80">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Tìm kiếm..."
                  className="w-full bg-[#111318] border border-[#1e2535] rounded-lg pl-9 pr-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <button onClick={clearFilters} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                Xóa
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-4 sticky top-24">
              <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" />
                Bộ lọc
              </h2>
              <FilterSidebar />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMobileFilterOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-3 py-2 bg-[#0f1117] border border-[#1e2535] rounded-lg text-slate-400 text-sm hover:border-indigo-500/50 transition-all"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Lọc {activeFilterCount > 0 && <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
                </button>
                <p className="text-slate-500 text-sm">
                  <span className="text-white font-medium">{filteredProducts.length}</span> sản phẩm
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                    className="appearance-none bg-[#0f1117] border border-[#1e2535] rounded-lg pl-3 pr-8 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>

                <div className="hidden sm:flex border border-[#1e2535] rounded-lg overflow-hidden">
                  {(['grid', 'list'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`p-2 transition-colors ${
                        viewMode === mode ? 'bg-indigo-600 text-white' : 'bg-[#0f1117] text-slate-400 hover:text-white'
                      }`}
                    >
                      {mode === 'grid' ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {(selectedBrands.length > 0 || selectedPriceRange !== null || searchTerm) && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedBrands.map((brand) => (
                  <span key={brand} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-xs">
                    {brand}
                    <button onClick={() => toggleBrand(brand)} className="hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {selectedPriceRange !== null && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-xs">
                    {priceRanges[selectedPriceRange].label}
                    <button onClick={() => setSelectedPriceRange(null)} className="hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {searchTerm && (
                  <span className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-400 text-xs">
                    Tìm: {searchTerm}
                    <button onClick={() => setSearchTerm('')} className="hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-[#0f1117] border border-[#1e2535] flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-white font-medium mb-1">Không tìm thấy sản phẩm</h3>
                <p className="text-slate-500 text-sm mb-4">Thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
                <button onClick={clearFilters} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                  Xóa bộ lọc
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-[#0f1117] border border-[#1e2535] rounded-3xl overflow-hidden shadow-sm transition hover:shadow-lg hover:shadow-blue-500/10">
                    <div className="relative h-48 bg-slate-900 overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-xs text-indigo-400 mb-1">{product.brand}</p>
                          <h3 className="text-white font-semibold line-clamp-2">{product.name}</h3>
                        </div>
                        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{product.category}</span>
                      </div>
                      <p className="text-slate-400 text-sm line-clamp-2">{product.description}</p>
                      <div className="flex flex-col gap-3">
                        <div>
                          <p className="text-indigo-400 font-bold">{formatPrice(product.price)}</p>
                          <p className="text-slate-500 text-xs">{product.rating}   {product.reviews} đánh giá</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <AddToCartButton productId={product.id} />
                          <Link href={`/products/${product.id}`} className="text-indigo-300 text-sm hover:text-indigo-200">
                            Xem chi tiết
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-[#0f1117] border border-[#1e2535] rounded-xl p-4 flex gap-4 hover:border-indigo-500/40 transition-all">
                    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-indigo-400 mb-0.5">{product.brand}</p>
                      <h3 className="text-slate-200 font-medium truncate">{product.name}</h3>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="flex flex-col items-end justify-between shrink-0 gap-2">
                      <div className="text-right">
                        <p className="text-indigo-400 font-bold">{formatPrice(product.price)}</p>
                      </div>
                      <AddToCartButton productId={product.id} />
                      <Link href={`/products/${product.id}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-colors">
                        Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[#0f1117] border-l border-[#1e2535] p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-400" /> Bộ lọc
              </h2>
              <button onClick={() => setMobileFilterOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <FilterSidebar />
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Áp dụng ({filteredProducts.length} sản phẩm)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
