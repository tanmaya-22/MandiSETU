import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TRANSLATIONS } from '../i18n/translations'

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
]

export const SUPPORTED_NUMERAL_SCRIPTS = [
  { code: 'auto', label: 'Auto (Matches Language)', sample: '123 / १२३ / ୧୨୩' },
  { code: 'latin', label: 'English / International (1, 2, 3)', sample: '1, 2, 3, 4, 5' },
  { code: 'devanagari', label: 'Devanagari (१, २, ३) [Hindi / Marathi]', sample: '१, २, ३, ४, ५' },
  { code: 'odia', label: 'Odia (୧, ୨, ୩) [ଓଡ଼ିଆ]', sample: '୧, ୨, ୩, ୪, ୫' },
]

const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९']
const ODIA_DIGITS = ['୦', '୧', '୨', '୩', '୪', '୫', '୬', '୭', '୮', '୯']

export function convertDigits(str, targetScript) {
  if (str === null || str === undefined) return ''
  const s = String(str)
  if (targetScript === 'latin') {
    return s
      .replace(/[०-९]/g, (d) => DEVANAGARI_DIGITS.indexOf(d))
      .replace(/[୦-୯]/g, (d) => ODIA_DIGITS.indexOf(d))
  }
  if (targetScript === 'devanagari') {
    return s.replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[Number(d)])
  }
  if (targetScript === 'odia') {
    return s.replace(/[0-9]/g, (d) => ODIA_DIGITS[Number(d)])
  }
  return s
}

export const useLangStore = create(
  persist(
    (set, get) => ({
      lang: 'en',
      numeralScript: 'auto', // 'auto' | 'latin' | 'devanagari' | 'odia'

      setLang: (newLang) => set({ lang: newLang }),
      setNumeralScript: (newScript) => set({ numeralScript: newScript }),

      // Translation lookup
      t: (key) => {
        const lang = get().lang || 'en'
        const dict = TRANSLATIONS[lang] || TRANSLATIONS.en
        return dict[key] || TRANSLATIONS.en[key] || key
      },

      // Number & Currency localized formatter
      formatNum: (val) => {
        if (val === null || val === undefined || val === '') return ''
        const state = get()
        let activeScript = state.numeralScript
        if (activeScript === 'auto') {
          if (state.lang === 'hi' || state.lang === 'mr') activeScript = 'devanagari'
          else if (state.lang === 'or') activeScript = 'odia'
          else activeScript = 'latin'
        }
        return convertDigits(val, activeScript)
      },

      formatPrice: (amount, perUnit = '') => {
        if (amount === null || amount === undefined) return ''
        const state = get()
        const formattedRaw = typeof amount === 'number' ? amount.toLocaleString('en-IN') : amount
        const localizedDigits = state.formatNum(formattedRaw)
        return `₹${localizedDigits}${perUnit ? ` ${perUnit}` : ''}`
      },
    }),
    { name: 'mandisetu-lang' }
  )
)
