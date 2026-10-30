import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Leaf, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react'
import { authAPI } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'

const QUICK_DEMO_USERS = [
  {
    label: '👑 TanmayA (Platform Owner)',
    email: 'TanmayA',
    password: 'sanurimi@2210',
    role: 'admin',
    isOwner: true,
    badge: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
    desc: 'Full platform super-admin privileges & controls',
  },
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
    desc: 'Demo oversight with TanmayA approval required for pivotal actions',
  },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [form, setForm] = useState({ email: 'farmer@demo.com', password: 'demo1234' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleQuickSelect = (user) => {
    setForm({ email: user.email, password: user.password || 'demo1234' })
    toast.success(`Loaded credentials for ${user.label}`, { icon: '✨' })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please enter both email and password')
      return
    }
    setLoading(true)
    try {
      const res = await authAPI.login(form)
      const data = res?.data
      if (!data) throw new Error('No user data received')

      login(data)
      toast.success(`Welcome back, ${data.full_name || form.email}!`, { icon: '🌾' })

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center p-4">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-300/30 rounded-full blur-3xl animate-blob delay-300" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in-up">
        {/* Logo and Brand */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
              <Leaf size={24} className="text-white" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">MandiSetu</span>
              <span className="block text-xs font-semibold text-brand-600 tracking-wider uppercase">Market Intelligence</span>
            </div>
          </Link>
          <p className="text-gray-600 text-sm">Sign in to access your agri-market portal</p>
        </div>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-7 sm:p-8">
          {/* Quick Demo Access Buttons */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" /> Quick Demo Accounts (1-Click)
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_DEMO_USERS.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleQuickSelect(u)}
                  className={`p-2.5 rounded-xl border text-center transition-all duration-200 text-xs font-medium hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${
                    form.email === u.email
                      ? 'border-brand-500 bg-brand-50/80 text-brand-900 shadow-sm ring-2 ring-brand-500/20'
                      : 'border-gray-200 bg-gray-50/50 hover:bg-white text-gray-700'
                  }`}
                >
                  <div className="font-semibold truncate">{u.label.split(' ')[1]}</div>
                  <div className="text-[10px] text-gray-500 capitalize">{u.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink mx-3 text-xs text-gray-400 font-medium">Or enter credentials</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="farmer@demo.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700">
                  Password
                </label>
                <span className="text-xs text-brand-600 hover:underline cursor-pointer" onClick={() => set('password', 'demo1234')}>
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
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
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer inside card */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-600 font-semibold hover:underline">
                Register as Farmer / Buyer
              </Link>
            </p>
          </div>
        </div>

        {/* Security badge note */}
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Role-Based JWT Encrypted Access · Public Agmarknet Verified</span>
        </div>
      </div>
    </div>
  )
}
