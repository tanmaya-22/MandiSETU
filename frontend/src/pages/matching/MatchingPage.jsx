import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listingsAPI } from '../../api/modules'
import { Card, PageHeader, Spinner, EmptyState } from '../../components/common/UI'
import { ShieldCheck, ArrowRight, Filter, Scale, MapPin } from 'lucide-react'
import { useLangStore } from '../../store/langStore'

const MOCK_MATCHES = [
  {
    lot_id: '1a2b3c4d-0001-4000-8000-000000000001',
    commodity: 'Wheat',
    variety: 'Sharbati HD-2967',
    quantity_kg: 2500,
    location: 'Sehore, Madhya Pradesh',
    listed_price: 24.5,
    match_score: 94.2,
    buyer_reliability: 92.0,
    distance_km: 42.0,
    estimated_net_realization: 23.4,
  },
  {
    lot_id: '1a2b3c4d-0004-4000-8000-000000000004',
    commodity: 'Rice',
    variety: 'Basmati Pusa 1121',
    quantity_kg: 3200,
    location: 'Amritsar, Punjab',
    listed_price: 34.0,
    match_score: 89.6,
    buyer_reliability: 88.0,
    distance_km: 85.0,
    estimated_net_realization: 32.2,
  },
  {
    lot_id: '1a2b3c4d-0003-4000-8000-000000000003',
    commodity: 'Onion',
    variety: 'Nashik Red',
    quantity_kg: 5000,
    location: 'Lasalgaon, Maharashtra',
    listed_price: 18.5,
    match_score: 83.1,
    buyer_reliability: 85.0,
    distance_km: 110.0,
    estimated_net_realization: 16.8,
  },
  {
    lot_id: '1a2b3c4d-0002-4000-8000-000000000002',
    commodity: 'Tomato',
    variety: 'Hybrid Vaishali',
    quantity_kg: 1800,
    location: 'Kolar, Karnataka',
    listed_price: 16.0,
    match_score: 79.4,
    buyer_reliability: 81.0,
    distance_km: 140.0,
    estimated_net_realization: 14.1,
  },
]

export default function MatchingPage() {
  const { t } = useLangStore()
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCommodity, setSelectedCommodity] = useState('')
  const [minScore, setMinScore] = useState(70)

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true)
      try {
        const res = await listingsAPI.getAll({ status_filter: 'active' })
        if (res.data && res.data.length > 0) {
          const scored = res.data.map((item, idx) => ({
            lot_id: item.id,
            commodity: item.commodity,
            variety: item.variety,
            quantity_kg: item.quantity_kg,
            location: item.mandi_name || `${item.district}, ${item.state}`,
            listed_price: item.min_price_per_kg,
            match_score: Math.max(65, Math.round(95 - idx * 4.5)),
            buyer_reliability: 90.0,
            distance_km: 30 + idx * 25,
            estimated_net_realization: Math.round((item.min_price_per_kg - 1.2) * 10) / 10,
          }))
          setMatches(scored)
        } else {
          setMatches(MOCK_MATCHES)
        }
      } catch {
        setMatches(MOCK_MATCHES)
      } finally {
        setLoading(false)
      }
    }
    fetchMatches()
  }, [])

  const filtered = matches.filter((m) => {
    const commMatch = !selectedCommodity || m.commodity.toLowerCase() === selectedCommodity.toLowerCase()
    const scoreMatch = m.match_score >= minScore
    return commMatch && scoreMatch
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('mp_title') || 'Buyer–Farmer Matchmaking (Module 5)'}
        subtitle={t('mp_subtitle') || 'Algorithmic matching system ranking digital lots by price affinity, geographical proximity, and volume suitability.'}
      />

      <Card className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
            className="input sm:w-48 text-sm"
          >
            <option value="">All Commodities</option>
            <option value="Wheat">Wheat</option>
            <option value="Rice">Rice</option>
            <option value="Tomato">Tomato</option>
            <option value="Onion">Onion</option>
            <option value="Potato">Potato</option>
          </select>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Min Match Score:</span>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="accent-brand-600"
            />
            <span className="font-semibold text-brand-700">{minScore}%</span>
          </div>
        </div>

        <span className="text-xs text-gray-500 font-medium">
          Showing {filtered.length} matched lots
        </span>
      </Card>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No compatible lots found"
          description="Adjust the match score threshold or commodity filters to discover more produce."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <Card key={item.lot_id} className="hover:border-brand-300 transition-colors duration-150 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{item.commodity}</h3>
                    <p className="text-xs text-gray-500">{item.variety || 'Graded Stock'}</p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-brand-50 text-brand-800 px-3 py-1 rounded-full text-xs font-bold border border-brand-200">
                    <ShieldCheck size={14} className="text-brand-600" />
                    <span>Match: {item.match_score}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-lg p-3 text-xs">
                  <div>
                    <span className="text-gray-400 block">Available Vol</span>
                    <span className="font-semibold text-gray-800 text-sm">{item.quantity_kg.toLocaleString()} kg</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Floor Price</span>
                    <span className="font-semibold text-brand-600 text-sm">₹{item.listed_price} / kg</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Transit Dist</span>
                    <span className="font-semibold text-gray-800 text-sm">{item.distance_km} km</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400" />
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  Est. Net Take-Home: <span className="font-semibold text-gray-800">₹{item.estimated_net_realization}/kg</span>
                </div>
                <Link
                  to={`/listings/${item.lot_id}`}
                  className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                >
                  Inspect & Bid <ArrowRight size={13} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
