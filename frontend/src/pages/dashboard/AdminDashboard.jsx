import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  BarChart2, Users, Package, TrendingUp, IndianRupee,
  ShieldCheck, AlertTriangle, Activity, Download, Mail, Phone,
  Calendar, CheckCircle, RefreshCw, UserCheck, Lock, Unlock,
  Sliders, Award, MessageSquare, FileText, CheckCircle2, XCircle, ChevronRight,
  Zap, Sparkles, Check, Crown, Server, Globe, Wifi, WifiOff
} from 'lucide-react'
import {
  analyticsAPI,
  authAPI,
  getLocalUsers,
  saveLocalUser,
  ROLE_AVAILABLE_POWERS,
  updateUserPowers,
  hasUserPower,
  getApiBaseUrl,
  setApiBaseUrl,
  systemAPI
} from '../../api/modules'
import { useAuthStore } from '../../store/authStore'
import { StatCard, PageHeader } from '../../components/common/UI'

const MOCK_ANALYTICS = {
  total_farmers: 10432,
  total_buyers: 2841,
  total_lots: 8921,
  active_lots: 1203,
  total_transactions: 5672,
  total_value: 52_40_00_000,
  disputes_open: 14,
  avg_reliability_score: 88,
  top_commodities: [
    { commodity: 'Wheat', total_lots: 2300, total_value: 1_80_00_000 },
    { commodity: 'Tomato', total_lots: 1800, total_value: 1_20_00_000 },
    { commodity: 'Onion', total_lots: 1500, total_value: 95_00_000 },
    { commodity: 'Rice', total_lots: 1200, total_value: 85_00_000 },
    { commodity: 'Potato', total_lots: 900, total_value: 55_00_000 },
  ],
}

const INITIAL_GRIEVANCES = [
  { id: 'GRV-101', farmer: 'Ramesh Patel', buyer: 'AgroCorp Traders', type: 'Payment Delay', amount: 48500, status: 'open', date: '2026-10-29', description: 'Buyer delayed escrow release by 4 days after delivery confirmation.' },
  { id: 'GRV-102', farmer: 'Suresh Kumar', buyer: 'KisanDirect APMC', type: 'Quality Rejection', amount: 32000, status: 'escalated', date: '2026-10-28', description: 'Buyer claimed Grade C despite certified moisture reading of 11.2%.' },
  { id: 'GRV-103', farmer: 'Pooja Devi', buyer: 'MandiTrade Ltd', type: 'Transit Spoilage', amount: 21500, status: 'resolved', date: '2026-10-25', description: 'Freight vehicle delayed 36 hours in transit, resulting in tomato weight loss.' },
  { id: 'GRV-104', farmer: 'Arjun Sen', buyer: 'Bengal Agro Corp', type: 'Cess Deduction', amount: 14200, status: 'open', date: '2026-10-30', description: 'Unauthorized 2.5% unloading fee charged at mandi gateway.' },
]

const INITIAL_BUYERS = [
  { id: 'BUY-201', name: 'AgroCorp Traders Ltd', rating: 4.6, deals: 342, disputes: 1, state: 'Maharashtra', reliability: 'A+' },
  { id: 'BUY-202', name: 'GrainTech Global', rating: 3.2, deals: 89, disputes: 6, state: 'Punjab', reliability: 'B' },
  { id: 'BUY-203', name: 'FreshVeggies Hub', rating: 4.8, deals: 512, disputes: 0, state: 'Karnataka', reliability: 'A+' },
  { id: 'BUY-204', name: 'Eastern Agri Logistics', rating: 2.9, deals: 45, disputes: 8, state: 'Odisha', reliability: 'C' },
]

const INITIAL_LOTS = [
  { id: 'LOT-901', farmer: 'Ramesh Patel', commodity: 'Wheat (Lokwan)', currentGrade: 'A', quantity: '150 Qtl', mandi: 'Indore Mandi' },
  { id: 'LOT-902', farmer: 'Manoj Singh', commodity: 'Onion (Red)', currentGrade: 'B', quantity: '320 Qtl', mandi: 'Lasalgaon APMC' },
  { id: 'LOT-903', farmer: 'Gurpreet Kaur', commodity: 'Basmati Rice (1121)', currentGrade: 'A+', quantity: '240 Qtl', mandi: 'Karnal Market' },
  { id: 'LOT-904', farmer: 'Bikash Mohanty', commodity: 'Paddy', currentGrade: 'C', quantity: '80 Qtl', mandi: 'Cuttack Mandi' },
]

