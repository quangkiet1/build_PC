'use client'

import Link from 'next/link'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Scale, X } from 'lucide-react'
import type { Product } from '@/app/components/types'

const STORAGE_KEY = 'pc-builder-compare-products'
const MAX_COMPARE_ITEMS = 3

type CompareProduct = Pick<
  Product,
  'id' | 'slug' | 'tenSanPham' | 'gia' | 'thuongHieu' | 'thongSoKyThuat' | 'hinhAnh' | 'danhMuc'
>

type CompareResult = { ok: true; message: string } | { ok: false; message: string }

type CompareContextValue = {
  products: CompareProduct[]
  toggleProduct: (product: Product) => CompareResult
  removeProduct: (id: string) => void
  clear: () => void
  isSelected: (id: string) => boolean
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined)

function categoryKey(product: CompareProduct) {
  return product.danhMuc?.id || product.danhMuc?.tenDanhMuc || ''
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<CompareProduct[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CompareProduct[]
        if (Array.isArray(parsed)) {
          setProducts(parsed.slice(0, MAX_COMPARE_ITEMS))
        }
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      setLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!loaded) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
  }, [loaded, products])

  const removeProduct = useCallback((id: string) => {
    setProducts((current) => current.filter((item) => item.id !== id))
  }, [])

  const clear = useCallback(() => setProducts([]), [])

  const isSelected = useCallback(
    (id: string) => products.some((item) => item.id === id),
    [products]
  )

  const toggleProduct = useCallback((product: Product): CompareResult => {
    const nextProduct: CompareProduct = {
      id: product.id,
      slug: product.slug,
      tenSanPham: product.tenSanPham,
      gia: product.gia,
      thuongHieu: product.thuongHieu,
      thongSoKyThuat: product.thongSoKyThuat,
      hinhAnh: product.hinhAnh,
      danhMuc: product.danhMuc,
    }

    if (products.some((item) => item.id === product.id)) {
      setProducts((current) => current.filter((item) => item.id !== product.id))
      return { ok: true, message: 'Da xoa khoi so sanh' }
    }

    if (products.length > 0 && categoryKey(products[0]) !== categoryKey(nextProduct)) {
      return { ok: false, message: 'Chi co the so sanh san pham cung danh muc' }
    }

    if (products.length >= MAX_COMPARE_ITEMS) {
      return { ok: false, message: 'Chi so sanh toi da 3 san pham' }
    }

    setProducts((current) => [...current, nextProduct])
    return { ok: true, message: 'Da them vao so sanh' }
  }, [products])

  const value = useMemo(
    () => ({ products, toggleProduct, removeProduct, clear, isSelected }),
    [clear, isSelected, products, removeProduct, toggleProduct]
  )

  return (
    <CompareContext.Provider value={value}>
      {children}
      <CompareBar />
    </CompareContext.Provider>
  )
}

export function useCompare() {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }

  return context
}

function CompareBar() {
  const { products, removeProduct, clear } = useCompare()

  if (products.length === 0) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0f1115]/95 px-4 py-3 text-white shadow-2xl backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#F7931A]/30 bg-[#F7931A]/10 text-[#FFD600]">
            <Scale className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-mono uppercase tracking-widest text-muted">Dang so sanh {products.length}/3</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {products.map((product) => (
                <span key={product.id} className="inline-flex max-w-[16rem] items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                  <span className="truncate">{product.tenSanPham}</span>
                  <button
                    type="button"
                    onClick={() => removeProduct(product.id)}
                    className="text-slate-500 transition hover:text-rose-300"
                    aria-label="Xoa khoi so sanh"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={clear}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Xoa tat ca
          </button>
          <Link
            href="/compare"
            className="rounded-xl bg-gradient-to-r from-[#EA580C] to-[#F7931A] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
          >
            Mo bang so sanh
          </Link>
        </div>
      </div>
    </div>
  )
}
