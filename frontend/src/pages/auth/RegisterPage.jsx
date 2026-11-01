import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Leaf,
  Loader2,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Tractor,
  Users,
  Shield,
  KeyRound,
  Check,
  Navigation,
} from 'lucide-react'
import { authAPI, getApiBaseUrl } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import { STATE_DISTRICTS } from '../../data/stateDistricts'

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
  const [detectingLocation, setDetectingLocation] = useState(false)

  // OTP Verification state for APMC Admin
  const [otpSent, setOtpSent] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [previewOtp, setPreviewOtp] = useState('')
  const [otpCooldown, setOtpCooldown] = useState(0)

  const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }))

  const handleStateChange = (newState) => {
    const districts = STATE_DISTRICTS[newState] || ['Other']
    setForm((prev) => ({
      ...prev,
      state: newState,
      district: districts[0] || 'Other',
    }))
  }

  const handleDetectGpsLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
          if (res.ok) {
            const data = await res.json()
            const addr = data.address || {}
            const detectedState = addr.state || ''
            const detectedDistrict = addr.state_district || addr.county || addr.city || ''

            const matchedState = STATES.find(s =>
              detectedState.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(detectedState.toLowerCase())
            )
            if (matchedState) {
              const districts = STATE_DISTRICTS[matchedState] || ['Other']
              const matchedDistrict = districts.find(d =>
                detectedDistrict.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(detectedDistrict.toLowerCase())
              ) || districts[0]
              setForm(f => ({ ...f, state: matchedState, district: matchedDistrict }))
              toast.success(`Location detected: ${matchedDistrict}, ${matchedState}`, { icon: '📍' })
              setDetectingLocation(false)
              return
            }
          }
        } catch {}

        // Fallback heuristic for major agri belts
        let fallbackState = 'Maharashtra'
        let fallbackDistrict = 'Nashik'
        if (lat >= 21 && lat <= 26 && lng >= 74 && lng <= 82) {
          fallbackState = 'Madhya Pradesh'
          fallbackDistrict = 'Sehore'
        } else if (lat >= 19 && lat <= 22 && lng >= 82 && lng <= 87) {
          fallbackState = 'Odisha'
          fallbackDistrict = 'Cuttack'
        } else if (lat >= 28 && lat <= 32) {
          fallbackState = 'Punjab'
          fallbackDistrict = 'Amritsar'
        } else if (lat >= 12 && lat <= 18) {
          fallbackState = 'Karnataka'
          fallbackDistrict = 'Kolar'
        }
        setForm(f => ({ ...f, state: fallbackState, district: fallbackDistrict }))
        toast.success(`Location set from GPS: ${fallbackDistrict}, ${fallbackState}`, { icon: '📍' })
        setDetectingLocation(false)
      },
      (err) => {
        setDetectingLocation(false)
        toast.error('Could not access location: ' + err.message)
      },
      { timeout: 8000 }
    )
  }

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!form.email || !form.email.includes('@')) {
      toast.error('Please enter a valid email address first to receive OTP.')
      return
    }

    setSendingOtp(true)
    try {
      const res = await authAPI.sendOtp(form.email, form.phone, 'APMC Administrator Registration')
      setOtpSent(true)
      if (res.preview_otp) {
        setPreviewOtp(res.preview_otp)
      }
      toast.success(res.message || 'OTP verification code sent successfully!', { icon: '📧' })
      setOtpCooldown(45)
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
      toast.error(err.response?.data?.detail || 'Failed to dispatch OTP. Please check email address.')
    } finally {
      setSendingOtp(false)
    }
  }

  // Verify OTP handler
  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) {
      toast.error('Please enter the 6-digit OTP received on email.')
      return
    }

    setVerifyingOtp(true)
    try {
      const res = await authAPI.verifyOtp(form.email, otpCode)
      if (res.verified) {
        setOtpVerified(true)
        toast.success('Admin identity verified via OTP! You may now submit registration.', { icon: '✅' })
      } else {
        toast.error('Invalid or expired OTP code.')
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'OTP verification failed. Please try again.')
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
    if (!form.email.trim()) {
      toast.error('Please enter your email')
      return
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match')
      return
    }

    // Strict validation for APMC Admin role
    if (form.role === 'admin' && !otpVerified) {
      toast.error('APMC Admin registration requires email OTP verification before submitting.')
      return
    }

    setLoading(true)
    try {
      const raw = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
        full_name: form.full_name.trim(),
        role: form.role,
        phone: form.phone.trim() || undefined,
        state: form.state || undefined,
        district: form.district || undefined,
      }

      const res = await authAPI.register(raw)
      const data = res?.data || {}

      if (res.isOffline) {
        toast.success(`Account created! Mode: Offline demo data.`, { icon: '🌱' })
      } else {
        toast.success(`Account created successfully! Welcome to MandiSetu, ${form.full_name}.`, { icon: '🎉' })
      }

      // Auto login newly registered account
      const userSession = {
        id: data.id || `usr-local-${Date.now()}`,
        access_token: data.access_token || `jwt-token-local-${Date.now()}`,
        token_type: 'bearer',
        role: data.role || form.role,
        full_name: data.full_name || form.full_name,
        email: data.email || form.email,
        phone: data.phone || form.phone,
        state: data.state || form.state,
        district: data.district || form.district,
        is_verified: true,
        source: res.isOffline ? 'local_offline' : 'postgres_cloud',
      }

      login(userSession)

      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 350)
    } catch (err) {
      const detail = err.response?.data?.detail
      let msg = 'Registration failed. Please check details.'
      if (typeof detail === 'string') msg = detail
      else if (Array.isArray(detail)) msg = detail.map((d) => d.msg).join(', ')
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const roleConfigs = [
    {
      value: 'farmer',
      label: t('reg_role_farmer') || 'Farmer',
      icon: Tractor,
      desc: t('reg_role_farmer_desc') || 'Sell produce, check mandi rates, AI quality grading',
      color: 'border-emerald-500 bg-emerald-50/70 text-emerald-900',
    },
    {
      value: 'buyer',
      label: t('reg_role_buyer') || 'Buyer / Trader',
      icon: Building2,
      desc: t('reg_role_buyer_desc') || 'Source verified bulk produce from farmers & FPOs',
      color: 'border-blue-500 bg-blue-50/70 text-blue-900',
    },
    {
      value: 'fpo',
      label: t('reg_role_fpo') || 'FPO / Group',
      icon: Users,
      desc: t('reg_role_fpo_desc') || 'Aggregate crops, negotiate higher bulk prices',
      color: 'border-purple-500 bg-purple-50/70 text-purple-900',
    },
    {
      value: 'admin',
      label: t('reg_role_admin') || 'APMC Admin',
      icon: Shield,
      desc: t('reg_role_admin_desc') || 'APMC Mandi Administrator (OTP verification required)',
      color: 'border-amber-500 bg-amber-50/70 text-amber-900',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-green-100 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 flex items-center justify-center p-4 py-8">
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
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">MandiSetu</span>
              <span className="block text-xs font-semibold text-brand-600 tracking-wider uppercase">Market Intelligence</span>
            </div>
          </Link>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t('reg_subtitle') || 'Join 10,000+ farmers & buyers getting fair agricultural prices'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-xl border border-white/60 dark:border-gray-800 p-7 sm:p-9">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role selector */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5">
                {t('reg_select_role') || 'Select Your Role'} <span className="text-emerald-600">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {roleConfigs.map((r) => {
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
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-white text-gray-700 dark:text-gray-300'
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
                      {t('reg_admin_otp_box') || 'APMC Admin Security Gate (OTP Verification Required)'}
                    </span>
                  </div>
                  {otpVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                      <Check size={13} className="text-emerald-700" />
                      {t('reg_otp_verified') || 'Verified'}
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-amber-700">
                      {t('reg_otp_pending') || 'Verification Pending'}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                  {t('reg_admin_otp_info') || 'Administrator registration requires email OTP verification. Once created, operational authorities and permissions are assigned and controlled by Admin(TanmayA).'}
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
                        <span>{otpSent ? (otpCooldown > 0 ? `Resend OTP (${otpCooldown}s)` : 'Resend OTP') : (t('reg_send_otp') || 'Send Verification Code (OTP)')}</span>
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
                          placeholder={t('reg_otp_placeholder') || 'Enter 6-digit OTP'}
                          className="input-field text-center font-mono tracking-widest text-sm font-bold max-w-[170px]"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={verifyingOtp || otpCode.length < 4}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1"
                        >
                          {verifyingOtp ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                          <span>{t('reg_verify_otp') || 'Verify OTP'}</span>
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('reg_full_name') || 'Full Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => set('full_name', e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  className="input-field"
                  required
                  autoComplete="name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('reg_phone') || 'Phone Number'}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="input-field"
                  autoComplete="tel"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                {t('reg_email') || 'Email Address'} <span className="text-red-500">*</span>
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

            {/* State & District with GPS auto-detect button */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                    {t('reg_state') || 'State'} <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleDetectGpsLocation}
                    disabled={detectingLocation}
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Navigation size={11} className={detectingLocation ? 'animate-spin' : ''} />
                    <span>{detectingLocation ? 'Detecting...' : (t('reg_gps_detect') || 'Detect GPS')}</span>
                  </button>
                </div>
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('reg_district') || 'District / Tehsil'} <span className="text-red-500">*</span>
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('reg_org') || 'Business / Firm Name'}
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('reg_password') || 'Password'} <span className="text-red-500">*</span>
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
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('reg_confirm_password') || 'Confirm Password'} <span className="text-red-500">*</span>
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
                  <span>{t('reg_submit') || 'Create Account & Get Started'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('reg_already_have') || 'Already have an account?'}{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                {t('reg_sign_in') || 'Sign In here'}
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
