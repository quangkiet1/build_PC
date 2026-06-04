'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Boxes, Edit2, Loader2, Plus, Search, Trash2 } from 'lucide-react'
import { AdminModal } from '@/components/admin-modal'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { useToast } from '@/app/providers/toast-provider'
import { useTranslations } from 'next-intl'

type Brand = {
  id: string | null
  name: string
  productCount: number
  aliases: string[]
}

export function AdminBrandsClient() {
  const t = useTranslations('admin.brands')
  const commonT = useTranslations('admin.common')
  const router = useRouter()
  const { addToast } = useToast()
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formData, setFormData] = useState({ name: '' })

  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/brands', { credentials: 'include' })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/brands')
        return
      }

      const data = await response.json()
      setBrands(data.brands || [])
    } catch (error) {
      console.error('Error fetching brands:', error)
      addToast(t('loadError'), 'error')
    } finally {
      setLoading(false)
    }
  }, [addToast, router, t])

  useEffect(() => {
    fetchBrands()
  }, [fetchBrands])

  const openForm = (brand?: Brand) => {
    if (brand) {
      setSelectedBrand(brand)
      setFormData({ name: brand.name })
    } else {
      setSelectedBrand(null)
      setFormData({ name: '' })
    }

    setIsFormOpen(true)
  }

  const closeForm = useCallback(() => {
    setIsFormOpen(false)
    setSelectedBrand(null)
    setFormData({ name: '' })
  }, [])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!formData.name.trim()) {
      addToast(t('nameRequired'), 'error')
      return
    }

    try {
      const method = selectedBrand ? 'PUT' : 'POST'
      const url = selectedBrand
        ? `/api/admin/brands/${encodeURIComponent(selectedBrand.name)}`
        : '/api/admin/brands'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: formData.name }),
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/brands')
        return
      }

      if (!response.ok) {
        throw new Error(t('saveError'))
      }

      await fetchBrands()
      closeForm()
      addToast(selectedBrand ? t('updateSuccess') : t('createSuccess'), 'success')
    } catch (error) {
      console.error('Error saving brand:', error)
      addToast(error instanceof Error ? error.message : t('saveError'), 'error')
    }
  }

  const handleDelete = async () => {
    if (!brandToDelete) return

    try {
      const response = await fetch(`/api/admin/brands/${encodeURIComponent(brandToDelete.name)}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/?auth=required&next=/admin/brands')
        return
      }

      if (!response.ok) {
        throw new Error(t('deleteError'))
      }

      await fetchBrands()
      setBrandToDelete(null)
      addToast(t('deleteSuccess'), 'success')
    } catch (error) {
      console.error('Error deleting brand:', error)
      addToast(error instanceof Error ? error.message : t('deleteError'), 'error')
    }
  }

  const filteredBrands = brands.filter((brand) => {
    const query = searchTerm.toLowerCase()
    return (
      brand.name.toLowerCase().includes(query) ||
      brand.aliases.some((alias) => alias.toLowerCase().includes(query))
    )
  })

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030304] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto mb-3 h-8 w-8 animate-spin text-[#FFD600]" />
          <p className="text-slate-400">{t('loading')}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#030304] px-4 py-10 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="rounded-xl border border-white/10 bg-[#0F1115] p-2.5 text-slate-400 transition hover:border-[#F7931A]/40 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="flex items-center gap-2.5 text-2xl font-bold sm:text-3xl">
                <Boxes className="h-7 w-7 text-[#FFD600]" />
                {t('title')}
              </h1>
              <p className="mt-1 text-sm text-slate-400">{t('count', { count: brands.length })}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => openForm()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#F7931A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff9f2d]"
          >
            <Plus className="h-4 w-4" />
            {t('add')}
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#0F1115] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50 focus:ring-1 focus:ring-[#F7931A]/20"
          />
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f1117]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.brand')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.products')}</th>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">{t('columns.aliases')}</th>
                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wider text-slate-400">{commonT('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredBrands.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-16 text-center text-slate-500">
                      {t('empty')}
                    </td>
                  </tr>
                ) : (
                  filteredBrands.map((brand) => (
                    <tr key={brand.name} className="transition hover:bg-[#141a26]">
                      <td className="px-5 py-4 text-sm font-medium text-white">{brand.name}</td>
                      <td className="px-5 py-4 text-sm text-slate-300">{brand.productCount}</td>
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {brand.aliases.length > 1 ? brand.aliases.join(', ') : commonT('none')}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/admin/products?brand=${encodeURIComponent(brand.name)}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#F7931A]/40 hover:text-white"
                          >
                            <Boxes className="h-3 w-3" />
                            {t('products')}
                          </Link>
                          <button
                            type="button"
                            onClick={() => openForm(brand)}
                            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#F7931A]/40 hover:text-white"
                          >
                            <Edit2 className="h-3 w-3" />
                            {commonT('edit')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setBrandToDelete(brand)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-700 bg-[#111827] px-3 py-1.5 text-xs font-semibold text-rose-300 transition hover:border-rose-500/40 hover:text-white"
                          >
                            <Trash2 className="h-3 w-3" />
                            {commonT('delete')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <AdminModal
        open={isFormOpen}
        onClose={closeForm}
        title={selectedBrand ? t('editTitle') : t('addTitle')}
        maxWidthClassName="max-w-lg"
        footer={(
          <>
            <button
              type="button"
              onClick={closeForm}
              className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:text-white"
            >
              {commonT('cancel')}
            </button>
            <button
              type="submit"
              form="brand-form"
              className="rounded-xl bg-[#F7931A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#ff9f2d]"
            >
              {selectedBrand ? commonT('update') : t('add')}
            </button>
          </>
        )}
      >
        <form id="brand-form" onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">
            {t('name')}
            <input
              type="text"
              value={formData.name}
              onChange={(event) => setFormData({ name: event.target.value })}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#111827] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-[#F7931A]/50"
              placeholder={t('namePlaceholder')}
              required
            />
          </label>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={Boolean(brandToDelete)}
        title={t('confirmTitle')}
        description={
          brandToDelete
            ? t('confirmDescription', { name: brandToDelete.name, count: brandToDelete.productCount })
            : ''
        }
        confirmLabel={commonT('delete')}
        cancelLabel={commonT('cancel')}
        confirmVariant="destructive"
        onConfirm={handleDelete}
        onOpenChange={(open) => {
          if (!open) setBrandToDelete(null)
        }}
      />
    </main>
  )
}
