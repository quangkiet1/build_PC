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
    <section className="rounded-2xl border border-white/10 bg-[#0F1115] p-6 shadow-xl mt-6">
      <div className="mb-4">
        <h3 className="text-lg font-heading font-semibold text-white">{t('title')}</h3>
        <p className="mt-1 text-sm text-muted">{t('description')}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full overflow-hidden rounded-xl border border-white/10 text-sm bg-black/50">
          <thead className="bg-white/5 text-left text-muted font-mono uppercase tracking-widest text-[10px]">
            <tr>
              <th className="px-4 py-4 font-semibold">{t('attribute')}</th>
              {builds.map((build) => (
                <th key={build.id} className="px-4 py-4 font-semibold text-white">
                  {build.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {compareRows.map((row) => (
              <tr key={row.key} className="text-white hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 font-mono text-muted uppercase tracking-widest text-[10px]">{t(row.labelKey)}</td>
                {builds.map((build) => (
                  <td key={`${build.id}-${row.key}`} className="px-4 py-3 font-medium">
                    {build.build[row.key]?.name || <span className="text-muted/50 italic">{t('emptyValue')}</span>}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-white/5">
              <td className="px-4 py-4 font-mono font-bold text-muted uppercase tracking-widest text-[10px]">{t('rows.total')}</td>
              {builds.map((build) => (
                <td key={`${build.id}-total`} className="px-4 py-4 font-heading font-bold text-[#FFD600] text-base">
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