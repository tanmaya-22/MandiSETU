import { useState, useEffect } from 'react'
import { buyersAPI } from '../../api/modules'
import { Card, PageHeader, Spinner, EmptyState } from '../../components/common/UI'
import {
  ShieldCheck, Award, Building2, CheckCircle2,
  Search, MapPin, Navigation, Map, X, Compass
} from 'lucide-react'
import { useLangStore } from '../../store/langStore'
import { reverseGeocode } from '../../utils/geoUtils'
import MandiMap from '../../components/common/MandiMap'
import toast from 'react-hot-toast'

const MOCK_BUYERS = [
  {
    buyer_id: 'b-001',
    full_name: 'Rajesh Agrawal',
    business_name: 'Agrawal Agro Foods & Mills Pvt Ltd',
    reliability_score: 94.5,
    total_transactions: 48,
    completed_on_time: 46,
    disputes_filed_against: 0,
    avg_payment_days: 1.2,
    verified: true,
    badge: 'Gold',
    state: 'Maharashtra',
    district: 'Nashik',
    lat: 19.9975,
    lng: 73.7898,
  },
  {
    buyer_id: 'b-002',
    full_name: 'Suresh Patil',
    business_name: 'Sahyadri Farmer Producer & Retail',
    reliability_score: 87.0,
    total_transactions: 34,
    completed_on_time: 32,
    disputes_filed_against: 1,
    avg_payment_days: 2.0,
    verified: true,
    badge: 'Gold',
    state: 'Maharashtra',
    district: 'Pune',
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    buyer_id: 'b-003',
    full_name: 'Kavita Menon',
    business_name: 'Malabar Fresh Exports Ltd',
    reliability_score: 76.5,
    total_transactions: 19,
    completed_on_time: 17,
    disputes_filed_against: 1,
    avg_payment_days: 3.5,
    verified: true,
    badge: 'Silver',
    state: 'Karnataka',
    district: 'Kolar',
    lat: 13.1378,
    lng: 78.1291,
  },
  {
    buyer_id: 'b-004',
    full_name: 'Vikas Singhal',
    business_name: 'Singhal Trading Co.',
    reliability_score: 62.0,
    total_transactions: 12,
    completed_on_time: 10,
    disputes_filed_against: 2,
    avg_payment_days: 4.8,
    verified: false,
    badge: 'Bronze',
    state: 'Madhya Pradesh',
    district: 'Indore',
    lat: 22.7196,
    lng: 75.8577,
  },
  {
    buyer_id: 'b-005',
    full_name: 'Priyabrata Mohanty',
    business_name: 'Kalinga Mega Agro Hub',
    reliability_score: 91.0,
    total_transactions: 29,
    completed_on_time: 28,
    disputes_filed_against: 0,
    avg_payment_days: 1.5,
    verified: true,
    badge: 'Gold',
    state: 'Odisha',
    district: 'Cuttack',
    lat: 20.4625,
    lng: 85.8828,
  },
]

// Haversine distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c).toFixed(1)
}

