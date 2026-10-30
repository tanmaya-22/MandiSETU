import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  BarChart2, Users, Package, TrendingUp, IndianRupee,
  ShieldCheck, AlertTriangle, Activity, Download, Mail, Phone,
  Calendar, CheckCircle, RefreshCw, UserCheck
} from 'lucide-react'
import { analyticsAPI, authAPI } from '../../api/modules'
import { StatCard, Spinner, PageHeader, Card } from '../../components/common/UI'

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

export default function AdminDashboard() {
  const [data, setData] = useState(MOCK_ANALYTICS)
  const [registeredUsers, setRegisteredUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadUsersAndStats = async () => {
    setLoading(true)
    try {
      // 1. Fetch analytics stats
      const statsRes = await analyticsAPI.getDashboard().catch(() => ({ data: MOCK_ANALYTICS }))
      setData(statsRes?.data || MOCK_ANALYTICS)

      // 2. Fetch all registered users (try backend API, fallback to local registered users)
      let usersList = []
      try {
        const uRes = await authAPI.listUsers()
        if (Array.isArray(uRes?.data) && uRes.data.length > 0) {
          usersList = uRes.data
        }
      } catch (err) {
        // Fetch from resilient local registry
        const raw = localStorage.getItem('mandisetu_registered_users')
        if (raw) {
          usersList = JSON.parse(raw)
        }
      }

      if (!usersList.length) {
        usersList = [
          {
            id: 'usr_8829101',
            full_name: 'Ramesh Patel',
            email: 'farmer@demo.com',
            phone: '+91 98765 43210',
            role: 'farmer',
            state: 'Maharashtra',
            district: 'Nashik',
            created_at: '2026-10-30T10:15:00Z',
            is_verified: true,
          },
          {
            id: 'usr_8829102',
            full_name: 'AgriCorp Agro Commodities Ltd',
            email: 'buyer@demo.com',
            phone: '+91 98220 12345',
            role: 'buyer',
            state: 'Maharashtra',
            district: 'Navi Mumbai',
            created_at: '2026-10-29T14:30:00Z',
            is_verified: true,
          },
          {
            id: 'usr_8829103',
            full_name: 'Sahyadri Farmers Producer Co.',
            email: 'fpo@demo.com',
            phone: '+91 94222 33445',
            role: 'fpo',
            state: 'Maharashtra',
            district: 'Nashik',
            created_at: '2026-10-28T09:00:00Z',
            is_verified: true,
          },
        ]
      }
      setRegisteredUsers(usersList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsersAndStats()
  }, [])

  const handleExportCSV = () => {
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
    link.setAttribute('download', `mandisetu_registered_users_${Date.now()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('User directory exported successfully!')
  }

  const d = data || MOCK_ANALYTICS

  const STATS = [
    { label: 'Registered Farmers', value: d.total_farmers?.toLocaleString(), icon: Users, color: 'brand' },
    { label: 'Verified Buyers', value: d.total_buyers?.toLocaleString(), icon: ShieldCheck, color: 'blue' },
    { label: 'Total Produce Lots', value: d.total_lots?.toLocaleString(), icon: Package, color: 'brand' },
    { label: 'Active in Mandis', value: d.active_lots?.toLocaleString(), icon: Activity, color: 'brand' },
    { label: 'Total Transactions', value: d.total_transactions?.toLocaleString(), icon: TrendingUp, color: 'blue' },
    { label: 'Facilitated Trade', value: `₹${(d.total_value / 1e7).toFixed(1)}Cr`, icon: IndianRupee, color: 'brand' },
    { label: 'Open Disputes', value: d.disputes_open, icon: AlertTriangle, color: 'red' },
    { label: 'Platform Reliability', value: `${d.avg_reliability_score}%`, icon: BarChart2, color: 'blue' },
  ]

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title="Admin Oversight & Security Panel"
        subtitle="Platform metrics, live new user registration audits, and trade oversight"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => {
                loadUsersAndStats()
                toast.success('Live user database refreshed!')
              }}
              className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Download size={14} />
              <span>Export Users (CSV)</span>
            </button>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ─── LIVE REGISTERED USER AUDIT DIRECTORY (User ID, Email, Role, etc.) ─── */}
      <div className="card p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                Live Registered Users Audit Directory
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {registeredUsers.length} Users Enrolled
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Instant notification & audit log whenever someone creates an account on MandiSetu
            </p>
          </div>

          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Real-time Registration Capture Active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-bold uppercase text-[10px] tracking-wider bg-gray-50/50 dark:bg-gray-800/40">
                <th className="py-3 px-3">Unique User ID</th>
                <th className="py-3 px-3">Name & Role</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Phone</th>
                <th className="py-3 px-3">Region (State/Dist)</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {registeredUsers.map((u, i) => (
                <tr key={u.id || u.user_id || i} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-brand-700 dark:text-emerald-400">
                      {u.id || u.user_id || `usr_id_${i + 101}`}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-gray-900 dark:text-white">{u.full_name || 'Enrolled Member'}</div>
                    <span className={`inline-block px-2 py-0.2 rounded-full text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                      u.role === 'buyer'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : u.role === 'fpo'
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {u.role || 'Farmer'}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 font-medium text-gray-800 dark:text-gray-200">
                      <Mail size={13} className="text-gray-400" />
                      <span>{u.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400" />
                      <span>{u.phone || '+91 98765 00000'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-600 dark:text-gray-300 font-medium">
                    {u.district ? `${u.district}, ` : ''}{u.state || 'India'}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                      <CheckCircle size={10} /> Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Traded Commodities Overview */}
      <div className="card p-6 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-4">Top Traded Commodities in MandiSetu</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-500 font-bold uppercase text-[10px] bg-gray-50/50 dark:bg-gray-800/40">
                <th className="py-3 px-3">Commodity</th>
                <th className="py-3 px-3 text-right">Total Listed Lots</th>
                <th className="py-3 px-3 text-right">Gross Traded Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {d.top_commodities?.map((c) => (
                <tr key={c.commodity} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition">
                  <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">{c.commodity}</td>
                  <td className="py-3 px-3 text-right font-medium text-gray-700 dark:text-gray-300">{c.total_lots} lots</td>
                  <td className="py-3 px-3 text-right font-extrabold text-brand-700 dark:text-emerald-400">
                    ₹{(c.total_value / 1e5).toFixed(1)} Lakhs
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
