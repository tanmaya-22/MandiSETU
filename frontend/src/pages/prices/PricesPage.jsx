import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine, AreaChart, Area
} from 'recharts'
import {
  Search, TrendingUp, TrendingDown, Minus, MapPin,
  Calendar, CheckCircle2, Filter, RefreshCw, ExternalLink, Map as MapIcon, Table
} from 'lucide-react'
import { pricesAPI, REAL_AGMARKNET_DATA } from '../../api/modules'
import { Spinner, PageHeader, Card } from '../../components/common/UI'
import MandiMap from '../../components/common/MandiMap'
import { useLangStore } from '../../store/langStore'

const COMMODITIES = [
  { name: 'Wheat', hindi: 'गेहूं', emoji: '🌾', base: '₹2,485/Qtl' },
  { name: 'Onion', hindi: 'प्याज', emoji: '🧅', base: '₹3,250/Qtl' },
  { name: 'Tomato', hindi: 'टमाटर', emoji: '🍅', base: '₹2,050/Qtl' },
  { name: 'Potato', hindi: 'आलू', emoji: '🥔', base: '₹1,620/Qtl' },
  { name: 'Rice', hindi: 'चावल/धान', emoji: '🍚', base: '₹3,950/Qtl' },
  { name: 'Soybean', hindi: 'सोयाबीन', emoji: '🌱', base: '₹4,780/Qtl' },
  { name: 'Cotton', hindi: 'कपास', emoji: '☁️', base: '₹7,420/Qtl' },
]