export default function AdminDashboard() {
  const { user } = useAuthStore()

  // Strict check if currently logged-in user is Admin(TanmayA)
  const isOwner =
    user?.isOwner === true ||
    user?.isAdminTanmaya === true ||
    user?.email?.toLowerCase() === 'tanmayapradhan2322@gmail.com' ||
    user?.username === 'TanmayA' ||
    user?.name === 'TanmayA' ||
    user?.full_name?.includes('TanmayA')

  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState(MOCK_ANALYTICS)
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [grievances, setGrievances] = useState(INITIAL_GRIEVANCES)
  const [buyers, setBuyers] = useState(INITIAL_BUYERS)
  const [lots, setLots] = useState(INITIAL_LOTS)
  const [auditLog, setAuditLog] = useState([])
  const [loading, setLoading] = useState(true)

  // Selected User for Granting / Revoking Powers
  const [selectedUserForPowers, setSelectedUserForPowers] = useState(null)
  const [customPowers, setCustomPowers] = useState([])
  const [powerAuditReason, setPowerAuditReason] = useState('Official accreditation verified by Admin(TanmayA)')
  const [savingPowers, setSavingPowers] = useState(false)

  // Pivotal Action Modals
  const [pivotalModal, setPivotalModal] = useState(null)
  const [permissionDeniedModal, setPermissionDeniedModal] = useState(false)
  const [deniedActionName, setDeniedActionName] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideValue, setOverrideValue] = useState('')

  // Hover Tooltip for demo encrypted mode
  const [hoveredEncryptedId, setHoveredEncryptedId] = useState(null)

  // Cloud Backend / Cross-Device Sync State
  const [backendHealth, setBackendHealth] = useState({ checked: false, ok: false, latency: 0, url: getApiBaseUrl() })
  const [checkingHealth, setCheckingHealth] = useState(false)
  const [customApiUrlInput, setCustomApiUrlInput] = useState(getApiBaseUrl())
  const [showApiSettings, setShowApiSettings] = useState(false)

  const checkBackendStatus = async (showToast = false) => {
    setCheckingHealth(true)
    if (showToast) {
      toast.loading('Checking Render PostgreSQL backend connection (waking server if asleep)...', { id: 'health-check' })
    }
    const res = await systemAPI.checkBackendHealth()
    setBackendHealth({
      checked: true,
      ok: res.ok,
      latency: res.latency || 0,
      url: res.url,
      error: res.error || res.dbError,
      usersCount: res.usersCount,
      isLocalhost: res.isLocalhost,
      warning: res.warning,
      dbStatus: res.dbStatus,
    })
    setCheckingHealth(false)
    if (showToast) {
      if (res.isLocalhost) {
        toast.error('⚠️ Render DATABASE_URL is not set! Pointing to localhost.', { id: 'health-check', duration: 10000 })
      } else if (res.ok) {
        toast.success(`Connected! Render backend online (${res.latency}ms latency, ${res.usersCount ?? 0} DB users).`, { id: 'health-check' })
      } else {
        toast.error(`Backend unreachable: ${res.error || res.dbError}. Check your Render URL.`, { id: 'health-check', duration: 8000 })
      }
    }
    return res
  }

  const handleSaveApiUrl = async () => {
    setApiBaseUrl(customApiUrlInput)
    const cleaned = getApiBaseUrl()
    setCustomApiUrlInput(cleaned)
    toast.success(`Backend URL updated to: ${cleaned}`, { icon: '🔌' })
    setShowApiSettings(false)
    await checkBackendStatus(true)
    await loadAllData()
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      // 1. Users — Fetch from PostgreSQL backend + merge with local demo users
      let usersList = []
      try {
        usersList = await authAPI.fetchAllUsers()
      } catch {
        usersList = getLocalUsers()
      }
      if (!usersList || usersList.length === 0) {
        usersList = getLocalUsers()
      }
      setRegisteredUsers(usersList)

      // Keep selected user in sync with updated list
      if (!selectedUserForPowers && usersList.length > 0) {
        setSelectedUserForPowers(usersList[0])
        setCustomPowers(usersList[0].powers || [])
      } else if (selectedUserForPowers) {
        const found = usersList.find(
          (u) =>
            u.email?.toLowerCase() === selectedUserForPowers.email?.toLowerCase() ||
            u.username?.toLowerCase() === selectedUserForPowers.username?.toLowerCase()
        )
        if (found) {
          setSelectedUserForPowers(found)
          setCustomPowers(found.powers || [])
        }
      }

      // 2. Feedbacks
      const rawFb = localStorage.getItem('mandisetu_user_feedbacks')
      if (rawFb) {
        setFeedbacks(JSON.parse(rawFb))
      }

      // 3. Audits
      const rawAudit = localStorage.getItem('mandisetu_admin_audits')
      if (rawAudit) {
        setAuditLog(JSON.parse(rawAudit))
      }
    } finally {
      setLoading(false)
    }
  }

  // Real-time synchronization across events
  useEffect(() => {
    loadAllData()
    checkBackendStatus(false)
    const handlePowersUpdated = () => {
      loadAllData()
    }
    window.addEventListener('mandisetu_powers_updated', handlePowersUpdated)
    return () => window.removeEventListener('mandisetu_powers_updated', handlePowersUpdated)
  }, [])

  // Derive live user record directly from persistent directory so powers are immediately fulfilled
  const liveUsers = getLocalUsers()
  const liveCurrentUser = liveUsers.find(
    (u) =>
      (user?.email && u.email?.toLowerCase() === user.email?.toLowerCase()) ||
      (user?.username && u.username?.toLowerCase() === user.username?.toLowerCase()) ||
      (user?.user_id && (u.id === user.user_id || u.user_id === user.user_id)) ||
      (user?.full_name && u.full_name?.toLowerCase() === user.full_name?.toLowerCase())
  )

  const effectivePowers = isOwner ? ['all'] : (liveCurrentUser?.powers || user?.powers || [])
  const effectiveUser = {
    ...user,
    ...liveCurrentUser,
    powers: effectivePowers,
  }

  // Operational powers granted to the current user session (dynamic RBAC)
  const canExportCSV = isOwner || hasUserPower(effectiveUser, 'csv_export')
  const canDecryptPII = isOwner || hasUserPower(effectiveUser, 'decrypt_pii')
  const canArbitrateDisputes = isOwner || hasUserPower(effectiveUser, 'dispute_resolution')
  const canOverrideQuality = isOwner || hasUserPower(effectiveUser, 'quality_override')
  const canOverridePrices = isOwner || hasUserPower(effectiveUser, 'price_override')
  const canManageUsers = isOwner || hasUserPower(effectiveUser, 'user_management')

  const logAuditAction = (action, target, details) => {
    const newEntry = {
      id: 'AUD-' + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      admin: isOwner ? 'TanmayA (Owner)' : (effectiveUser?.full_name || 'Demo Admin'),
      action,
      target,
      reason: details,
    }
    const updated = [newEntry, ...auditLog]
    setAuditLog(updated)
    localStorage.setItem('mandisetu_admin_audits', JSON.stringify(updated))
  }

  // Intercept pivotal works for demo admin
  const triggerPivotalAction = (actionName, callback) => {
    if (!isOwner) {
      setDeniedActionName(actionName)
      setPermissionDeniedModal(true)
      return
    }
    callback()
  }

  // Handle toggling an individual power for selected user with INSTANT AUTO-SAVE
  const handleTogglePower = (powerId) => {
    if (!isOwner) {
      setDeniedActionName('Modify User Authority & Powers')
      setPermissionDeniedModal(true)
      return
    }
    const newPowers = customPowers.includes(powerId)
      ? customPowers.filter((p) => p !== powerId)
      : [...customPowers, powerId]

    setCustomPowers(newPowers)

    if (selectedUserForPowers) {
      updateUserPowers(selectedUserForPowers.email, newPowers, powerAuditReason)
      // Sync to backend PostgreSQL
      const userId = selectedUserForPowers.id || selectedUserForPowers.user_id
      if (userId) {
        authAPI.updateUserPowersOnServer(userId, newPowers, powerAuditReason)
      }
      loadAllData()
      toast.success(
        `${newPowers.includes(powerId) ? 'Granted' : 'Revoked'} "${powerId.replace(/_/g, ' ')}" for ${selectedUserForPowers.full_name || selectedUserForPowers.email}`,
        { icon: '⚡' }
      )
    }
  }

  // Handle 1-click authority preset tiers with INSTANT AUTO-SAVE
  const handleApplyPreset = (presetType) => {
    if (!isOwner) {
      setDeniedActionName('Apply Platform Authority Preset Tier')
      setPermissionDeniedModal(true)
      return
    }
    const role = selectedUserForPowers?.role || 'farmer'
    const available = ROLE_AVAILABLE_POWERS[role] || []
    let newPowers = []
    if (presetType === 'standard') {
      newPowers = []
    } else if (presetType === 'pro') {
      newPowers = available.slice(0, 2).map((p) => p.id)
    } else if (presetType === 'vip') {
      newPowers = available.map((p) => p.id)
    }
    setCustomPowers(newPowers)

    if (selectedUserForPowers) {
      updateUserPowers(
        selectedUserForPowers.email,
        newPowers,
        `${presetType.toUpperCase()} Tier Preset applied by Admin(TanmayA)`
      )
      // Sync to backend PostgreSQL
      const userId = selectedUserForPowers.id || selectedUserForPowers.user_id
      if (userId) {
        authAPI.updateUserPowersOnServer(
          userId,
          newPowers,
          `${presetType.toUpperCase()} Tier Preset applied by Admin(TanmayA)`
        )
      }
      loadAllData()
      toast.success(
        `Applied ${presetType.toUpperCase()} Tier to ${selectedUserForPowers.full_name || selectedUserForPowers.email}`,
        { icon: '👑' }
      )
    }
  }

  // Save powers to persistent local directory AND backend PostgreSQL
  const handleSavePowers = () => {
    if (!isOwner) {
      setDeniedActionName('Commit Authority Configuration to Production')
      setPermissionDeniedModal(true)
      return
    }
    if (!selectedUserForPowers) return
    setSavingPowers(true)
    try {
      const ok = updateUserPowers(selectedUserForPowers.email, customPowers, powerAuditReason)
      if (ok) {
        // Sync to backend PostgreSQL
        const userId = selectedUserForPowers.id || selectedUserForPowers.user_id
        if (userId) {
          authAPI.updateUserPowersOnServer(userId, customPowers, powerAuditReason)
        }
        logAuditAction(
          'Authority Powers Configured',
          selectedUserForPowers.email,
          `Granted powers [${customPowers.join(', ') || 'Standard'}] with reason: ${powerAuditReason}`
        )
        toast.success(
          `Authority powers saved for ${selectedUserForPowers.full_name || selectedUserForPowers.email} (Certified by TanmayA)`,
          { icon: '⚡' }
        )
        loadAllData()
      } else {
        toast.error('Failed to update powers in directory')
      }
    } finally {
      setSavingPowers(false)
    }
  }

  // Toggle user suspension / verification (user_management power)
  const handleToggleUserStatus = (targetUser) => {
    if (!canManageUsers) {
      setDeniedActionName('Verify or Suspend User Account')
      setPermissionDeniedModal(true)
      return
    }
    const isCurrentlySuspended = targetUser.is_suspended === true || targetUser.is_active === false
    const newSuspended = !isCurrentlySuspended
    const updatedUser = { ...targetUser, is_suspended: newSuspended, is_verified: !newSuspended, is_active: !newSuspended }
    saveLocalUser(updatedUser)
    // Sync to backend PostgreSQL
    const userId = targetUser.id || targetUser.user_id
    if (userId) {
      authAPI.updateUserStatusOnServer(userId, { is_active: !newSuspended, is_verified: !newSuspended })
    }
    logAuditAction(
      newSuspended ? 'Suspend User Access' : 'Activate User Access',
      targetUser.email,
      `Access status modified by ${isOwner ? 'Admin(TanmayA)' : 'Authorized Demo Admin (Power: user_management)'}`
    )
    toast.success(
      `User ${targetUser.full_name || targetUser.email} is now ${newSuspended ? 'Suspended' : 'Active & Verified'}`,
      { icon: newSuspended ? '🚫' : '✅' }
    )
    loadAllData()
  }

  // CSV Export (with dynamic RBAC check)
  const handleExportCSV = () => {
    if (!canExportCSV) {
      setDeniedActionName('Export User Database CSV')
      setPermissionDeniedModal(true)
      return
    }
    const headers = ['User ID', 'Full Name', 'Email', 'Phone', 'Role', 'Source', 'State', 'District', 'Active Powers']
    const rows = registeredUsers.map((u) => [
      u.id || u.user_id || 'N/A',
      `"${u.full_name || ''}"`,
      u.email,
      u.phone || 'N/A',
      u.role || 'farmer',
      u.source === 'database' ? 'PostgreSQL Database' : 'Local Demo',
      u.state || 'N/A',
      u.district || 'N/A',
      `"${(u.powers || []).join('; ')}"`,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `mandisetu_users_tanmaya_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    logAuditAction(
      'CSV Export',
      'All Registered Users',
      isOwner ? 'Full platform user registry exported by TanmayA' : 'User registry exported by authorized Demo Admin (Power: csv_export)'
    )
    toast.success('Complete User Directory Exported (TanmayA Verified)')
  }

  // Grievance resolution (with dynamic RBAC check)
  const handleGrievanceAction = (grv, actionType) => {
    if (!canArbitrateDisputes) {
      setDeniedActionName(`${actionType.toUpperCase()} Grievance ${grv.id}`)
      setPermissionDeniedModal(true)
      return
    }
    setPivotalModal({
      type: 'grievance',
      item: grv,
      actionType,
      title: `${actionType === 'resolve' ? 'Resolve' : actionType === 'escalate' ? 'Escalate' : 'Delete'} Grievance ${grv.id}`,
    })
    setOverrideReason('')
  }

  const confirmGrievanceAction = () => {
    if (!overrideReason.trim()) {
      toast.error('Documented reason is mandatory for administrative action!')
      return
    }
    const { item, actionType } = pivotalModal
    if (actionType === 'delete') {
      setGrievances((prev) => prev.filter((g) => g.id !== item.id))
    } else {
      setGrievances((prev) =>
        prev.map((g) => (g.id === item.id ? { ...g, status: actionType === 'resolve' ? 'resolved' : 'escalated' } : g))
      )
    }
    logAuditAction(`Grievance ${actionType}`, item.id, `Reason: ${overrideReason}`)
    toast.success(`Grievance ${item.id} ${actionType}d with documented audit reason.`)
    setPivotalModal(null)
  }

  // Buyer Rating Override (with dynamic RBAC check)
  const handleBuyerOverride = (buyer) => {
    if (!canOverridePrices) {
      setDeniedActionName(`Override Rating for ${buyer.name}`)
      setPermissionDeniedModal(true)
      return
    }
    setPivotalModal({
      type: 'buyer',
      item: buyer,
      title: `Override Reliability Score: ${buyer.name}`,
    })
    setOverrideValue(String(buyer.rating))
    setOverrideReason('')
  }

  const confirmBuyerOverride = () => {
    if (!overrideReason.trim()) {
      toast.error('Documented reason is mandatory!')
      return
    }
    const val = parseFloat(overrideValue)
    if (isNaN(val) || val < 1 || val > 5) {
      toast.error('Rating must be between 1.0 and 5.0')
      return
    }
    setBuyers((prev) => prev.map((b) => (b.id === pivotalModal.item.id ? { ...b, rating: val } : b)))
    logAuditAction('Buyer Rating Override', pivotalModal.item.id, `Score changed to ${val}★. Reason: ${overrideReason}`)
    toast.success(`Buyer rating updated to ${val}★`)
    setPivotalModal(null)
  }

  // Quality Grade Override (with dynamic RBAC check)
  const handleQualityOverride = (lot) => {
    if (!canOverrideQuality) {
      setDeniedActionName(`Override Quality Grade for Lot ${lot.id}`)
      setPermissionDeniedModal(true)
      return
    }
    setPivotalModal({
      type: 'quality',
      item: lot,
      title: `Override AI Quality Grade: Lot ${lot.id}`,
    })
    setOverrideValue(lot.currentGrade)
    setOverrideReason('')
  }

  const confirmQualityOverride = () => {
    if (!overrideReason.trim()) {
      toast.error('Documented reason is mandatory!')
      return
    }
    setLots((prev) => prev.map((l) => (l.id === pivotalModal.item.id ? { ...l, currentGrade: overrideValue } : l)))
    logAuditAction('Produce Grade Override', pivotalModal.item.id, `Grade changed to ${overrideValue}. Reason: ${overrideReason}`)
    toast.success(`Lot grade updated to ${overrideValue}`)
    setPivotalModal(null)
  }

  // Helper for masking text in demo mode (unmasked if decrypt_pii power or isOwner)
  const maskEmail = (email) => {
    if (canDecryptPII) return email
    if (!email) return '••••••••'
    const parts = email.split('@')
    return `${parts[0].slice(0, 2)}***@${parts[1] || '***.com'}`
  }

  const maskId = (id) => {
    if (canDecryptPII) return id
    return 'usr_•••••••'
  }

  const maskPhone = (phone) => {
    if (canDecryptPII) return phone
    return '+91 ••••• ••••'
  }

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'powers', label: '⚡ Authority & Powers' },
    { id: 'users', label: `👥 User Audit (${registeredUsers.length})` },
    { id: 'grievances', label: `⚖️ Grievances (${grievances.length})` },
    { id: 'buyers', label: '🏢 Buyer Ratings' },
    { id: 'quality', label: '🏅 Produce Quality' },
    { id: 'feedbacks', label: `💬 User Feedbacks (${feedbacks.length})` },
    { id: 'audit', label: `📋 Audit Trail (${auditLog.length})` },
  ]

  return (
    <div className="space-y-7 animate-fade-in pb-12">
      {/* Top Banner with Owner vs Demo Mode Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            {isOwner ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shadow-sm">
                👑 Admin(TanmayA) (Unrestricted Power)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                🛡️ Demo Admin Account (Restricted · Admin(TanmayA) Approval Required for Pivotal Actions)
              </span>
            )}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            🛡️ MandiSetu Admin Command Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Platform governance, automated user registration capture, dispute arbitration, and audit trail.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              loadAllData()
              toast.success('Live database refreshed!')
            }}
            className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {/* Export CSV with dynamic authority status */}
          <div className="relative group">
            <button
              onClick={handleExportCSV}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                canExportCSV
                  ? 'bg-brand-600 hover:bg-brand-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              {canExportCSV ? <Download size={14} /> : <Lock size={14} className="text-amber-500" />}
              <span>Export CSV</span>
            </button>
            {!canExportCSV && (
              <div className="absolute right-0 top-full mt-1.5 w-64 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700">
                🔒 TanmayA approval required to export data. (Grant "csv_export" power)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Multi-Computer Cross-Device Integration Status Banner ── */}
      <div className={`p-4 rounded-3xl border transition-all ${
        backendHealth.ok
          ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
          : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              backendHealth.ok
                ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300'
                : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
            }`}>
              {backendHealth.ok ? <Wifi size={20} /> : <WifiOff size={20} />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                  <span>Cross-Device Cloud Sync:</span>
                  {backendHealth.ok ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                      🟢 PostgreSQL Connected ({backendHealth.latency}ms)
                    </span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">
                      🟡 Server Idle / Cold Start or URL Check Needed
                    </span>
                  )}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                  Target: {backendHealth.url || getApiBaseUrl()}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                {backendHealth.isLocalhost ? (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    ⚠️ Render Web Service does not have DATABASE_URL configured! It is pointing to localhost. Copy your Render PostgreSQL Internal Connection String and add it to Render Web Service Environment Variables.
                  </span>
                ) : backendHealth.ok ? (
                  `Active real-time synchronization across all computers. PostgreSQL Database accounts: ${backendHealth.usersCount !== undefined ? backendHealth.usersCount : registeredUsers.filter(u => u.source === 'database').length} live from server (${registeredUsers.filter(u => u.source !== 'database').length} demo).`
                ) : backendHealth.dbError ? (
                  <span className="text-red-600 dark:text-red-400 font-bold">
                    Database Error: {backendHealth.dbError}
                  </span>
                ) : (
                  'Render Free Tier servers enter sleep mode after 15 mins of inactivity. Click "Wake Server" below to connect, or enter your custom Render URL.'
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => checkBackendStatus(true)}
              disabled={checkingHealth}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center gap-1.5 shadow-sm transition"
            >
              <RefreshCw size={13} className={checkingHealth ? 'animate-spin text-brand-600' : ''} />
              <span>{checkingHealth ? 'Testing...' : 'Test & Wake Server'}</span>
            </button>
            <button
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <Server size={13} />
              <span>{showApiSettings ? 'Close Config' : 'Change Backend URL'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Backend URL Setting Input */}
        {showApiSettings && (
          <div className="mt-3.5 pt-3.5 border-t border-gray-200/60 dark:border-gray-700/60 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300 block mb-1">
                Enter your Render Web Service URL (e.g. from Render dashboard: https://mandisetu-api.onrender.com):
              </label>
              <input
                type="text"
                value={customApiUrlInput}
                onChange={(e) => setCustomApiUrlInput(e.target.value)}
                placeholder="https://mandisetu-api.onrender.com"
                className="w-full px-3 py-1.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <button
              onClick={handleSaveApiUrl}
              className="sm:self-end px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md transition"
            >
              Save & Reconnect
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-gray-200 dark:border-gray-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Registered Farmers" value="10,432" icon={Users} color="brand" />
            <StatCard label="Verified Buyers" value="2,841" icon={ShieldCheck} color="blue" />
            <StatCard label="Total Transactions" value="₹52.4Cr" icon={IndianRupee} color="brand" />
            <StatCard label="Platform Reliability" value="98.4%" icon={BarChart2} color="blue" />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Top Traded Crops</h3>
              <div className="space-y-2">
                {MOCK_ANALYTICS.top_commodities.map((c) => (
                  <div key={c.commodity} className="flex justify-between items-center text-xs p-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{c.commodity}</span>
                    <span className="text-gray-500">{c.total_lots} lots</span>
                    <span className="font-bold text-brand-600 dark:text-brand-400">₹{(c.total_value / 1e5).toFixed(1)}L</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Administrative Privileges Notice</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                  Only <strong>Admin(TanmayA)</strong> holds full authorization to override quality grading, alter buyer trust scores, arbitrate grievances, and provision granular operational powers.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-300 mt-4 flex items-center justify-between">
                <span>Current Session: <strong className="font-bold">{isOwner ? 'Admin(TanmayA) (Root Authority)' : 'Demo Admin (Restricted)'}</strong></span>
                <button
                  onClick={() => setActiveTab('powers')}
                  className="px-2.5 py-1 rounded-lg bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 text-[11px] font-bold hover:scale-105 transition-all"
                >
                  Configure Powers →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: AUTHORITY & POWERS (ADMIN TANMAYA EXCLUSIVE GOVERNANCE) ── */}
      {activeTab === 'powers' && (
        <div className="space-y-6">
          {/* Master Control Status Header */}
          {isOwner ? (
            <div className="bg-gradient-to-r from-amber-500/15 via-brand-500/15 to-emerald-500/15 border border-amber-300 dark:border-amber-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-amber-950 flex items-center justify-center text-2xl shadow-md font-black shrink-0">
                  👑
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">
                      Admin(TanmayA) Master Authority Provisioning Console
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 uppercase tracking-wider">
                      ROOT PRIVILEGES
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5 max-w-2xl">
                    Select any farmer, buyer, demo admin, or FPO account to provision, elevate, or revoke specific operational powers. All changes require documented audit reasons and apply in real time.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-3xl p-5 flex items-start sm:items-center gap-3.5 text-purple-900 dark:text-purple-300 text-xs shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-purple-200 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 flex items-center justify-center text-lg shrink-0">
                🔒
              </div>
              <div className="space-y-0.5">
                <span className="font-bold text-sm block">Restricted Demo Admin Authority Inspector</span>
                <p className="text-purple-700 dark:text-purple-400">
                  You are viewing user privilege matrices in read-only mode. Modifying powers requires cryptographic authorization from <strong>Admin(TanmayA)</strong>.
                </p>
              </div>
            </div>
          )}

          {/* User Selection Strip */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span>1. Select Target Account for Authority Assignment</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-semibold">
                    {registeredUsers.length} Users Enrolled
                  </span>
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Click on any user card below to configure their role-specific operational permissions.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 font-semibold">
                  🌐 {registeredUsers.filter((u) => u.source === 'database').length} Server DB
                </span>
                <button
                  onClick={async () => {
                    toast.loading('Fetching live accounts from server database...', { id: 'sync-db-p' })
                    await loadAllData()
                    toast.success('Live database accounts synchronized!', { id: 'sync-db-p' })
                  }}
                  className="px-2.5 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center gap-1 transition"
                  title="Synchronize user accounts registered from other computers"
                >
                  <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
                  <span>Sync DB</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {registeredUsers.map((u) => {
                const isSelected = selectedUserForPowers?.email?.toLowerCase() === u.email?.toLowerCase()
                const isTanmayaUser = u.username === 'TanmayA' || u.email === 'tanmayapradhan2322@gmail.com'
                const roleColor =
                  u.role === 'buyer'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : u.role === 'admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                    : u.role === 'fpo'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'

                return (
                  <button
                    key={u.email}
                    onClick={() => {
                      setSelectedUserForPowers(u)
                      setCustomPowers(u.powers || [])
                    }}
                    className={`p-3.5 rounded-2xl text-left border transition-all flex flex-col justify-between gap-3 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/20 ring-2 ring-brand-500 shadow-md scale-[1.01]'
                        : 'border-gray-200 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-800/40 hover:bg-gray-100/60 dark:hover:bg-gray-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-bold text-xs text-gray-700 dark:text-gray-200 shrink-0">
                          {u.full_name?.[0] || 'U'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-gray-900 dark:text-white truncate">
                            {u.full_name || u.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono truncate">
                            {maskEmail(u.email)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${roleColor}`}>
                        {u.role || 'farmer'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-gray-200/50 dark:border-gray-700/50 w-full">
                      <span className="text-gray-500 flex items-center gap-1">
                        {u.source === 'database' ? (
                          <span title="Registered via backend (PostgreSQL)" className="text-green-500">🌐</span>
                        ) : (
                          <span title="Local demo account" className="text-gray-400">💾</span>
                        )}
                        Powers:
                      </span>
                      {isTanmayaUser ? (
                        <span className="font-extrabold text-amber-600 dark:text-amber-400">👑 Root (All)</span>
                      ) : (
                        <span className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                          <Zap size={12} />
                          {u.powers?.length || 0} Enabled
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Configuration Panel for Selected Account */}
          {selectedUserForPowers && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-7 shadow-sm space-y-6">
              {/* Account Meta Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 flex items-center justify-center font-black text-lg shadow-inner">
                    {selectedUserForPowers.role === 'buyer' ? '🏢' : selectedUserForPowers.role === 'admin' ? '🛡️' : selectedUserForPowers.role === 'fpo' ? '🤝' : '🌾'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-base text-gray-900 dark:text-white">
                        {selectedUserForPowers.full_name || selectedUserForPowers.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        {selectedUserForPowers.role || 'farmer'}
                      </span>
                      {selectedUserForPowers.username === 'TanmayA' && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-200 text-amber-950">
                          SUPREME ROOT
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                      {maskEmail(selectedUserForPowers.email)} · {selectedUserForPowers.district ? `${selectedUserForPowers.district}, ` : ''}{selectedUserForPowers.state || 'India'}
                    </p>
                  </div>
                </div>

                {/* Authority Level Counter Pill */}
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 shadow-sm">
                    <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
                    <span>
                      {selectedUserForPowers.username === 'TanmayA'
                        ? 'Master Authority Active'
                        : `${customPowers.length} of ${(ROLE_AVAILABLE_POWERS[selectedUserForPowers.role || 'farmer'] || []).length} Powers Provisioned`}
                    </span>
                  </span>
                </div>
              </div>

              {selectedUserForPowers.username === 'TanmayA' || selectedUserForPowers.email === 'tanmayapradhan2322@gmail.com' ? (
                <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-2">
                  <div className="text-3xl">👑</div>
                  <h4 className="font-extrabold text-base text-amber-900 dark:text-amber-200">
                    Supreme Root Platform Account: Admin(TanmayA)
                  </h4>
                  <p className="text-xs text-amber-800/80 dark:text-amber-300/80 max-w-md mx-auto">
                    Admin(TanmayA) inherently commands unrestricted platform authority across Agmarknet price overrides, direct dispute arbitration, live user credential decryption, quality grading, and system governance.
                  </p>
                </div>
              ) : (
                <>
                  {/* One-Click Authority Presets */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        1-Click Authority Presets
                      </label>
                      <span className="text-[11px] text-gray-400">Quickly apply standard, pro, or VIP authority</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        onClick={() => handleApplyPreset('standard')}
                        className="p-3 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-800/60 text-left transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-gray-400 group-hover:scale-125 transition-transform" />
                          <span className="font-bold text-xs text-gray-900 dark:text-white">Standard Tier</span>
                        </div>
                        <p className="text-[11px] text-gray-500">Base APMC permissions with default platform rate limits.</p>
                      </button>

                      <button
                        onClick={() => handleApplyPreset('pro')}
                        className="p-3 rounded-2xl border border-brand-200 dark:border-brand-800 hover:border-brand-300 bg-brand-50/40 dark:bg-brand-950/20 text-left transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-brand-500 group-hover:scale-125 transition-transform" />
                          <span className="font-bold text-xs text-brand-900 dark:text-brand-300">Elevated Pro Tier</span>
                        </div>
                        <p className="text-[11px] text-gray-500">Key operational boosters (AI grading, priority matching & fleets).</p>
                      </button>

                      <button
                        onClick={() => handleApplyPreset('vip')}
                        className="p-3 rounded-2xl border border-amber-200 dark:border-amber-800 hover:border-amber-300 bg-amber-50/40 dark:bg-amber-950/20 text-left transition-all group"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500 group-hover:scale-125 transition-transform" />
                          <span className="font-bold text-xs text-amber-900 dark:text-amber-300">👑 VIP / Full Authority</span>
                        </div>
                        <p className="text-[11px] text-gray-500">Unlock all available powers and exemptions for this role.</p>
                      </button>
                    </div>
                  </div>

                  {/* Granular Role-Specific Powers Grid */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                        Granular Operational Privileges ({selectedUserForPowers.role?.toUpperCase() || 'FARMER'})
                      </label>
                      <span className="text-[11px] text-gray-400">
                        Toggle specific switches to customize authorization
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {(ROLE_AVAILABLE_POWERS[selectedUserForPowers.role || 'farmer'] || []).map((p) => {
                        const isActive = customPowers.includes(p.id)

                        return (
                          <div
                            key={p.id}
                            className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                              isActive
                                ? 'border-brand-500/60 bg-brand-50/30 dark:bg-brand-950/15 shadow-sm'
                                : 'border-gray-200 dark:border-gray-800 bg-gray-50/30 dark:bg-gray-800/30 opacity-75'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="text-2xl shrink-0 p-1.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs">
                                {p.icon}
                              </span>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-xs text-gray-900 dark:text-white">
                                    {p.label}
                                  </h5>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                                      isActive
                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                                    }`}
                                  >
                                    {isActive ? 'ENABLED' : 'STANDARD'}
                                  </span>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                                  {p.desc}
                                </p>
                              </div>
                            </div>

                            {/* Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => handleTogglePower(p.id)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                isActive ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                                  isActive ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Administrative Audit Justification */}
                  <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                      Documented Reason for Authority Configuration <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={powerAuditReason}
                      onChange={(e) => setPowerAuditReason(e.target.value)}
                      placeholder="e.g. Cleared APMC mandi quality inspection, Gold buyer collateral verified, or emergency seasonal quota boost..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-brand-500"
                    />
                    <p className="text-[11px] text-gray-400">
                      All granted or revoked powers are immutably logged into the MandiSetu Admin Audit Trail under Admin(TanmayA).
                    </p>
                  </div>

                  {/* Commit Action Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setCustomPowers(selectedUserForPowers.powers || [])}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Reset to Current
                    </button>

                    <button
                      type="button"
                      onClick={handleSavePowers}
                      disabled={savingPowers}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-extrabold shadow-md flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
                    >
                      <Zap size={14} className={savingPowers ? 'animate-spin' : ''} />
                      <span>{savingPowers ? 'Provisioning...' : '⚡ Commit & Provision Powers (Certified by TanmayA)'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: LIVE USER AUDIT (with encrypted mode for demo) ── */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Live Enrolled Users Audit Directory
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {registeredUsers.length} Users Total
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
                  🌐 {registeredUsers.filter((u) => u.source === 'database').length} Server DB
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  💾 {registeredUsers.filter((u) => u.source !== 'database').length} Local/Demo
                </span>
                <button
                  onClick={async () => {
                    toast.loading('Fetching live accounts from server database...', { id: 'sync-db-audit' })
                    await loadAllData()
                    toast.success('Live database accounts synchronized!', { id: 'sync-db-audit' })
                  }}
                  className="px-2.5 py-1 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/60 text-brand-700 dark:text-brand-300 text-xs font-bold flex items-center gap-1.5 transition ml-1"
                  title="Synchronize user accounts registered from other computers/browsers"
                >
                  <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
                  <span>Sync Database</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Integrated directly with PostgreSQL server database. Accounts created on any device are synchronized in real-time.
              </p>
            </div>

            {!isOwner && (
              <div className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800 text-[11px] font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                <Lock size={12} />
                <span>Encrypted Demo Mode Active · Hover field to request TanmayA approval</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-gray-800/40">
                  <th className="py-3 px-3">User ID</th>
                  <th className="py-3 px-3">Name & Role</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-3">Source</th>
                  <th className="py-3 px-3">State / District</th>
                  <th className="py-3 px-3">⚡ Granted Powers</th>
                  <th className="py-3 px-3 text-center">Security Level</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {registeredUsers.map((u, i) => {
                  const uid = u.id || u.user_id || `usr_${i + 101}`
                  const isTanmayaUser = u.username === 'TanmayA' || u.email === 'tanmayapradhan2322@gmail.com'

                  return (
                    <tr key={uid} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition">
                      {/* User ID */}
                      <td className="py-3 px-3">
                        <div
                          className="relative inline-block"
                          onMouseEnter={() => !canDecryptPII && setHoveredEncryptedId(`id_${uid}`)}
                          onMouseLeave={() => setHoveredEncryptedId(null)}
                        >
                          <span className="font-mono font-bold text-brand-700 dark:text-brand-400">
                            {maskId(uid)}
                          </span>
                          {!canDecryptPII && hoveredEncryptedId === `id_${uid}` && (
                            <div className="absolute left-0 bottom-full mb-1 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg shadow-xl z-50 whitespace-nowrap animate-fade-in border border-gray-700">
                              🔒 TanmayA approval required to view user credentials
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Name & Role */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <span>{u.full_name || u.name}</span>
                          {isTanmayaUser && (
                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded font-extrabold">OWNER</span>
                          )}
                        </div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {u.role || 'farmer'}
                        </span>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-3">
                        <div
                          className="relative inline-block cursor-help"
                          onMouseEnter={() => !canDecryptPII && setHoveredEncryptedId(`mail_${uid}`)}
                          onMouseLeave={() => setHoveredEncryptedId(null)}
                        >
                          <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-mono text-[11px]">
                            <Mail size={12} className="text-gray-400" />
                            <span>{maskEmail(u.email)}</span>
                          </div>
                          {!canDecryptPII && hoveredEncryptedId === `mail_${uid}` && (
                            <div className="absolute left-0 bottom-full mb-1 px-2.5 py-1 bg-gray-900 text-white text-[10px] font-bold rounded-lg shadow-xl z-50 whitespace-nowrap animate-fade-in border border-gray-700">
                              🔒 TanmayA approval required to view user credentials
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-3">
                        <span className="font-mono text-gray-600 dark:text-gray-400 text-[11px]">
                          {maskPhone(u.phone)}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-3">
                        {u.source === 'database' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" title="Registered via backend PostgreSQL">
                            🌐 Database
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" title="Local demo account">
                            💾 Local
                          </span>
                        )}
                      </td>

                      {/* State / District */}
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                        {u.district ? `${u.district}, ` : ''}{u.state || 'India'}
                      </td>

                      {/* Granted Powers Badges */}
                      <td className="py-3 px-3">
                        {isTanmayaUser ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 inline-flex items-center gap-1">
                            👑 ROOT (ALL)
                          </span>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1 max-w-[220px]">
                            {u.powers && u.powers.length > 0 ? (
                              <>
                                {u.powers.slice(0, 2).map((pid) => (
                                  <span
                                    key={pid}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300 border border-brand-200 dark:border-brand-800"
                                  >
                                    ⚡ {pid.replace(/_/g, ' ')}
                                  </span>
                                ))}
                                {u.powers.length > 2 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                    +{u.powers.length - 2}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-[10px] text-gray-400 italic">Standard</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Verification Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle size={10} /> Verified
                        </span>
                      </td>

                      {/* Action Button */}
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedUserForPowers(u)
                            setCustomPowers(u.powers || [])
                            setActiveTab('powers')
                          }}
                          className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-300 font-bold text-[10px] flex items-center gap-1 shadow-xs transition-all ml-auto"
                        >
                          <Zap size={11} className="text-amber-600 dark:text-amber-400" />
                          <span>Powers ({u.powers?.length || 0})</span>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: GRIEVANCE ARBITRATION ── */}
      {activeTab === 'grievances' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                ⚖️ Grievance Arbitration & Dispute Resolution
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Every grievance resolution or escalation requires mandatory documented justification.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px] bg-gray-50/50 dark:bg-gray-800/40">
                  <th className="py-3 px-3">Dispute ID</th>
                  <th className="py-3 px-3">Farmer vs Buyer</th>
                  <th className="py-3 px-3">Issue Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {grievances.map((g) => (
                  <tr key={g.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-brand-700 dark:text-brand-400">{g.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900 dark:text-white">{g.farmer}</div>
                      <div className="text-[11px] text-gray-500">vs {g.buyer}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-700 dark:text-gray-300">{g.type}</td>
                    <td className="py-3 px-3 font-mono font-bold text-gray-900 dark:text-white">₹{g.amount.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        g.status === 'resolved'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : g.status === 'escalated'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {g.status !== 'resolved' && (
                          <button
                            onClick={() => handleGrievanceAction(g, 'resolve')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-[11px] font-bold"
                          >
                            Resolve
                          </button>
                        )}
                        {g.status !== 'escalated' && (
                          <button
                            onClick={() => handleGrievanceAction(g, 'escalate')}
                            className="px-2.5 py-1 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-950 dark:text-orange-300 text-[11px] font-bold"
                          >
                            Escalate
                          </button>
                        )}
                        <button
                          onClick={() => handleGrievanceAction(g, 'delete')}
                          className="px-2.5 py-1 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-950 dark:text-red-300 text-[11px] font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 4: BUYER RATINGS OVERRIDE ── */}
      {activeTab === 'buyers' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              🏢 Buyer Reliability Ratings & Trust Scores
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Override buyer scores with documented administrative audit reasons.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px] bg-gray-50/50 dark:bg-gray-800/40">
                  <th className="py-3 px-3">Buyer ID</th>
                  <th className="py-3 px-3">Company Name</th>
                  <th className="py-3 px-3">Current Score</th>
                  <th className="py-3 px-3">Completed Deals</th>
                  <th className="py-3 px-3">Disputes</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {buyers.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-gray-700 dark:text-gray-300">{b.id}</td>
                    <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{b.name}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-amber-500 font-mono text-sm">{b.rating} ★</span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{b.deals} deals</td>
                    <td className="py-3 px-3 text-red-600 font-bold">{b.disputes} disputes</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleBuyerOverride(b)}
                        className="px-3 py-1 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold"
                      >
                        Adjust Score
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: PRODUCE QUALITY CONTROL ── */}
      {activeTab === 'quality' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              🏅 Produce Lot Quality Inspection & Grading
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Admin quality override panel with documented sensory and moisture verification.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px] bg-gray-50/50 dark:bg-gray-800/40">
                  <th className="py-3 px-3">Lot ID</th>
                  <th className="py-3 px-3">Farmer & Crop</th>
                  <th className="py-3 px-3">Quantity</th>
                  <th className="py-3 px-3">Assigned Grade</th>
                  <th className="py-3 px-3">Destination Mandi</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {lots.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-gray-700 dark:text-gray-300">{l.id}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900 dark:text-white">{l.commodity}</div>
                      <div className="text-[11px] text-gray-500">{l.farmer}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-gray-600 dark:text-gray-300">{l.quantity}</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                        Grade {l.currentGrade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600 dark:text-gray-400">{l.mandi}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleQualityOverride(l)}
                        className="px-3 py-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-xs font-bold"
                      >
                        Adjust Grade
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 6: USER FEEDBACKS (From Feedback Page) ── */}
      {activeTab === 'feedbacks' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                💬 Platform User Feedbacks & Suggestions
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Direct submissions from the User Feedback module for TanmayA and the development team.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300">
              {feedbacks.length} Submissions Received
            </span>
          </div>

          {feedbacks.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No feedback submitted yet. Users can submit through the Feedback page!
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((f) => (
                <div key={f.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white text-xs">{f.name || 'Anonymous User'}</span>
                      <span className="text-[11px] text-gray-500 font-mono">({f.email})</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-800 capitalize">
                        {f.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-amber-500 font-bold">{f.rating}/5 ⭐</span>
                      <span className="text-gray-400 text-[11px] font-mono">{new Date(f.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-gray-900 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                    "{f.message}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 7: AUDIT TRAIL LOG ── */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
              📋 Mandatory Administrative Audit Trail Log
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Full immutable log of all rating overrides, grievance arbitration actions, and exports with documented reasons.
            </p>
          </div>

          {auditLog.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No administrative overrides recorded in this session yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 font-bold uppercase text-[10px] bg-gray-50/50 dark:bg-gray-800/40">
                    <th className="py-3 px-3">Audit ID</th>
                    <th className="py-3 px-3">Timestamp</th>
                    <th className="py-3 px-3">Admin</th>
                    <th className="py-3 px-3">Action</th>
                    <th className="py-3 px-3">Target</th>
                    <th className="py-3 px-3">Documented Justification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {auditLog.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-gray-600 dark:text-gray-400">{a.id}</td>
                      <td className="py-3 px-3 text-[11px] font-mono text-gray-500">
                        {new Date(a.timestamp).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-bold text-brand-700 dark:text-brand-400">{a.admin}</td>
                      <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">{a.action}</td>
                      <td className="py-3 px-3 font-mono text-gray-600 dark:text-gray-400">{a.target}</td>
                      <td className="py-3 px-3 text-gray-700 dark:text-gray-300 max-w-xs">{a.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: PERMISSION DENIED POPUP (For Demo Admin) ── */}
      {permissionDeniedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border-2 border-red-400 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center text-2xl mx-auto shadow-inner">
              🔒
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">
                TanmayA Approval Required
              </h3>
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold uppercase tracking-wider">
                Restricted Pivotal Platform Function
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed pt-2">
                You are currently accessing via the Demo Admin account. Modifying pivotal functions such as{' '}
                <span className="font-bold text-gray-900 dark:text-white">"{deniedActionName}"</span>{' '}
                requires explicit approval from <strong>Admin(TanmayA)</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 text-center font-mono">
              Contact Admin(TanmayA): tanmayapradhan2322@gmail.com
            </div>

            <button
              onClick={() => setPermissionDeniedModal(false)}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
            >
              Acknowledge & Close
            </button>
          </div>
        </div>
      )}

      {/* ── MODAL 2: PIVOTAL OVERRIDE CONFIRMATION WITH DOCUMENTED REASON ── */}
      {pivotalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-7 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white">
                {pivotalModal.title}
              </h3>
              <button
                onClick={() => setPivotalModal(null)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ✕
              </button>
            </div>

            {pivotalModal.type === 'buyer' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Reliability Rating (1.0 to 5.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            )}

            {pivotalModal.type === 'quality' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  New Produce Grade
                </label>
                <select
                  value={overrideValue}
                  onChange={(e) => setOverrideValue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                >
                  <option value="A+">Grade A+ (Premium Export Quality)</option>
                  <option value="A">Grade A (Standard APMC First Grade)</option>
                  <option value="B">Grade B (Fair Average Quality - FAQ)</option>
                  <option value="C">Grade C (Sub-standard)</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Documented Administrative Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={3}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Provide detailed justification for this administrative action (logged to permanent audit trail)..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setPivotalModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (pivotalModal.type === 'grievance') confirmGrievanceAction()
                  else if (pivotalModal.type === 'buyer') confirmBuyerOverride()
                  else if (pivotalModal.type === 'quality') confirmQualityOverride()
                }}
                className="flex-1 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow"
              >
                Confirm & Log Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
