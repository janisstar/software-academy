import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en/common.json'

/** Языки, которые умеет интерфейс. Новый язык = новая папка `src/i18n/<код>/`. */
export const SUPPORTED_LANGUAGES = ['en'] as const

export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: Language = 'en'

/** Единственное пространство имён. Разделим, когда словарь перестанет читаться. */
export const DEFAULT_NAMESPACE = 'common'

void i18n.use(initReactI18next).init({
  resources: {
    en: { common: en },
  },
  lng: DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: DEFAULT_NAMESPACE,
  interpolation: {
    // React сам экранирует значения — двойное экранирование ломает текст.
    escapeValue: false,
  },
})

export default i18n
