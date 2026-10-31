import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Leaf,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Building2,
  Tractor,
  Users,
  Shield,
  KeyRound,
  Check,
} from 'lucide-react'
import { authAPI, getApiBaseUrl } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import { STATE_DISTRICTS } from '../../data/stateDistricts'

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
  {
    value: 'admin',
    label: 'APMC Admin',
    icon: Shield,
    desc: 'APMC Mandi Administrator (OTP verification required)',
    color: 'border-amber-500 bg-amber-50/70 text-amber-900',
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
  const { t } = useLangStore()
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)

  // OTP Verification state for APMC Admin
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [previewOtp, setPreviewOtp] = useState('')
  const [otpCooldown, setOtpCooldown] = useState(0)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleStateChange = (newState) => {
    const districts = STATE_DISTRICTS[newState] || ['Other']
    setForm((f) => ({
      ...f,
      state: newState,
      district: districts[0] || 'Other',
    }))
  }

  const handleSendOtp = async () => {
    if (!form.email || !form.email.includes('@')) {
      toast.error('Please enter a valid email address first to receive your verification OTP')
      return
    }
    setSendingOtp(true)
    try {
      const res = await authAPI.sendOtp({ email: form.email, phone: form.phone, purpose: 'admin_registration' })
      setOtpSent(true)
      if (res?.preview_otp) {
        setPreviewOtp(res.preview_otp)
      }
      toast.success(res?.message || 'OTP verification code sent!')
      setOtpCooldown(60)
      const interval = setInterval(() => {
        setOtpCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to send OTP')
    } finally {
      setSendingOtp(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.trim().length !== 6) {
      toast.error('Please enter the 6-digit OTP code')
      return
    }
    setVerifyingOtp(true)
    try {
      await authAPI.verifyOtp({ email: form.email, otp: otpCode.trim() })
      setOtpVerified(true)
      toast.success('🛡️ APMC Admin Identity verified via OTP!')
    } catch (err) {
      toast.error(err?.message || err?.response?.data?.detail || 'Invalid or expired OTP')
    } finally {
      setVerifyingOtp(false)
    }
  }

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
    if (form.role === 'admin' && !otpVerified) {
      toast.error('🛡️ APMC Admin accounts require mandatory OTP verification before creation.', { icon: '🔒' })
      return
    }

    setLoading(true)
    try {
      const { confirm, ...raw } = form
      const payload = {
        full_name: raw.full_name.trim(),
        email: raw.email.trim().toLowerCase(),
        phone: raw.phone.trim() || undefined,
        password: raw.password,
        role: raw.role || 'farmer',
        state: raw.state || undefined,
        district: raw.district || undefined,
      }
      if (raw.land_area_acres && !isNaN(parseFloat(raw.land_area_acres))) {
        payload.land_area_acres = parseFloat(raw.land_area_acres)
      }
      if (raw.business_name?.trim()) payload.business_name = raw.business_name.trim()
      if (raw.fpo_name?.trim()) payload.fpo_name = raw.fpo_name.trim()

      const res = await authAPI.register(payload)
      const data = res?.data

      if (res?.isOffline) {
        toast.success('🌾 Account created (saved locally & queued for cloud sync)!', { duration: 4000, icon: '💾' })
      } else {
        toast.success('🎉 Account created and saved to cloud database! Logging in...', { duration: 3000, icon: '☁️' })
      }

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
        else if (form.role === 'admin') navigate('/admin')
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ROLES.map((r) => {
                  const Icon = r.icon
                  const active = form.role === r.value
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => set('role', r.value)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all duration-200 hover:shadow-md active:scale-95 flex flex-col justify-between ${
                        active
                          ? `${r.color} shadow-sm ring-2 ring-brand-500/20`
                          : 'border-gray-200 bg-gray-50/50 hover:bg-white text-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Icon size={18} className={active ? 'text-brand-700' : 'text-gray-500'} />
                        {active && <CheckCircle2 size={16} className="text-brand-600" />}
                      </div>
                      <div className="font-bold text-xs sm:text-sm">{r.label}</div>
                      <div className="text-[10px] text-gray-500 mt-1 leading-tight line-clamp-2">{r.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* APMC Admin Mandatory Security & OTP Verification Box */}
            {form.role === 'admin' && (
              <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3 animate-fade-in-down">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="text-amber-600" size={18} />
                    <span className="font-bold text-xs text-amber-900 dark:text-amber-300">
                      APMC Admin Security Gate (OTP Verification Required)
                    </span>
                  </div>
                  {otpVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      <Check size={13} className="text-emerald-700" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700">Verification Pending</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                  Administrator registration requires email OTP verification. Once created, operational authorities and permissions are assigned and controlled by Admin(TanmayA).
                </p>

                {!otpVerified && (
                  <div className="space-y-2.5 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={sendingOtp || otpCooldown > 0}
                        className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                      >
                        {sendingOtp ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <KeyRound size={14} />
                        )}
                        <span>{otpSent ? (otpCooldown > 0 ? `Resend OTP (${otpCooldown}s)` : 'Resend OTP') : 'Send OTP to Email'}</span>
                      </button>

                      {previewOtp && (
                        <button
                          type="button"
                          onClick={() => { setOtpCode(previewOtp); toast.success('Filled preview OTP!') }}
                          className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[11px] font-mono font-bold transition flex items-center gap-1"
                          title="Click to auto-fill preview OTP"
                        >
                          <span>Preview Code: {previewOtp} (Click to fill)</span>
                        </button>
                      )}
                    </div>

                    {otpSent && (
                      <div className="flex gap-2 pt-1 animate-fade-in">
                        <input
                          type="text"
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter 6-digit OTP"
                          className="input-field text-center font-mono tracking-widest text-sm font-bold max-w-[170px]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otpCode.length !== 6}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition shadow-sm flex items-center gap-1.5"
                        >
                          {verifyingOtp ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                          <span>Verify OTP</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
                  onChange={(e) => handleStateChange(e.target.value)}
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
                  District / Tehsil <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.district}
                  onChange={(e) => set('district', e.target.value)}
                  className="input-field cursor-pointer"
                  required
                >
                  {(STATE_DISTRICTS[form.state] || ['Other']).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
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

        <div className="flex flex-col items-center justify-center gap-1 text-xs text-gray-500 mt-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>No credit card required · Free for Indian farmers & FPOs</span>
          </div>
          <span className="text-[10px] text-gray-400 font-mono">
            Database Server: {getApiBaseUrl()}
          </span>
        </div>
      </div>
    </div>
  )
}
