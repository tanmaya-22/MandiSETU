import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Leaf, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, Sparkles, Sun, Moon } from 'lucide-react'
import { authAPI, getApiBaseUrl } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import { useThemeStore } from '../../store/themeStore'
import HeaderControls from '../../components/common/HeaderControls'

const QUICK_DEMO_USERS = [
  {
    label: '🌾 Farmer (Ramesh)',
    email: 'farmer@demo.com',
    password: 'demo1234',
    role: 'farmer',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Sell produce, price discovery & grading',
  },
  {
    label: '🏪 Buyer (AgriCorp)',
    email: 'buyer@demo.com',
    password: 'demo1234',
    role: 'buyer',
    badge: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Browse lots, make offers & contract',
  },
  {
    label: '🛡️ Demo Admin (Restricted)',
    email: 'admin@demo.com',
    password: 'demo1234',
    role: 'admin',
    badge: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Demo oversight (TanmayA approval required for pivotal actions)',
  },
  {
    label: '👑 Admin(TanmayA)',
    email: '',
    password: '',
    role: 'admin',
    isEmptyForSecurity: true,
    badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    desc: 'Main Admin portal — enter secure credentials manually',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const { t } = useLangStore()
  const { isDark, toggleDark } = useThemeStore()

  const [form, setForm] = useState({
    email: 'farmer@demo.com',
    password: 'demo1234',
  })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleQuickSelect = (user) => {
    if (user.isEmptyForSecurity) {
      setForm((f) => ({ ...f, email: '', password: '' }))
      toast('Admin(TanmayA) selected. Please enter your username/email and password.', { icon: '👑' })
      return
    }
    setForm((f) => ({
      ...f,
      email: user.email,
      password: user.password || 'demo1234',
    }))
    toast.success(`Loaded credentials for ${user.label}`, { icon: '✨' })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    const identifier = (form.email || '').trim()
    const pwd = (form.password || '').trim()
    if (!identifier || !pwd) {
      toast.error('Please enter both username/email and password')
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.login({ email: identifier, password: pwd })
      const data = res?.data
      if (!data) throw new Error('No user data received')

      login(data)
      toast.success(`Welcome back, ${data.full_name || identifier}!`, { icon: '🌾' })

      // Smart redirection based on role
      setTimeout(() => {
        if (data.role === 'buyer') navigate('/buyer-dashboard')
        else if (data.role === 'admin') navigate('/admin')
        else navigate('/farmer-dashboard')
      }, 350)
    } catch (err) {
      console.error('Login error:', err)
      toast.error(err?.message || 'Login failed. Please verify credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 flex flex-col justify-between p-4 transition-colors duration-300">
      {/* Top Bar with Language Selector and Dark / Light Mode Toggle */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between py-2 px-3">
        <Link to="/" className="inline-flex items-center gap-2 group">
          <div className="w-9 h-9 bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-md">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="font-extrabold text-base text-gray-900 dark:text-white tracking-tight">MandiSetu</span>
        </Link>
        <div className="flex items-center gap-2">
          <HeaderControls />
        </div>
      </div>

      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-300/30 dark:bg-emerald-600/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300/30 dark:bg-teal-600/10 rounded-full blur-3xl animate-blob delay-300" />
      </div>

      <div className="relative w-full max-w-md mx-auto my-auto animate-fade-in-up">
        {/* Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 dark:border-gray-800 p-7 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-12 h-12 mx-auto bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg mb-3">
              <Leaf size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {t('reg_sign_in') || 'Sign In to MandiSetu'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              {t('brand_tagline') || 'Connect directly with verified mandis and fair prices'}
            </p>
          </div>

          {/* Quick Demo Access Buttons */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> {t('quick_demo') || 'Quick Demo Accounts (1-Click)'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_DEMO_USERS.map((u) => (
                <button
                  key={u.label}
                  type="button"
                  onClick={() => handleQuickSelect(u)}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-200 text-xs font-medium hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${
                    form.email === u.email
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 ring-2 ring-brand-500/30'
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-bold text-xs truncate">{u.label}</div>
                  <div className="text-[10px] text-gray-400 truncate">{u.role}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {t('reg_email') || 'Username or Email Address'}
              </label>
              <input
                type="text"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="e.g. TanmayA or farmer@demo.com"
                className="input-field"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {t('reg_password') || 'Password'}
                </label>
                <span
                  className="text-xs text-brand-600 hover:underline cursor-pointer"
                  onClick={() => set('password', 'demo1234')}
                >
                  Use default (demo1234)
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 mt-2 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>{t('reg_sign_in') || 'Sign In'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('reg_already_have') ? "Don't have an account?" : "Don't have an account?"}{' '}
              <Link to="/register" className="text-brand-600 font-semibold hover:underline">
                {t('reg_submit') || 'Create Free Account'}
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge note */}
        <div className="flex flex-col items-center justify-center gap-1 text-xs text-gray-500 mt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Role-Based JWT Encrypted Access · Public Agmarknet Verified</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Database Server: {getApiBaseUrl()}
          </span>
        </div>
      </div>
      <div />
    </div>
  )
}
