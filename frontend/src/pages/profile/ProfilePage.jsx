import { useState } from 'react'
import {
  User, Mail, Phone, MapPin, KeyRound, Save, ShieldCheck,
  CheckCircle2, Sparkles, AlertCircle, Building2, Eye, EyeOff,
  Zap, Crown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import { updateLocalUser, ROLE_AVAILABLE_POWERS } from '../../api/modules'
import { STATE_DISTRICTS } from '../../data/stateDistricts'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const { t } = useLangStore()

  const [form, setForm] = useState({
    full_name: user?.full_name || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    state: user?.state || 'Maharashtra',
    district: user?.district || 'Nashik',
    village: user?.village || 'Lasalgaon',
    land_area_acres: user?.land_area_acres || 5.0,
    crops: user?.crops || 'Wheat, Soybean, Onion',
    role: user?.role || 'farmer',
  })

  const handleStateChange = (newState) => {
    const districts = STATE_DISTRICTS[newState] || ['Other']
    setForm((f) => ({
      ...f,
      state: newState,
      district: districts[0] || 'Other',
    }))
  }

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleProfileSave = (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // Update local storage database
      updateLocalUser(user?.email, form)
      // Update global auth store
      updateProfile(form)

      toast.success('Profile details updated successfully!', { icon: '🌾' })
    } catch (err) {
      toast.error('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = (e) => {
    e.preventDefault()
    if (!passwords.newPassword) {
      toast.error('Please enter a new password')
      return
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match!')
      return
    }
    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      updateLocalUser(user?.email, { password: passwords.newPassword })
      toast.success('Password changed successfully!', { icon: '🔒' })
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error('Failed to update password')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-brand-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-extrabold shadow-inner">
              {user?.full_name?.[0] || user?.name?.[0] || '🌾'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user?.full_name || user?.name || 'Registered User'}</h1>
                {(user?.isOwner || user?.isAdminTanmaya) && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-400 text-amber-950">
                    👑 Admin(TanmayA)
                  </span>
                )}
              </div>
              <p className="text-emerald-100 text-xs mt-0.5 font-mono">
                {user?.email || 'farmer@mandisetu.in'} · Role: <span className="capitalize font-semibold">{user?.role || 'farmer'}</span>
              </p>
            </div>
          </div>

          <div className="px-3.5 py-1.5 rounded-xl bg-white/10 backdrop-blur-sm text-xs font-medium border border-white/20">
            Account ID: <span className="font-mono text-emerald-200">{user?.user_id || user?.id || 'usr_active'}</span>
          </div>
        </div>
      </div>

      {/* ── Operational Authority & Powers Card ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap size={18} className="text-amber-500 fill-amber-500" />
              <span>Platform Authority & Operational Privileges</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Verified operational powers certified and provisioned by <strong>Admin(TanmayA)</strong>.
            </p>
          </div>

          {user?.isOwner || user?.isAdminTanmaya || user?.username === 'TanmayA' ? (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1.5 self-start sm:self-auto">
              👑 Master Root Authority
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800 inline-flex items-center gap-1.5 self-start sm:self-auto">
              <CheckCircle2 size={13} />
              {user?.powers?.length || 0} Powers Active
            </span>
          )}
        </div>

        {user?.isOwner || user?.isAdminTanmaya || user?.username === 'TanmayA' ? (
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-center gap-3">
            <span className="text-2xl">👑</span>
            <div className="text-xs text-amber-900 dark:text-amber-200">
              <p className="font-bold">Unrestricted Platform Root Clearance</p>
              <p className="text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                You possess full governance authority: overriding market prices, settling grievances, decrypting credentials, and provisioning powers to any user.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(ROLE_AVAILABLE_POWERS[user?.role || 'farmer'] || []).map((power) => {
              const isGranted = user?.powers?.includes(power.id)
              return (
                <div
                  key={power.id}
                  className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                    isGranted
                      ? 'border-brand-300 dark:border-brand-800 bg-brand-50/40 dark:bg-brand-950/20 shadow-xs'
                      : 'border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/20 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xl p-1 bg-white dark:bg-gray-800 rounded-lg shadow-xs">
                      {power.icon}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                        isGranted
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}
                    >
                      {isGranted ? 'ACTIVE' : 'STANDARD'}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                      {power.label}
                    </h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                      {power.desc}
                    </p>
                  </div>
                  {isGranted && (
                    <div className="text-[9px] font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1 pt-1 border-t border-brand-100 dark:border-brand-900/50">
                      <CheckCircle2 size={10} /> Certified by Admin(TanmayA)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info Edit Form */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <User size={18} className="text-brand-600" />
                <span>Personal & Farm Details</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Keep your location and crops updated for accurate local mandi rate alerts.
              </p>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 text-sm cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Primary State
                </label>
                <select
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {Object.keys(STATE_DISTRICTS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  District
                </label>
                <select
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 cursor-pointer"
                >
                  {(STATE_DISTRICTS[form.state] || ['Other']).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Village / Tehsil
                </label>
                <input
                  type="text"
                  value={form.village}
                  onChange={e => setForm(f => ({ ...f, village: e.target.value }))}
                  placeholder="e.g. Lasalgaon, Bhamashah"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Land Area (Acres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={form.land_area_acres}
                  onChange={e => setForm(f => ({ ...f, land_area_acres: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Primary Crops Cultivated
                </label>
                <input
                  type="text"
                  value={form.crops}
                  onChange={e => setForm(f => ({ ...f, crops: e.target.value }))}
                  placeholder="Wheat, Rice, Cotton, Soybean"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="mt-4 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
              <Save size={16} />
              <span>Save Profile Changes</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <KeyRound size={17} className="text-amber-500" />
              <span>Change Password</span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Update your account password securely.
            </p>

            <form onSubmit={handlePasswordChange} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwords.newPassword}
                    onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwords.confirmPassword}
                  onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gray-900 hover:bg-black dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-xl font-bold text-xs shadow hover:scale-[1.01] transition-all"
              >
                Update Password
              </button>
            </form>
          </div>

          {/* Quick Info Box */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-3xl p-5 text-xs space-y-2 text-emerald-900 dark:text-emerald-300">
            <div className="font-bold flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Data Protection & Privacy</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Your agricultural information is strictly used for MSP benchmarking and connecting with verified local APMC buyers.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
