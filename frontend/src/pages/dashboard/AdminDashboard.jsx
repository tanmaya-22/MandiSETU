import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  BarChart2, Users, Package, TrendingUp, IndianRupee,
  ShieldCheck, AlertTriangle, Activity, Download, Mail, Phone,
  Calendar, CheckCircle, RefreshCw, UserCheck, Lock, Unlock,
  Sliders, Award, MessageSquare, FileText, CheckCircle2, XCircle, ChevronRight
} from 'lucide-react'
import { analyticsAPI, authAPI, getLocalUsers } from '../../api/modules'
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

  // Strict check if currently logged-in user is platform owner TanmayA
  const isOwner =
    user?.isOwner === true ||
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

  // Pivotal Action Modals
  const [pivotalModal, setPivotalModal] = useState(null)
  const [permissionDeniedModal, setPermissionDeniedModal] = useState(false)
  const [deniedActionName, setDeniedActionName] = useState('')
  const [overrideReason, setOverrideReason] = useState('')
  const [overrideValue, setOverrideValue] = useState('')

  // Hover Tooltip for demo encrypted mode
  const [hoveredEncryptedId, setHoveredEncryptedId] = useState(null)

  const loadAllData = () => {
    setLoading(true)
    try {
      // 1. Users
      const usersList = getLocalUsers()
      setRegisteredUsers(usersList)

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

  useEffect(() => {
    loadAllData()
  }, [])

  const logAuditAction = (action, target, details) => {
    const newEntry = {
      id: 'AUD-' + Date.now().toString().slice(-6),
      timestamp: new Date().toISOString(),
      admin: isOwner ? 'TanmayA (Owner)' : 'Demo Admin',
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

  // CSV Export
  const handleExportCSV = () => {
    triggerPivotalAction('Export User Database CSV', () => {
      const headers = ['User ID', 'Full Name', 'Email', 'Phone', 'Role', 'State', 'District']
      const rows = registeredUsers.map((u) => [
        u.id || u.user_id || 'N/A',
        `"${u.full_name || ''}"`,
        u.email,
        u.phone || 'N/A',
        u.role || 'farmer',
        u.state || 'N/A',
        u.district || 'N/A',
      ])
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `mandisetu_users_tanmaya_${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      logAuditAction('CSV Export', 'All Registered Users', 'Full platform user registry exported by TanmayA')
      toast.success('Complete User Directory Exported (TanmayA Verified)')
    })
  }

  // Grievance resolution
  const handleGrievanceAction = (grv, actionType) => {
    triggerPivotalAction(`${actionType.toUpperCase()} Grievance ${grv.id}`, () => {
      setPivotalModal({
        type: 'grievance',
        item: grv,
        actionType,
        title: `${actionType === 'resolve' ? 'Resolve' : actionType === 'escalate' ? 'Escalate' : 'Delete'} Grievance ${grv.id}`,
      })
      setOverrideReason('')
    })
  }

  const confirmGrievanceAction = () => {
    if (!overrideReason.trim()) {
      toast.error('Documented reason is mandatory for administrative action!')
      return
    }
    const { item, actionType } = pivotalModal
    if (actionType === 'delete') {
      setGrievances(prev => prev.filter(g => g.id !== item.id))
    } else {
      setGrievances(prev => prev.map(g => g.id === item.id ? { ...g, status: actionType === 'resolve' ? 'resolved' : 'escalated' } : g))
    }
    logAuditAction(`Grievance ${actionType}`, item.id, `Reason: ${overrideReason}`)
    toast.success(`Grievance ${item.id} ${actionType}d with documented audit reason.`)
    setPivotalModal(null)
  }

  // Buyer Rating Override
  const handleBuyerOverride = (buyer) => {
    triggerPivotalAction(`Override Rating for ${buyer.name}`, () => {
      setPivotalModal({
        type: 'buyer',
        item: buyer,
        title: `Override Reliability Score: ${buyer.name}`,
      })
      setOverrideValue(String(buyer.rating))
      setOverrideReason('')
    })
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
    setBuyers(prev => prev.map(b => b.id === pivotalModal.item.id ? { ...b, rating: val } : b))
    logAuditAction('Buyer Rating Override', pivotalModal.item.id, `Score changed to ${val}★. Reason: ${overrideReason}`)
    toast.success(`Buyer rating updated to ${val}★`)
    setPivotalModal(null)
  }

  // Quality Grade Override
  const handleQualityOverride = (lot) => {
    triggerPivotalAction(`Override Quality Grade for Lot ${lot.id}`, () => {
      setPivotalModal({
        type: 'quality',
        item: lot,
        title: `Override AI Quality Grade: Lot ${lot.id}`,
      })
      setOverrideValue(lot.currentGrade)
      setOverrideReason('')
    })
  }

  const confirmQualityOverride = () => {
    if (!overrideReason.trim()) {
      toast.error('Documented reason is mandatory!')
      return
    }
    setLots(prev => prev.map(l => l.id === pivotalModal.item.id ? { ...l, currentGrade: overrideValue } : l))
    logAuditAction('Produce Grade Override', pivotalModal.item.id, `Grade changed to ${overrideValue}. Reason: ${overrideReason}`)
    toast.success(`Lot grade updated to ${overrideValue}`)
    setPivotalModal(null)
  }

  // Helper for masking text in demo mode
  const maskEmail = (email) => {
    if (isOwner) return email
    if (!email) return '••••••••'
    const parts = email.split('@')
    return `${parts[0].slice(0, 2)}***@${parts[1] || '***.com'}`
  }

  const maskId = (id) => {
    if (isOwner) return id
    return 'usr_•••••••'
  }

  const maskPhone = (phone) => {
    if (isOwner) return phone
    return '+91 ••••• ••••'
  }

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
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
                👑 Super Admin & Platform Owner: TanmayA (Unrestricted Power)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                🛡️ Demo Admin Account (Restricted · TanmayA Approval Required for Pivotal Actions)
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

          {/* Export CSV with hover/click restriction */}
          <div className="relative group">
            <button
              onClick={handleExportCSV}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-all ${
                isOwner
                  ? 'bg-brand-600 hover:bg-brand-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isOwner ? <Download size={14} /> : <Lock size={14} className="text-amber-500" />}
              <span>Export CSV</span>
            </button>
            {!isOwner && (
              <div className="absolute right-0 top-full mt-1.5 w-60 p-2.5 bg-gray-900 text-white text-[11px] font-medium rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 border border-gray-700">
                🔒 TanmayA approval required to export data.
              </div>
            )}
          </div>
        </div>
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
                  Only <strong>TanmayA</strong> as the platform owner holds full authorization to override quality grading, alter buyer trust scores, arbitrate grievances, and export sensitive user database files.
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-900 dark:text-amber-300 mt-4">
                Current Session: <span className="font-bold">{isOwner ? 'TanmayA (All Powers Active)' : 'Demo Admin (Restricted)'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: LIVE USER AUDIT (with encrypted mode for demo) ── */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                  Live Enrolled Users Audit Directory
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {registeredUsers.length} Users Enrolled
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Every new user registration generates an instant audit entry with email and user ID.
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
                  <th className="py-3 px-3">State / District</th>
                  <th className="py-3 px-3 text-center">Security Level</th>
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
                          onMouseEnter={() => !isOwner && setHoveredEncryptedId(`id_${uid}`)}
                          onMouseLeave={() => setHoveredEncryptedId(null)}
                        >
                          <span className="font-mono font-bold text-brand-700 dark:text-brand-400">
                            {maskId(uid)}
                          </span>
                          {!isOwner && hoveredEncryptedId === `id_${uid}` && (
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
                          onMouseEnter={() => !isOwner && setHoveredEncryptedId(`mail_${uid}`)}
                          onMouseLeave={() => setHoveredEncryptedId(null)}
                        >
                          <div className="flex items-center gap-1.5 text-gray-800 dark:text-gray-200 font-mono text-[11px]">
                            <Mail size={12} className="text-gray-400" />
                            <span>{maskEmail(u.email)}</span>
                          </div>
                          {!isOwner && hoveredEncryptedId === `mail_${uid}` && (
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

                      {/* State / District */}
                      <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                        {u.district ? `${u.district}, ` : ''}{u.state || 'India'}
                      </td>

                      {/* Verification Badge */}
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                          <CheckCircle size={10} /> Verified
                        </span>
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
                requires explicit approval from platform owner <strong>TanmayA</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 text-center font-mono">
              Contact Owner: tanmayapradhan2322@gmail.com
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
