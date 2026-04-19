import { useTranslation } from 'react-i18next'

export default function HomePage() {
  const { t } = useTranslation('common')
  return (
    <div className="py-12 text-center">
      <h1 className="text-3xl font-bold">{t('home.title', 'Welcome')}</h1>
      <p className="mt-2 text-gray-600">{t('home.subtitle', 'Frontend scaffold is up.')}</p>
    </div>
  )
}
