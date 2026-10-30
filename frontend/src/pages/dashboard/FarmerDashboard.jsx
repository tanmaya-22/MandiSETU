import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Plus, TrendingUp, Calculator, Calendar, Star,
  Package, CloudRain, AlertTriangle, CheckCircle2, ArrowRight,
  MapPin, Sparkles, Navigation, Layers
} from 'lucide-react'
import { listingsAPI } from '../../api/modules'
import { useAuthStore } from '../../store/authStore'
import { StatCard, Spinner, PageHeader, Card } from '../../components/common/UI'

const MOCK_LOTS = [
  { id: '1', commodity: 'Onion', variety: 'Red Garva', quantity_kg: 5000, grade: 'A+', min_price_per_kg: 32, status: 'active', mandi_name: 'Lasalgaon APMC', created_at: '2026-10-28' },
  { id: '2', commodity: 'Wheat', variety: 'Sharbati', quantity_kg: 8000, grade: 'A', min_price_per_kg: 24, status: 'matched', mandi_name: 'Khanna Mandi', created_at: '2026-10-25' },
  { id: '3', commodity: 'Tomato', variety: 'Hybrid Round', quantity_kg: 2500, grade: 'B', min_price_per_kg: 19, status: 'active', mandi_name: 'Kolar Mandi', created_at: '2026-10-29' },
]

const QUICK_ACTIONS = [
  { to: '/listings/new', icon: Plus, label: 'Create Produce Lot', desc: 'List new harvest', color: 'bg-emerald-600 hover:bg-emerald-700 text-white' },
  { to: '/prices', icon: TrendingUp, label: 'Price Discovery & Map', desc: 'Live APMC rates', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  { to: '/calculator', icon: Calculator, label: 'Net Realization', desc: 'Compare mandis', color: 'bg-amber-600 hover:bg-amber-700 text-white' },
  { to: '/grading', icon: Star, label: 'AI Quality Grading', desc: 'Computer vision', color: 'bg-yellow-500 hover:bg-yellow-600 text-white' },
  { to: '/sale-window', icon: Calendar, label: 'Optimal Sale Window', desc: 'Price vs spoilage', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
  { to: '/weather', icon: CloudRain, label: 'Weather Risk', desc: 'Transit advisory', color: 'bg-teal-600 hover:bg-teal-700 text-white' },
]

export default function FarmerDashboard() {
  const user = useAuthStore((s) => s.user)
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listingsAPI
      .getAll({ my: true })
      .then(({ data }) => setLots(data?.lots?.length ? data.lots : MOCK_LOTS))
      .catch(() => setLots(MOCK_LOTS))
      .finally(() => setLoading(false))
  }, [])

  const activeLots = lots.filter((l) => l.status === 'active').length
  const matchedLots = lots.filter((l) => l.status === 'matched').length

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-emerald-700 to-green-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-8 translate-y-8">
          <Package size={240} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-bold text-emerald-200 mb-2">
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Verified Farmer Dashboard</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Namaste, {user?.full_name || 'Ramesh Patel'}!
            </h2>
            <p className="text-emerald-100 text-xs sm:text-sm mt-1 max-w-xl">
              {user?.state && user?.district
                ? `Region: ${user.district}, ${user.state} · 3 Lots Active in Public Markets`
                : 'Empowering you with real-time Agmarknet rates and instant buyer matching.'}
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/listings/new"
              className="px-5 py-2.5 bg-white text-brand-900 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md hover:bg-emerald-50 transition transform hover:-translate-y-0.5"
            >
              <Plus size={16} />
              <span>List New Produce</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package size={24} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-gray-900">{lots.length}</p>
            <p className="text-xs text-gray-500 font-medium">Total Listed Lots</p>
          </div>
        </div>

        <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-brand-700">{activeLots}</p>
            <p className="text-xs text-gray-500 font-medium">Active in Mandi</p>
          </div>
        </div>

        <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-blue-700">{matchedLots}</p>
            <p className="text-xs text-gray-500 font-medium">Buyer Offers Matched</p>
          </div>
        </div>

        <div className="card-interactive p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <CloudRain size={24} />
          </div>
          <div>
            <p className="text-2xl font-extrabold text-emerald-700">Low Risk</p>
            <p className="text-xs text-gray-500 font-medium">Weather Advisory</p>
          </div>
        </div>
      </div>

      {/* 6 Quick Action Cards with Hover Micro-Interactions */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Quick Actions & Platform Modules</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_ACTIONS.map((a) => {
            const Icon = a.icon
            return (
              <Link
                key={a.label}
                to={a.to}
                className="card-interactive p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:border-brand-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div className={`w-10 h-10 rounded-xl ${a.color} flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-gray-900 group-hover:text-brand-700 transition leading-snug">
                    {a.label}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">{a.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Active Produce Lots Table */}
      <div className="card p-5 sm:p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-base text-gray-900">Your Active Produce Listings</h3>
            <p className="text-xs text-gray-500">Real-time status of your crops listed for sale</p>
          </div>
          <Link
            to="/listings"
            className="text-xs font-bold text-brand-700 hover:underline flex items-center gap-1"
          >
            <span>View All Lots</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 font-bold uppercase text-[10px] tracking-wider bg-gray-50/50">
                <th className="py-3 px-3">Commodity & Variety</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">AI Grade</th>
                <th className="py-3 px-3">Target Mandi</th>
                <th className="py-3 px-3 text-right">Floor Price</th>
                <th className="py-3 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lots.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50/80 transition">
                  <td className="py-3 px-3">
                    <span className="font-bold text-gray-900">{l.commodity}</span>
                    <span className="block text-[11px] text-gray-500">{l.variety || 'Standard Quality'}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-gray-800">
                    {l.quantity_kg?.toLocaleString()} kg ({((l.quantity_kg || 0) / 100).toFixed(0)} Qtl)
                  </td>
                  <td className="py-3 px-3">
                    <span className="badge-green px-2 py-0.5 rounded-full text-[10px] font-bold">
                      Grade {l.grade || 'A'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-600 font-medium">
                    {l.mandi_name || 'Nearest APMC'}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-brand-700 text-sm">
                    ₹{l.min_price_per_kg}/kg
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      l.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : l.status === 'matched'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {l.status}
                    </span>
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
