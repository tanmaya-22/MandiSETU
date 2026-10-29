import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Search, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { pricesAPI } from '../../api/modules'
import { Spinner, StatusBadge, PageHeader, Card } from '../../components/common/UI'

const COMMODITIES = ['Wheat', 'Tomato', 'Onion', 'Potato', 'Rice', 'Maize', 'Apple', 'Banana']

// Mock fallback data
const MOCK_LIVE = [
  { mandi_name: 'Azadpur Mandi', state: 'Delhi', min_price: 1800, max_price: 2200, modal_price: 2050, date: '2025-10-29' },
  { mandi_name: 'Vashi APMC', state: 'Maharashtra', min_price: 1900, max_price: 2400, modal_price: 2150, date: '2025-10-29' },
  { mandi_name: 'Lasalgaon', state: 'Maharashtra', min_price: 1700, max_price: 2100, modal_price: 1950, date: '2025-10-29' },
  { mandi_name: 'Shahjahanpur Mandi', state: 'UP', min_price: 1650, max_price: 2000, modal_price: 1850, date: '2025-10-28' },
]

const MOCK_TREND = {
  trend: 'rising',
  confidence: 0.82,
  historical: Array.from({ length: 20 }, (_, i) => ({
    date: `2025-${String(10).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`,
    price: 1800 + Math.round(Math.random() * 300),
    forecast: null,
  })),
  forecast: Array.from({ length: 14 }, (_, i) => ({
    date: `2025-11-${String(i + 1).padStart(2, '0')}`,
    price: null,
    forecast: 2100 + Math.round(Math.random() * 200),
  })),
}

const MOCK_MARKETS = [
  { mandi_name: 'Azadpur Mandi', state: 'Delhi', avg_price: 2050, volume_traded: 1500 },
  { mandi_name: 'Vashi APMC', state: 'Maharashtra', avg_price: 2150, volume_traded: 2200 },
  { mandi_name: 'Koyambedu', state: 'Tamil Nadu', avg_price: 2000, volume_traded: 1800 },
]

const TREND_ICON = { rising: TrendingUp, falling: TrendingDown, stable: Minus }

