import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resources from '@/locales'

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number]

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: ['common', 'auth', 'validation', 'projects', 'home', 'me', 'admin', 'history'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'app.lang',
    },
  })

i18n.on('languageChanged', (lng) => {
  document.documentElement.setAttribute('lang', lng)
})

export default i18n
