import { Sparkles, ShieldCheck } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md py-4 px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 dark:text-white">© 2024–2026 MandiSetu</span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span className="text-gray-500 dark:text-gray-400">All rights reserved.</span>
        </div>

        <div className="flex items-center gap-1.5 text-center font-bold text-gray-900 dark:text-white">
          <span className="text-gray-500 dark:text-gray-400 font-normal">Prototype Credits:</span>
          <span className="text-brand-700 dark:text-brand-400">TanmayA, Anuj, Yatharth and Team</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>MandiSetu Platform · Built for Indian Farmers & APMC Markets</span>
        </div>
      </div>
    </footer>
  )
}
