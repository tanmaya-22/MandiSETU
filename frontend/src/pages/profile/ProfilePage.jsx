import { useState } from 'react'
import {
  User, Mail, Phone, MapPin, KeyRound, Save, ShieldCheck,
  CheckCircle2, Sparkles, AlertCircle, Building2, Eye, EyeOff
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { updateLocalUser } from '../../api/modules'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()

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
                <input
                  type="text"
                  value={form.state}
                  onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                  placeholder="e.g. Maharashtra, Punjab, Odisha"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={form.district}
                  onChange={e => setForm(f => ({ ...f, district: e.target.value }))}
                  placeholder="e.g. Nashik, Indore, Cuttack"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
                />
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
