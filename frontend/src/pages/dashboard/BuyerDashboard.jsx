import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Search, ShieldCheck, TrendingUp, FileText, Users,
  ArrowRight, Package, CheckCircle2, Truck, Sparkles
} from 'lucide-react'
import { transactionsAPI, buyersAPI } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import { StatCard, Spinner, PageHeader, Card } from '../../components/common/UI'

const MOCK_TRANSACTIONS = [
  { id: 't1', commodity: 'Tomato (Hybrid)', quantity_kg: 4000, amount: 82000, status: 'completed', date: '2026-10-28', seller: 'Ramesh Patel (Nashik)' },
  { id: 't2', commodity: 'Onion (Red Garva)', quantity_kg: 8000, amount: 260000, status: 'in_transit', date: '2026-10-27', seller: 'Sahyadri FPO (Lasalgaon)' },
  { id: 't3', commodity: 'Wheat (Sharbati)', quantity_kg: 12000, amount: 297600, status: 'payment_pending', date: '2026-10-26', seller: 'Gurpreet Singh (Khanna)' },
]

const QUICK_LINKS = [
  { to: '/matching', icon: Search, label: 'Search & Match Lots', desc: 'Algorithm-ranked farm produce', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { to: '/prices', icon: TrendingUp, label: 'Agmarknet Price Map', desc: 'Pan-India mandi benchmark', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { to: '/transactions', icon: FileText, label: 'Active Escrow Contracts', desc: '7-stage tracking', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  { to: '/logistics', icon: Truck, label: 'Freight Logistics', desc: 'Direct carrier booking', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
]

export default function BuyerDashboard() {
  const user = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const { t, formatNum } = useLangStore()
  const [transactions, setTransactions] = useState([])
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      transactionsAPI.getAll(),
      user?.id ? buyersAPI.getScore(user.id) : Promise.resolve(null),
    ])
      .then(([txRes, scoreRes]) => {
        if (txRes.status === 'fulfilled' && Array.isArray(txRes.value?.data)) {
          setTransactions(txRes.value.data.length ? txRes.value.data : MOCK_TRANSACTIONS)
        } else {
          setTransactions(MOCK_TRANSACTIONS)
        }
        if (scoreRes?.status === 'fulfilled' && scoreRes.value?.data) {
          setScore(scoreRes.value.data)
        }
      })
      .catch(() => setTransactions(MOCK_TRANSACTIONS))
      .finally(() => setLoading(false))
  }, [user])

  const reliability = score?.reliability_score ?? 96
  const badge = score?.badge ?? 'Gold'

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-blue-200 mb-2">
              <ShieldCheck size={14} className="text-blue-300" />
              <span>Verified Institutional Buyer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {user?.business_name || user?.full_name || 'AgriCorp Traders'}!
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Source verified produce directly from farmers & FPOs with zero middleman commissions and guaranteed quality grading.
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
            <span className="text-[10px] uppercase font-bold text-blue-200">Buyer Trust Rating</span>
            <div className="text-xl font-extrabold text-amber-300 flex items-center gap-1.5">
              <span>{badge} Certified</span>
              <span className="text-xs text-white">({reliability}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/transactions" className="card-interactive p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Package size={24} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{transactions.length}</p>
            <p className="text-xs text-gray-500 font-medium">Contracted Lots</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-blue-600 transition-colors" />
        </Link>

        <Link to="/transactions" className="card-interactive p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:border-emerald-300 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-brand-700">₹6,39,600</p>
            <p className="text-xs text-gray-500 font-medium">Completed Volume</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-emerald-600 transition-colors" />
        </Link>

        <Link to="/logistics" className="card-interactive p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center gap-4 hover:border-indigo-300 hover:shadow-md transition-all group">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-indigo-700">98.4%</p>
            <p className="text-xs text-gray-500 font-medium">Delivery Fulfilment</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-indigo-600 transition-colors" />
        </Link>
      </div>

      {/* Quick Action Cards */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Procurement & Sourcing Workflows</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.label}
                to={item.to}
                className="card-interactive p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-blue-300 hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-blue-700 transition leading-snug">
                    {item.label}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Recent Purchases & Escrow Contracts */}
      <div className="card p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Your Procurement Contracts</h3>
            <p className="text-xs text-gray-500">Live contracts and transit status with smallholder farmers</p>
          </div>
          <Link to="/transactions" className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1">
            <span>View All Contracts</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px] tracking-wider bg-gray-50/50">
                <th className="py-3 px-3">Produce & Seller</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3 text-right">Contract Value</th>
                <th className="py-3 px-3 text-center">Status</th>
                <th className="py-3 px-3 text-center">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transactions.map((t, idx) => (
                <tr key={t.id || idx} onClick={() => navigate(`/transactions/${t.id}`)} className="hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition cursor-pointer group">
                  <td className="py-3 px-3">
                    <span className="font-bold text-gray-900">{t.commodity || 'Agricultural Produce'}</span>
                    <span className="block text-[11px] text-gray-500">{t.seller || 'Verified Farmer'}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-700">
                    {t.quantity_kg?.toLocaleString()} kg
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-brand-700 text-sm">
                    ₹{t.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      t.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : t.status === 'in_transit'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {t.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-gray-500 font-medium">
                    {t.date || '2026-10-28'}
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
