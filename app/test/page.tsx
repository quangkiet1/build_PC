import { getTranslator } from '@/i18n/server'

export default async function TestPage() {
  const t = await getTranslator('testPage')

  return (
    <div className="p-8">
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
