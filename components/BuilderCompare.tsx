'use client'

import { useLocale, useTranslations } from 'next-intl'
import type { SavedBuild } from '@/store/useBuilderStore'
import { formatCurrency } from '@/lib/format'
import type { AppLocale } from '@/i18n/config'

type BuilderCompareProps = {
  builds: SavedBuild[]
}

const compareRows = [
  { key: 'cpu', labelKey: 'rows.cpu' },
  { key: 'gpu', labelKey: 'rows.gpu' },
  { key: 'ram', labelKey: 'rows.ram' },
  { key: 'psu', labelKey: 'rows.psu' },
] as const

export function BuilderCompare({ builds }: BuilderCompareProps) {
  const locale = useLocale() as AppLocale
  const t = useTranslations('builder.compare')

  if (builds.length < 2) {
    return null
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-[#0f1117] p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">{t('title')}</h3>
        <p className="mt-1 text-sm text-slate-400">{t('description')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-2xl border border-slate-800 text-sm">
          <thead className="bg-slate-900/80 text-left text-slate-300">
            <tr>
              <th className="px-4 py-3 font-semibold">{t('attribute')}</th>
              {builds.map((build) => (
                <th key={build.id} className="px-4 py-3 font-semibold text-white">
                  {build.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row) => (
              <tr key={row.key} className="border-t border-slate-800 text-slate-300">
                <td className="px-4 py-3 font-medium text-slate-400">{t(row.labelKey)}</td>
                {builds.map((build) => (
                  <td key={`${build.id}-${row.key}`} className="px-4 py-3 text-white">
                    {build.build[row.key]?.name || t('emptyValue')}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-slate-800 text-slate-300">
              <td className="px-4 py-3 font-medium text-slate-400">{t('rows.total')}</td>
              {builds.map((build) => (
                <td key={`${build.id}-total`} className="px-4 py-3 font-semibold text-sky-300">
                  {formatCurrency(build.totalPrice, locale)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}