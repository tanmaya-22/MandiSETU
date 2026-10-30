import { Mail, Phone, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm py-4 px-6 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 dark:text-gray-200">© 2024–2026 MandiSetu</span>
          <span className="text-gray-300 dark:text-gray-700">|</span>
          <span>All rights reserved.</span>
        </div>

        <div className="flex items-center gap-1.5 text-center font-medium">
          <span className="text-gray-500 dark:text-gray-400">Credits for Prototype:</span>
          <span className="font-bold text-brand-700 dark:text-brand-400">Tanmaya; Anuj; Yatharth and team</span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <a
            href="mailto:tanmayapradhan2322@gmail.com"
            className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            title="Email Platform Owner"
          >
            <Mail size={13} className="text-brand-600" />
            <span className="font-mono">tanmayapradhan2322@gmail.com</span>
          </a>
          <a
            href="tel:+917008800192"
            className="inline-flex items-center gap-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            title="Contact Support & Owner"
          >
            <Phone size={13} className="text-brand-600" />
            <span className="font-mono">+91 7008800192</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
