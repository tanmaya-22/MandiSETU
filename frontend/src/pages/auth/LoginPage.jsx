import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Leaf, Eye, EyeOff, Loader2 } from 'lucide-react'
import { authAPI } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'

const ROLE_INFO = {
  farmer: { label: 'Farmer', color: 'bg-green-100 text-green-700 border-green-300' },
  buyer: { label: 'Buyer / Trader', color: 'bg-blue-100 text-blue-700 border-blue-300' },
  fpo: { label: 'FPO / Aggregator', color: 'bg-purple-100 text-purple-700 border-purple-300' },
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700 border-red-300' },
}

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [loading, setLoading] = useState(false)
  const [detectedRole, setDetectedRole] = useState(null)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.login(form)
      login(data)
      setDetectedRole(data.role)
      toast.success(`Welcome back, ${data.full_name || data.email}!`)
      setTimeout(() => navigate('/dashboard'), 300)
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  const roleInfo = detectedRole ? ROLE_INFO[detectedRole] : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-green-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg">
              <Leaf size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MandiSetu</span>
          </div>
          <p className="text-gray-500 text-sm">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          {roleInfo && (
            <div className={`border rounded-lg px-4 py-2 mb-4 text-sm font-medium ${roleInfo.color}`}>
              Signed in as: {roleInfo.label}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 font-medium hover:underline">
              Register here
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl text-xs text-gray-500 space-y-1">
            <p className="font-semibold text-gray-700 mb-2">Demo accounts:</p>
            <p>Farmer: farmer@demo.com / demo1234</p>
            <p>Buyer: buyer@demo.com / demo1234</p>
            <p>Admin: admin@demo.com / demo1234</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          © 2025 MandiSetu. Empowering Indian Agriculture.
        </p>
      </div>
    </div>
  )
}
