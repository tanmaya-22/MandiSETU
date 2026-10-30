import { useState } from 'react'
import { Sun, Moon, Globe, Info, HelpCircle } from 'lucide-react'
import { useLangStore, SUPPORTED_LANGUAGES } from '../../store/langStore'
import { useThemeStore } from '../../store/themeStore'

export default function HeaderControls({ onOpenPageTour, onOpenFullTour }) {
  const { lang, setLang, t } = useLangStore()
  const { isDark, toggleDark } = useThemeStore()
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0]

  return (
    <div className="flex items-center gap-2">
      {/* 1. Page Info (i) Tour Button */}
      {onOpenPageTour && (
        <button
          onClick={onOpenPageTour}
          title={t('page_tour_title')}
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-brand-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 transition flex items-center gap-1 text-xs font-bold border border-transparent hover:border-emerald-200 dark:hover:border-gray-700"
        >
          <Info size={16} className="text-emerald-600 dark:text-emerald-400" />
          <span className="hidden xl:inline">{t('page_tour_title')}</span>
        </button>
      )}

      {/* 2. Full Tour Guide Button */}
      {onOpenFullTour && (
        <button
          onClick={onOpenFullTour}
          title={t('nav_tour')}
          className="p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-brand-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 transition flex items-center gap-1 text-xs font-bold border border-transparent hover:border-emerald-200 dark:hover:border-gray-700"
        >
          <HelpCircle size={16} className="text-amber-500" />
          <span className="hidden xl:inline">{t('nav_tour')}</span>
        </button>
      )}

      {/* 3. Language Selector */}
      <div className="relative">
        <button
          onClick={() => setLangMenuOpen(!langMenuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-200 shadow-sm transition"
        >
          <span>{currentLangObj.flag}</span>
          <span>{currentLangObj.native}</span>
        </button>

        {langMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setLangMenuOpen(false)}
            />
            <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-1.5 z-50 animate-scale-in">
              {SUPPORTED_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLang(l.code)
                    setLangMenuOpen(false)
                  }}
                  className={`w-full px-3.5 py-2 text-left text-xs font-semibold flex items-center justify-between transition ${
                    lang === l.code
                      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-brand-700 dark:text-emerald-400 font-bold'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span>{l.native}</span>
                  </div>
                  {lang === l.code && <span className="text-brand-600 dark:text-emerald-400">✓</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* 4. Dark Mode Toggle */}
      <button
        onClick={toggleDark}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-yellow-400 shadow-sm transition"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} className="text-gray-600" />}
      </button>
    </div>
  )
}
