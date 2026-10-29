import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Plus, TrendingUp, Calculator, Calendar, Star,
  Package, CloudRain, AlertTriangle, CheckCircle2
} from 'lucide-react'
import { listingsAPI } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'
import { StatCard, Spinner, StatusBadge, PageHeader } from '../../components/common/UI'

const MOCK_LOTS = [
  { id: '1', commodity: 'Wheat', quantity_kg: 2000, grade: 'A', min_price_per_kg: 22, status: 'active', mandi_name: 'Azadpur Mandi', created_at: '2025-10-20' },
  { id: '2', commodity: 'Tomato', quantity_kg: 800, grade: 'B', min_price_per_kg: 18, status: 'matched', mandi_name: 'Vashi Mandi', created_at: '2025-10-18' },
  { id: '3', commodity: 'Onion', quantity_kg: 3000, grade: 'A+', min_price_per_kg: 30, status: 'draft', mandi_name: 'Lasalgaon Mandi', created_at: '2025-10-15' },
]

const QUICK_ACTIONS = [
  { to: '/listings/new', icon: Plus, label: 'Create Lot', color: 'bg-brand-600 hover:bg-brand-700 text-white' },
  { to: '/prices', icon: TrendingUp, label: 'Live Prices', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { to: '/sale-window', icon: Calendar, label: 'Sale Window', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  { to: '/grading', icon: Star, label: 'Grade Produce', color: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { to: '/calculator', icon: Calculator, label: 'Calculator', color: 'bg-green-600 hover:bg-green-700 text-white' },
  { to: '/weather', icon: CloudRain, label: 'Weather Risk', color: 'bg-cyan-600 hover:bg-cyan-700 text-white' },
]

const GRADE_COLOR = {
  'A+': 'badge-green', A: 'badge-green', B: 'badge-blue', C: 'badge-yellow', D: 'badge-red', Ungraded: 'badge-gray'
}

export default function FarmerDashboard() {
  const user = useAuthStore((s) => s.user)
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listingsAPI.getAll({ my: true })
      .then(({ data }) => setLots(data?.lots?.length ? data.lots : MOCK_LOTS))
      .catch(() => { setLots(MOCK_LOTS); toast.error('Could not load lots — showing demo data') })
      .finally(() => setLoading(false))
  }, [])

  const activeLots = lots.filter((l) => l.status === 'active').length
  const matchedLots = lots.filter((l) => l.status === 'matched').length

  return (
    <div>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-green-700 rounded-2xl p-6 text-white mb-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-200 text-sm">Welcome back,</p>
            <h2 className="text-2xl font-bold mt-0.5">
              {user?.full_name || 'Farmer'}
            </h2>
            <p className="text-green-100 text-sm mt-1">
              {user?.state && user?.district
                ? `${user.district}, ${user.state}`
                : 'Manage your produce lots and prices below'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="badge-green bg-white/20 text-white border-0">Verified Farmer</span>
            <div className="flex items-center gap-1 text-sm text-green-200">
              <CheckCircle2 size={14} />
              <span>Account active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Lots" value={lots.length} icon={Package} color="brand" />
        <StatCard label="Active Lots" value={activeLots} icon={CheckCircle2} color="brand" />
        <StatCard label="Matched Offers" value={matchedLots} icon={TrendingUp} color="blue" />
        <div className="card flex items-center gap-3">
          <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">Low</p>
            <p className="text-sm text-gray-500">Weather Risk</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <PageHeader title="Quick Actions" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-8">
        {QUICK_ACTIONS.map(({ to, icon: Icon, label, color }) => (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium transition ${color}`}
          >
            <Icon size={22} />
            <span className="text-center text-xs leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent Lots */}
      <PageHeader
        title="My Recent Lots"
        actions={
          <Link to="/listings/new" className="btn-primary flex items-center gap-1 text-sm px-3 py-1.5">
            <Plus size={16} /> New Lot
          </Link>
        }
      />

      {loading ? (
        <Spinner />
      ) : (
        <div className="overflow-x-auto card p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Commodity', 'Qty (kg)', 'Grade', 'Min Price', 'Mandi', 'Status', 'Date', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lots.map((lot) => (
                <tr key={lot.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{lot.commodity}</td>
                  <td className="px-4 py-3 text-gray-700">{lot.quantity_kg?.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={GRADE_COLOR[lot.grade] || 'badge-gray'}>
                      {lot.grade || 'Ungraded'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">₹{lot.min_price_per_kg}/kg</td>
                  <td className="px-4 py-3 text-gray-600">{lot.mandi_name || '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lot.status} /></td>
                  <td className="px-4 py-3 text-gray-500">{lot.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <Link to={`/listings/${lot.id}`} className="text-brand-600 hover:underline text-xs">
                      View
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
