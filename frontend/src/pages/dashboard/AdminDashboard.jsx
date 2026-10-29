import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { BarChart2, Users, Package, TrendingUp, IndianRupee, ShieldCheck, AlertTriangle, Activity } from 'lucide-react'
import { analyticsAPI } from '../../api/modules'
import { StatCard, Spinner, PageHeader } from '../../components/common/UI'

const MOCK = {
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
  recent_activity: [
    { type: 'New Lot', detail: 'Ramesh Kumar listed 2000kg Wheat at Azadpur', time: '2 hrs ago' },
    { type: 'Transaction', detail: 'Lot #4821 Tomato completed — ₹45,000', time: '4 hrs ago' },
    { type: 'Dispute', detail: 'Dispute raised on Transaction #3201', time: '6 hrs ago' },
    { type: 'New User', detail: 'Suresh FPO registered from Punjab', time: '8 hrs ago' },
  ],
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(({ data: d }) => setData(d || MOCK))
      .catch(() => { setData(MOCK); toast.error('Using demo analytics data') })
      .finally(() => setLoading(false))
  }, [])

  const d = data || MOCK

  const STATS = [
    { label: 'Total Farmers', value: d.total_farmers?.toLocaleString(), icon: Users, color: 'brand' },
    { label: 'Total Buyers', value: d.total_buyers?.toLocaleString(), icon: ShieldCheck, color: 'blue' },
    { label: 'Total Lots', value: d.total_lots?.toLocaleString(), icon: Package, color: 'brand' },
    { label: 'Active Lots', value: d.active_lots?.toLocaleString(), icon: Activity, color: 'brand' },
    { label: 'Transactions', value: d.total_transactions?.toLocaleString(), icon: TrendingUp, color: 'blue' },
    { label: 'Total Value', value: `₹${(d.total_value / 1e7).toFixed(1)}Cr`, icon: IndianRupee, color: 'brand' },
    { label: 'Open Disputes', value: d.disputes_open, icon: AlertTriangle, color: 'red' },
    { label: 'Avg Reliability', value: `${d.avg_reliability_score}%`, icon: BarChart2, color: 'blue' },
  ]

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform-wide analytics and overview"
        actions={
          <Link to="/analytics" className="btn-primary text-sm px-4 py-2 flex items-center gap-1">
            <BarChart2 size={16} /> Full Analytics
          </Link>
        }
      />

      {loading ? <Spinner /> : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {STATS.map((s) => <StatCard key={s.label} {...s} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Commodities */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Top Commodities</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left pb-2 text-gray-500 font-medium">Commodity</th>
                    <th className="text-right pb-2 text-gray-500 font-medium">Lots</th>
                    <th className="text-right pb-2 text-gray-500 font-medium">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(d.top_commodities || []).map((c, i) => (
                    <tr key={c.commodity}>
                      <td className="py-2.5 font-medium text-gray-900">
                        <span className="text-gray-400 mr-2">#{i + 1}</span>
                        {c.commodity}
                      </td>
                      <td className="py-2.5 text-right text-gray-700">{c.total_lots?.toLocaleString()}</td>
                      <td className="py-2.5 text-right text-brand-600 font-semibold">
                        ₹{(c.total_value / 1e5).toFixed(1)}L
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {(d.recent_activity || []).map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-500 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-brand-600">{a.type}</p>
                      <p className="text-sm text-gray-700">{a.detail}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
