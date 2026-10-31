import { Link, useLocation } from 'react-router-dom'
import { Lock, ShieldCheck, ArrowRight, UserPlus, LogIn, Calculator, TrendingUp, MapPin, CloudRain, Sparkles } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

export default function ProtectedRoute({ children, moduleName = 'This Feature' }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (isAuthenticated && user) {
    return children
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 py-12 animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-9 text-center space-y-6">
        {/* Shield / Lock Emblem */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-brand-600 to-emerald-500 text-white shadow-xl shadow-brand-500/20 transform hover:scale-105 transition-transform duration-300">
          <Lock size={36} className="text-white" />
        </div>

        {/* Title and Explanation */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <ShieldCheck size={14} />
            Member Account Required
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sign In or Register to Access {moduleName}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            MandiSetu provides escrow protection, verified digital lot listings, and algorithmic matching to verified farmers and buyers. Sign in to your account or create a free membership to continue.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to="/login"
            state={{ from: location }}
            className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <LogIn size={18} />
            <span>Sign In to Continue</span>
          </Link>

          <Link
            to="/register"
            className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-brand-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-bold text-sm transition transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <UserPlus size={18} />
            <span>Create Free Account</span>
          </Link>
        </div>

        {/* Public Tools Section */}
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Free Public Tools (No Account Required)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Open Access
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/calculator"
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-emerald-300 transition flex items-center gap-2 group"
            >
              <Calculator size={16} className="text-emerald-600 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold">Net Calculator</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Haversine freight deduction</div>
              </div>
            </Link>

            <Link
              to="/prices"
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-blue-300 transition flex items-center gap-2 group"
            >
              <TrendingUp size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold">Mandi Prices</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Live Agmarknet rates</div>
              </div>
            </Link>

            <Link
              to="/mandi-map"
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-purple-300 transition flex items-center gap-2 group"
            >
              <MapPin size={16} className="text-purple-600 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold">Mandi Maps</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Geospatial APMC centers</div>
              </div>
            </Link>

            <Link
              to="/weather"
              className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 hover:border-teal-300 transition flex items-center gap-2 group"
            >
              <CloudRain size={16} className="text-teal-600 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-bold">Weather Intel</div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400">Precipitation & monsoon alerts</div>
              </div>
            </Link>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="pt-2">
          <Link
            to="/"
            className="text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition inline-flex items-center gap-1"
          >
            ← Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
