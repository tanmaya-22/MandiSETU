import { useState } from 'react'
import { Sun, Moon, Globe, Info, HelpCircle, Hash, ChevronDown, Check } from 'lucide-react'
import { useLangStore, SUPPORTED_LANGUAGES, SUPPORTED_NUMERAL_SCRIPTS } from '../../store/langStore'
import { useThemeStore } from '../../store/themeStore'

export default function HeaderControls({ onOpenPageTour, onOpenFullTour }) {
  const { lang, setLang, numeralScript, setNumeralScript, t } = useLangStore()
  const { isDark, toggleDark } = useThemeStore()
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0]
  const currentScriptObj =
    SUPPORTED_NUMERAL_SCRIPTS.find((s) => s.code === numeralScript) || SUPPORTED_NUMERAL_SCRIPTS[0]

  return (
    <div className="flex items-center gap-2">
      {/* 1. Page Info (i) Tour Button */}
      {onOpenPageTour && (
        <button
          onClick={onOpenPageTour}
          title={t('page_tour_title')}
          className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5 text-xs font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
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
          className="p-2 rounded-xl text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5 text-xs font-bold border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm"
        >
          <HelpCircle size={16} className="text-amber-500" />
          <span className="hidden xl:inline">{t('nav_tour')}</span>
        </button>
      )}

      {/* 3. Combined Language & Number Script Customizer */}
      <div className="relative">
        <button
          onClick={() => setLangMenuOpen(!langMenuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-xs font-bold text-gray-800 dark:text-gray-100 shadow-sm transition"
        >
          <span>{currentLangObj.flag}</span>
          <span>{currentLangObj.native}</span>
          {numeralScript !== 'auto' && (
            <span className="text-[10px] font-mono px-1 bg-brand-100 dark:bg-emerald-950 text-brand-800 dark:text-emerald-300 rounded font-bold">
              {numeralScript === 'devanagari' ? '१२३' : numeralScript === 'odia' ? '୧୨୩' : '123'}
            </span>
          )}
          <ChevronDown size={12} className="text-gray-400" />
        </button>

        {langMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setLangMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 z-50 animate-scale-in text-gray-900 dark:text-white">
              {/* Language Section */}
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1">
                Website Language (भाषा)
              </div>
              <div className="space-y-1 mb-3">
                {SUPPORTED_LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition ${
                      lang === l.code
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-brand-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{l.flag}</span>
                      <span>{l.native}</span>
                      <span className="text-[10px] text-gray-400 font-normal">({l.label})</span>
                    </div>
                    {lang === l.code && <Check size={14} className="text-brand-600 dark:text-emerald-400" />}
                  </button>
                ))}
              </div>

              {/* Number Script Customization Section */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-1 flex items-center gap-1">
                  <Hash size={12} />
                  <span>Number Script (अंक संख्या लिपि)</span>
                </div>
                <div className="space-y-1">
                  {SUPPORTED_NUMERAL_SCRIPTS.map((s) => (
                    <button
                      key={s.code}
                      onClick={() => setNumeralScript(s.code)}
                      className={`w-full px-2.5 py-1.5 rounded-lg text-left text-[11px] font-semibold flex items-center justify-between transition ${
                        numeralScript === s.code
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <div>
                        <span>{s.label}</span>
                      </div>
                      {numeralScript === s.code && <Check size={12} className="text-amber-600 dark:text-amber-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 4. Dark Mode Toggle */}
      <button
        onClick={toggleDark}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-yellow-400 shadow-sm transition"
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} className="text-gray-600" />}
      </button>
    </div>
  )
}