export default function BuyersPage() {
  const { t, formatNum } = useLangStore()
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Geolocation & Map Pin Drop State for Module 8
  const [userLocation, setUserLocation] = useState(null)
  const [locationName, setLocationName] = useState('')
  const [locatingGps, setLocatingGps] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [sortByDistance, setSortByDistance] = useState(false)

  useEffect(() => {
    const fetchBuyers = async () => {
      setLoading(true)
      try {
        const res = await buyersAPI.listVerified()
        if (res.data && res.data.length > 0) {
          // Merge coordinates if missing
          const enriched = res.data.map((b, i) => ({
            ...MOCK_BUYERS[i % MOCK_BUYERS.length],
            ...b,
          }))
          setBuyers(enriched)
        } else {
          setBuyers(MOCK_BUYERS)
        }
      } catch {
        setBuyers(MOCK_BUYERS)
      } finally {
        setLoading(false)
      }
    }
    fetchBuyers()
  }, [])

  const handleAccessLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setLocatingGps(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocatingGps(false)
        const lat = parseFloat(pos.coords.latitude.toFixed(4))
        const lng = parseFloat(pos.coords.longitude.toFixed(4))
        setUserLocation({ lat, lng })
        const areaName = await reverseGeocode(lat, lng)
        setLocationName(areaName)
        setSortByDistance(true)
        toast.success(`Location set: ${areaName}`, { icon: '📍' })
      },
      (err) => {
        setLocatingGps(false)
        toast.error('Unable to retrieve location: ' + err.message)
      },
      { timeout: 10000, enableHighAccuracy: true }
    )
  }

  const handleDropPin = async (coords) => {
    const lat = parseFloat(coords.lat.toFixed(4))
    const lng = parseFloat(coords.lng.toFixed(4))
    setUserLocation({ lat, lng })
    const areaName = await reverseGeocode(lat, lng)
    setLocationName(areaName)
    setSortByDistance(true)
    toast.success(`Location pinned: ${areaName}`, { icon: '📌' })
  }

  let filtered = buyers.filter(
    (b) =>
      b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.state && b.state.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.district && b.district.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (sortByDistance && userLocation) {
    filtered = [...filtered].sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng) || 99999
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng) || 99999
      return parseFloat(distA) - parseFloat(distB)
    })
  }

  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Gold':
        return 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
      case 'Silver':
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
      case 'Bronze':
        return 'bg-orange-100 text-orange-900 border-orange-300 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <PageHeader
            title={t('bp_title') || 'Buyer Verification & Credibility Index (Module 8)'}
            subtitle={t('bp_subtitle') || 'Transparent institutional and merchant credibility scores calculated from historical payment turnaround and grievance outcomes.'}
          />
        </div>

        {/* Location & Map Controls for Module 8 */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleAccessLocation}
            disabled={locatingGps}
            className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all"
          >
            <Navigation size={14} className={locatingGps ? 'animate-spin' : ''} />
            <span>{locatingGps ? (t('loc_locating') || 'Accessing GPS...') : (t('loc_access_gps') || 'Access My Location (GPS)')}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMapModal(!showMapModal)}
            className="px-4 py-2 rounded-2xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Map size={14} />
            <span>{showMapModal ? (t('loc_close_map') || 'Close Map') : (t('loc_pin_map') || 'Drop Pin on Map')}</span>
          </button>
        </div>
      </div>

      {/* Selected Area Banner */}
      {locationName && (
        <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-emerald-600 shrink-0" />
            <span className="font-semibold text-gray-700 dark:text-gray-300">Searching buyers near:</span>
            <span className="font-bold text-emerald-900 dark:text-emerald-200">{locationName}</span>
          </div>
          <button
            onClick={() => {
              setUserLocation(null)
              setLocationName('')
              setSortByDistance(false)
            }}
            className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Map Pin-Drop Modal */}
      {showMapModal && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 p-3 bg-white dark:bg-gray-900 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
              <Map size={14} className="text-emerald-600" />
              <span>Click anywhere on the map or drop a pin to locate nearby verified buyers</span>
            </div>
            <button
              type="button"
              onClick={() => setShowMapModal(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={15} />
            </button>
          </div>
          <div className="h-64 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <MandiMap
              center={[userLocation?.lat || 20.0, userLocation?.lng || 74.0]}
              zoom={7}
              onDropPin={handleDropPin}
              onLocationFound={async (pos) => {
                setUserLocation({ lat: pos.lat, lng: pos.lng })
                const area = await reverseGeocode(pos.lat, pos.lng)
                setLocationName(area)
                setSortByDistance(true)
              }}
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowMapModal(false)}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Apply Area Location
            </button>
          </div>
        </div>
      )}

      <Card className="flex items-center gap-3">
        <Search className="text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search buyers by name, business organization, state, or district..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </Card>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No verified buyers found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((buyer) => {
            const distance = userLocation ? calculateDistance(userLocation.lat, userLocation.lng, buyer.lat, buyer.lng) : null
            return (
              <Card key={buyer.buyer_id} className="hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-base">{buyer.full_name}</h3>
                        {buyer.verified && (
                          <span className="text-brand-600 inline-flex items-center" title="Govt/GST Verified">
                            <CheckCircle2 size={16} />
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Building2 size={13} /> {buyer.business_name || 'Independent Commercial Buyer'}
                      </p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${getBadgeStyle(
                        buyer.badge
                      )}`}
                    >
                      <Award size={13} /> {buyer.badge} Tier
                    </span>
                  </div>

                  {/* Location Area & Distance Badge */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-1">
                      <MapPin size={13} className="text-emerald-600 shrink-0" />
                      <span>{buyer.district ? `${buyer.district}, ${buyer.state}` : buyer.state || 'India'}</span>
                    </div>
                    {distance && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        📍 ~{formatNum(distance)} km away
                      </span>
                    )}
                  </div>

                  {/* Score bar */}
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500 font-medium">Reliability Trust Score</span>
                      <span className="font-bold text-brand-700">{formatNum(buyer.reliability_score)} / 100</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-2.5 rounded-full ${
                          buyer.reliability_score >= 80
                            ? 'bg-brand-600'
                            : buyer.reliability_score >= 60
                            ? 'bg-amber-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(100, buyer.reliability_score)}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-gray-50 dark:bg-gray-800/60 p-2.5 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-gray-400 block text-[11px]">Fulfilled Deals</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {formatNum(buyer.completed_on_time)} / {formatNum(buyer.total_transactions)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Avg Payment</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">
                        {formatNum(buyer.avg_payment_days)} days
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[11px]">Grievances</span>
                      <span
                        className={`font-semibold text-sm ${
                          buyer.disputes_filed_against > 0 ? 'text-red-600' : 'text-green-600'
                        }`}
                      >
                        {formatNum(buyer.disputes_filed_against)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