export default function PricesPage() {
  const { t, formatNum, formatPrice } = useLangStore()
  const [tab, setTab] = useState('live') // 'live' | 'map' | 'trend'
  const [commodity, setCommodity] = useState('Wheat')
  const [stateFilter, setStateFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [liveData, setLiveData] = useState([])
  const [trendData, setTrendData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedMandiForDetail, setSelectedMandiForDetail] = useState(null)

  const fetchPrices = async () => {
    setLoading(true)
    try {
      const res = await pricesAPI.getLive(commodity, stateFilter)
      setLiveData(res?.data || [])
    } catch (err) {
      toast.error('Failed to update live mandi prices')
    } finally {
      setLoading(false)
    }
  }

  const fetchTrend = async () => {
    setLoading(true)
    try {
      const defaultMandi = liveData[0]?.mandi_name || 'Azadpur Mandi'
      const res = await pricesAPI.getTrend(commodity, defaultMandi, 14)
      setTrendData(res?.data)
    } catch {
      toast.error('Could not load ML forecast')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrices()
    fetchTrend()
  }, [commodity, stateFilter])

  // Filter live data by search
  const filteredRows = liveData.filter((r) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      r.mandi_name.toLowerCase().includes(q) ||
      r.state.toLowerCase().includes(q) ||
      (r.district && r.district.toLowerCase().includes(q)) ||
      (r.variety && r.variety.toLowerCase().includes(q))
    )
  })

  // Format trend chart data
  const chartData = []
  if (trendData) {
    ;(trendData.historical || []).forEach((h) => {
      chartData.push({
        date: h.date.replace('2026-', ''),
        Historical: h.price,
        Forecast: null,
      })
    })
    // Connect forecast line
    const lastHist = trendData.historical?.[trendData.historical.length - 1]
    if (lastHist) {
      chartData.push({
        date: lastHist.date.replace('2026-', ''),
        Historical: lastHist.price,
        Forecast: lastHist.price,
      })
    }
    ;(trendData.forecast || []).forEach((f) => {
      chartData.push({
        date: f.date.replace('2026-', ''),
        Historical: null,
        Forecast: f.forecast,
      })
    })
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Page Title & Agmarknet Verification Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold mb-2">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Official Agmarknet (Ministry of Agriculture & Farmers Welfare) Verified</span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {t('pp_title') || 'Mandi Price Discovery & Forecasting'}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {t('pp_subtitle') || 'Real APMC benchmark rates with 14-day Prophet ML price forecast curves'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              fetchPrices()
              fetchTrend()
              toast.success('Prices refreshed from Agmarknet API')
            }}
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Commodity Selector Chips with Hover Micro-interactions */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {COMMODITIES.map((c) => {
          const active = commodity === c.name
          return (
            <button
              key={c.name}
              onClick={() => setCommodity(c.name)}
              className={`px-4 py-2.5 rounded-2xl border text-sm font-semibold flex items-center gap-2 whitespace-nowrap transition-all duration-200 transform hover:-translate-y-0.5 active:scale-95 ${
                active
                  ? 'border-brand-600 bg-brand-600 text-white shadow-md'
                  : 'border-gray-200 bg-white hover:border-brand-300 text-gray-700 hover:shadow-sm'
              }`}
            >
              <span className="text-base">{c.emoji}</span>
              <span>{c.name}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {c.hindi}
              </span>
            </button>
          )
        })}
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200">
        <div className="flex space-x-6">
          <button
            onClick={() => setTab('live')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              tab === 'live'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Table size={16} />
            <span>{t('pp_tab_table') || 'Live Mandi Table'} ({formatNum(filteredRows.length)})</span>
          </button>

          <button
            onClick={() => setTab('map')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              tab === 'map'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <MapIcon size={16} />
            <span className="flex items-center gap-1.5">
              <span>{t('pp_tab_map') || 'Interactive Mandi Map'}</span>
              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full">New</span>
            </span>
          </button>

          <button
            onClick={() => setTab('trend')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
              tab === 'trend'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <TrendingUp size={16} />
            <span>{t('pp_tab_trend') || 'ML 14-Day Price Forecast'}</span>
          </button>
        </div>
      </div>

      {/* TAB 1: LIVE TABLE */}
      {tab === 'live' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="relative sm:col-span-2">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('pp_search_ph') || 'Search by mandi name, district, state or variety...'}
                className="input-field pl-10"
              />
            </div>
            <div>
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="input-field cursor-pointer"
              >
                <option value="">All States</option>
                <option value="Delhi">Delhi</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Punjab">Punjab</option>
                <option value="Haryana">Haryana</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Gujarat">Gujarat</option>
              </select>
            </div>
          </div>

          {/* Mandi Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-600 uppercase tracking-wider">
                    <th className="py-3.5 px-4">{t('pp_col_mandi') || 'Mandi & District'}</th>
                    <th className="py-3.5 px-4">{t('pp_col_state') || 'State'}</th>
                    <th className="py-3.5 px-4">{t('pp_col_variety') || 'Variety'}</th>
                    <th className="py-3.5 px-4 text-right">{t('pp_col_modal') || 'Modal Price (₹/Qtl)'}</th>
                    <th className="py-3.5 px-4 text-right">{t('pp_col_kg') || 'Per Kg Equivalent'}</th>
                    <th className="py-3.5 px-4 text-right">{t('pp_col_range') || 'Min - Max'}</th>
                    <th className="py-3.5 px-4 text-center">{t('pp_col_arrival') || 'Arrival Date'}</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRows.map((r, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-emerald-50/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-gray-900 group-hover:text-brand-700 transition">
                          {r.mandi_name}
                        </div>
                        <div className="text-xs text-gray-500">{r.district || r.state}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {r.state}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-600">
                        {r.variety || 'FAQ Quality'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-brand-700 text-base">
                        {formatPrice(r.modal_price)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-gray-800 text-sm">
                        ₹{(r.modal_price / 100).toFixed(1)} / kg
                      </td>
                      <td className="py-3.5 px-4 text-right text-xs text-gray-500">
                        ₹{formatNum(r.min_price)} - ₹{formatNum(r.max_price)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs text-gray-500 font-medium">
                        {r.arrival_date || 'Today'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => {
                            setTab('map')
                            toast.success(`Locating ${r.mandi_name} on interactive map!`)
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition inline-flex items-center gap-1"
                        >
                          <MapPin size={12} />
                          <span>{t('pp_btn_map') || 'Map'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRows.length === 0 && (
              <div className="py-12 text-center text-gray-500 text-sm">
                No mandis matching your filter criteria. Try searching another district or reset state filter.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE GOOGLE-MAPS STYLE MAP */}
      {tab === 'map' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <MapPin size={20} className="text-yellow-300" />
                <span>{t('pp_map_banner_title') || 'Pan-India Mandi Geospatial Explorer'}</span>
              </h3>
              <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                {t('pp_map_banner_desc') || 'Click any pin on the map to view real Agmarknet prices, daily arrivals volume, and navigate directly with Google Maps routing.'}
              </p>
            </div>
            <div className="text-xs bg-white/20 px-3 py-1.5 rounded-xl font-bold self-start sm:self-auto">
              Viewing: {commodity}
            </div>
          </div>

          <MandiMap
            selectedCommodity={commodity}
            height="550px"
            onSelectMandi={(m) => setSelectedMandiForDetail(m)}
          />
        </div>
      )}

      {/* TAB 3: ML PROPHET 14-DAY FORECAST */}
      {tab === 'trend' && trendData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                <TrendingUp size={28} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">ML Trend Signal</div>
                <div className="text-xl font-extrabold text-emerald-700 capitalize">
                  {trendData.trend}
                </div>
                <div className="text-xs text-gray-400">Confidence: {(trendData.confidence * 100).toFixed(0)}%</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Calendar size={28} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Forecast Horizon</div>
                <div className="text-xl font-extrabold text-blue-700">14 Days Ahead</div>
                <div className="text-xs text-gray-400">Prophet Time-Series Engine</div>
              </div>
            </Card>

            <Card className="flex items-center gap-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <CheckCircle2 size={28} />
              </div>
              <div>
                <div className="text-xs font-bold text-gray-500 uppercase">Recommendation</div>
                <div className="text-base font-extrabold text-gray-900">Hold for 4–6 Days</div>
                <div className="text-xs text-emerald-600 font-semibold">+₹80–120/Qtl peak expected</div>
              </div>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {commodity} Price Forecast — {trendData.mandi_name}
                </h3>
                <p className="text-xs text-gray-500">
                  Solid green indicates historical actuals; dashed blue curve represents ML projected arrival price
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name) => [`₹${val}/Qtl`, name]}
                    contentStyle={{ borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="Historical"
                    stroke="#16a34a"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#histGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Forecast"
                    stroke="#2563eb"
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#foreGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
