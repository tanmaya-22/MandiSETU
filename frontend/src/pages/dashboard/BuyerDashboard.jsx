import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, ArrowRightCircle, ShieldCheck, TrendingUp, FileText, Users } from 'lucide-react'
import { transactionsAPI, buyersAPI } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'
import { StatCard, Spinner, StatusBadge, PageHeader } from '../../components/common/UI'

const MOCK_TRANSACTIONS = [
  { id: 't1', lot: { commodity: 'Tomato' }, amount: 45000, status: 'completed', created_at: '2025-10-20' },
  { id: 't2', lot: { commodity: 'Onion' }, amount: 72000, status: 'in_transit', created_at: '2025-10-18' },
]

const QUICK_LINKS = [
  { to: '/matching', icon: Search, label: 'Find Lots', color: 'bg-brand-600 hover:bg-brand-700 text-white' },
  { to: '/buyers', icon: Users, label: 'Buyer Directory', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { to: '/transactions', icon: FileText, label: 'My Transactions', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
]

export default function BuyerDashboard() {
  const user = useAuthStore((s) => s.user)
  const [transactions, setTransactions] = useState([])
  const [score, setScore] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      transactionsAPI.getAll(),
      user?.id ? buyersAPI.getScore(user.id) : Promise.resolve(null),
    ]).then(([txRes, scoreRes]) => {
      if (txRes.status === 'fulfilled') {
        const data = txRes.value?.data
        setTransactions(Array.isArray(data) ? data : MOCK_TRANSACTIONS)
      } else {
        setTransactions(MOCK_TRANSACTIONS)
      }
      if (scoreRes?.status === 'fulfilled' && scoreRes.value) {
        setScore(scoreRes.value.data)
      }
    }).catch(() => {
      setTransactions(MOCK_TRANSACTIONS)
      toast.error('Some data could not be loaded — showing demo data')
    }).finally(() => setLoading(false))
  }, [user])

  const completed = transactions.filter((t) => t.status === 'completed').length
  const reliability = score?.reliability_score ?? 92
  const badge = score?.badge ?? 'Gold'

  const BADGE_COLOR = { Gold: 'text-yellow-600', Silver: 'text-gray-500', Bronze: 'text-orange-500' }

  return (
    <div>
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-blue-200 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold mt-0.5">{user?.full_name || 'Buyer'}</h2>
            <p className="text-blue-100 text-sm mt-1">
              {user?.business_name || 'Find and purchase fresh produce below'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ShieldCheck size={32} className="text-blue-200" />
            <span className={`font-bold text-lg ${BADGE_COLOR[badge] || 'text-white'}`}>{badge} Buyer</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <StatCard label="Offers Made" value={transactions.length} icon={FileText} color="blue" />
        <StatCard label="Completed Deals" value={completed} icon={TrendingUp} color="brand" />
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{reliability}%</p>
            <p className="text-sm text-gray-500">Reliability Score</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <PageHeader title="Quick Actions" />
      <div className="grid grid-cols-3 gap-3 mb-8">
        {QUICK_LINKS.map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-2 p-5 rounded-xl font-medium transition ${color}`}
          >
            <Icon size={24} />
            <span className="text-sm">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Transactions */}
      <PageHeader
        title="Recent Transactions"
        actions={
          <Link to="/transactions" className="text-brand-600 text-sm hover:underline flex items-center gap-1">
            View all <ArrowRightCircle size={16} />
          </Link>
        }
      />

      {loading ? <Spinner /> : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Commodity', 'Amount', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.slice(0, 5).map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{tx.lot?.commodity || '—'}</td>
                  <td className="px-4 py-3 text-gray-700">₹{tx.amount?.toLocaleString()}</td>
                  <td className="px-4 py-3"><StatusBadge status={tx.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{tx.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/transactions/${tx.id}`} className="text-brand-600 hover:underline text-xs">
                      Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