export default function PricesPage() {
  const [tab, setTab] = useState('live')
  const [commodity, setCommodity] = useState('Wheat')
  const [state, setState] = useState('')
  const [mandiName, setMandiName] = useState('')
  const [horizon, setHorizon] = useState(14)
  const [liveData, setLiveData] = useState(MOCK_LIVE)
  const [trendData, setTrendData] = useState(null)
  const [markets, setMarkets] = useState(MOCK_MARKETS)
  const [loading, setLoading] = useState(false)

  const searchLive = async () => {
    setLoading(true)
    try {
      const [liveRes, mktRes] = await Promise.allSettled([
        pricesAPI.getLive(commodity, state || undefined, 20),
        pricesAPI.getTopMarkets(commodity, state || undefined),
      ])
      if (liveRes.status === 'fulfilled') {
        const rows = liveRes.value?.data
        setLiveData(Array.isArray(rows) && rows.length ? rows : MOCK_LIVE)
      } else {
        setLiveData(MOCK_LIVE)
      }
      if (mktRes.status === 'fulfilled') {
        const rows = mktRes.value?.data
        setMarkets(Array.isArray(rows) && rows.length ? rows : MOCK_MARKETS)
      }
    } catch {
      toast.error('Failed to fetch prices')
      setLiveData(MOCK_LIVE)
    } finally {
      setLoading(false)
    }
  }

  const searchTrend = async () => {
    setLoading(true)
    try {
      const { data } = await pricesAPI.getTrend(commodity, mandiName || 'Azadpur Mandi', horizon)
      setTrendData(data || MOCK_TREND)
    } catch {
      toast.error('Failed to fetch trend — showing demo')
      setTrendData(MOCK_TREND)
    } finally {
      setLoading(false)
    }
  }

  const chartData = trendData
    ? [
        ...(trendData.historical || []).map((p) => ({ date: p.date, Historical: p.price })),
        ...(trendData.forecast || []).map((p) => ({ date: p.date, Forecast: p.forecast })),
      ]
    : []

  const TrendIcon = trendData ? TREND_ICON[trendData.trend] || Minus : null

  return (
    <div>
      <PageHeader
        title="Price Discovery"
        subtitle="Live APMC mandi prices and ML-powered forecasts"
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit mb-6">
        {['live', 'trend'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition ${
              tab === t ? 'bg-white shadow text-brand-700' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'live' ? '📡 Live Prices' : '📈 Price Trend'}
          </button>
        ))}
      </div>

      {tab === 'live' && (
        <>
          {/* Filters */}
          <div className="card mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Commodity</label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="input-field"
                >
                  {COMMODITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">State (optional)</label>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Maharashtra"
                  className="input-field"
                />
              </div>
              <button onClick={searchLive} className="btn-primary flex items-center gap-2 px-5">
                <Search size={16} /> Search
              </button>
            </div>
          </div>

          {loading ? <Spinner /> : (
            <div className="card p-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {['Mandi Name', 'State', 'Min Price', 'Max Price', 'Modal Price', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-gray-600 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {liveData.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{row.mandi_name}</td>
                      <td className="px-4 py-3 text-gray-600">{row.state}</td>
                      <td className="px-4 py-3 text-red-600">₹{row.min_price}</td>
                      <td className="px-4 py-3 text-green-600">₹{row.max_price}</td>
                      <td className="px-4 py-3 font-semibold text-brand-700">₹{row.modal_price}</td>
                      <td className="px-4 py-3 text-gray-500">{row.date?.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'trend' && (
        <>
          <div className="card mb-6">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Commodity</label>
                <select
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                  className="input-field"
                >
                  {COMMODITIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mandi Name</label>
                <input
                  value={mandiName}
                  onChange={(e) => setMandiName(e.target.value)}
                  placeholder="e.g. Azadpur Mandi"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Horizon: {horizon} days
                </label>
                <input
                  type="range"
                  min={7}
                  max={60}
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                  className="w-40"
                />
              </div>
              <button onClick={searchTrend} className="btn-primary flex items-center gap-2 px-5">
                <Search size={16} /> Search
              </button>
            </div>
          </div>

          {loading ? <Spinner /> : trendData && (
            <>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 card py-2 px-4">
                  {TrendIcon && <TrendIcon size={20} className={
                    trendData.trend === 'rising' ? 'text-green-600' : trendData.trend === 'falling' ? 'text-red-600' : 'text-gray-600'
                  } />}
                  <span className="font-semibold capitalize">{trendData.trend}</span>
                </div>
                <StatusBadge status={trendData.trend} />
                <span className="text-sm text-gray-600">
                  Confidence: <strong>{Math.round((trendData.confidence || 0) * 100)}%</strong>
                </span>
              </div>

              <div className="card mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Price Trend & Forecast</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v?.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v) => [`₹${v}`, '']} />
                    <Legend />
                    <Line dataKey="Historical" stroke="#2563eb" strokeWidth={2} dot={false} connectNulls />
                    <Line dataKey="Forecast" stroke="#16a34a" strokeWidth={2} strokeDasharray="6 3" dot={false} connectNulls />
                    <ReferenceLine x={chartData[19]?.date} stroke="#888" strokeDasharray="4 4" label="Today" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}
        </>
      )}

      {/* Top Markets */}
      <div className="mt-8">
        <h3 className="font-semibold text-gray-900 mb-4">🏪 Top Markets for {commodity}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {markets.map((m, i) => (
            <div key={i} className="card border-l-4 border-brand-500">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900">{m.mandi_name}</span>
                <span className="text-xs text-gray-400">#{i + 1}</span>
              </div>
              <p className="text-gray-500 text-sm">{m.state}</p>
              <p className="text-xl font-bold text-brand-700 mt-2">₹{m.avg_price}<span className="text-sm font-normal text-gray-500">/quintal</span></p>
              <p className="text-xs text-gray-500 mt-1">Volume: {m.volume_traded?.toLocaleString()} qtl</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
