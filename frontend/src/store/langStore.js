import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TRANSLATIONS } from '../i18n/translations'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
]

export const useLangStore = create(
  persist(
    (set, get) => ({
      lang: 'en',
      setLang: (newLang) => set({ lang: newLang }),
      t: (key) => {
        const lang = get().lang || 'en'
        const dict = TRANSLATIONS[lang] || TRANSLATIONS.en
        return dict[key] || TRANSLATIONS.en[key] || key
      },
    }),
    { name: 'mandisetu-lang' }
  )
)
