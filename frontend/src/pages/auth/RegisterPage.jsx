import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Leaf, Loader2, ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Building2, Tractor, Users } from 'lucide-react'
import { authAPI } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'

const ROLES = [
  {
    value: 'farmer',
    label: 'Farmer',
    icon: Tractor,
    desc: 'Sell produce, check mandi rates, AI quality grading',
    color: 'border-emerald-500 bg-emerald-50/70 text-emerald-900',
  },
  {
    value: 'buyer',
    label: 'Buyer / Trader',
    icon: Building2,
    desc: 'Source verified bulk produce from farmers & FPOs',
    color: 'border-blue-500 bg-blue-50/70 text-blue-900',
  },
  {
    value: 'fpo',
    label: 'FPO / Group',
    icon: Users,
    desc: 'Aggregate crops, negotiate higher bulk prices',
    color: 'border-purple-500 bg-purple-50/70 text-purple-900',
  },
]

const STATES = [
  'Andhra Pradesh', 'Bihar', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha',
  'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi NCR', 'Other',
]

const INITIAL = {
  full_name: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
  role: 'farmer',
  state: 'Maharashtra',
  district: 'Nashik',
  business_name: '',
  fpo_name: '',
  land_area_acres: '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const login = useAuthStore((s) => s.login)
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.full_name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }
    if (!form.phone.trim()) {
      toast.error('Please enter your contact phone number')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const { confirm, ...payload } = form
      const res = await authAPI.register(payload)
      const data = res?.data

      toast.success('🎉 Account created successfully! Logging you in...', { duration: 3000 })

      // Auto login newly registered account so the user can immediately experience the platform
      if (data) {
        login({
          ...data,
          access_token: data.access_token || 'jwt-token-new-' + Date.now(),
          role: form.role,
          full_name: form.full_name,
        })
      }

      setTimeout(() => {
        if (form.role === 'buyer') navigate('/buyer-dashboard')
        else navigate('/farmer-dashboard')
      }, 500)
    } catch (err) {
      console.error('Registration failed:', err)
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to create account. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 flex items-center justify-center p-4 py-8">
      {/* Background ambient decorative shapes */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-10 right-10 w-96 h-96 bg-emerald-200/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-blob delay-200" />
      </div>

      <div className="relative w-full max-w-xl animate-fade-in-up">
        {/* Header */}
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
          <p className="text-gray-600 text-sm">Join 10,000+ farmers & buyers getting fair agricultural prices</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 p-7 sm:p-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                Select Your Role <span className="text-emerald-600">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  const active = form.role === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set('role', r.value)}
                      className={`p-3.5 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md active:scale-95 flex flex-col justify-between ${
                        active
                          ? `${r.color} shadow-sm ring-2 ring-brand-500/20`
                          : 'border-gray-200 bg-gray-50/50 hover:bg-white text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon size={18} className={active ? 'text-brand-700' : 'text-gray-500'} />
                        {active && <CheckCircle2 size={16} className="text-brand-600" />}
                      </div>
                      <div className="font-bold text-sm">{r.label}</div>
                      <div className="text-[11px] text-gray-500 mt-1 leading-tight line-clamp-2">{r.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Full Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Mobile Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="input-field"
                  required
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="ramesh@example.com"
                className="input-field"
                required
                autoComplete="email"
              />
            </div>

            {/* State & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  State <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.state}
                  onChange={(e) => set('state', e.target.value)}
                  className="input-field cursor-pointer"
                  required
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  District / Tehsil
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  placeholder="e.g. Nashik / Niphad"
                  className="input-field"
                />
              </div>
            </div>

            {/* Role-specific optional fields */}
            {form.role === 'buyer' && (
              <div className="animate-fade-in-down">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Business / Firm Name
                </label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => set('business_name', e.target.value)}
                  placeholder="e.g. Agro Commodities Pvt Ltd"
                  className="input-field"
                />
              </div>
            )}

            {form.role === 'farmer' && (
              <div className="animate-fade-in-down">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Land Holding Area (Acres)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.land_area_acres}
                  onChange={(e) => set('land_area_acres', e.target.value)}
                  placeholder="e.g. 5.5"
                  className="input-field"
                />
              </div>
            )}

            {/* Password and Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => set('password', e.target.value)}
                  placeholder="At least 6 characters"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={form.confirm}
                  onChange={(e) => set('confirm', e.target.value)}
                  placeholder="Re-enter password"
                  className="input-field"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Creating your account…</span>
                </>
              ) : (
                <>
                  <span>Create Account & Get Started</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                Sign In here
              </Link>
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>No credit card required · Free for Indian farmers & FPOs</span>
        </div>
      </div>
    </div>
  )
}
