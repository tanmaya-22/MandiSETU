import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listingsAPI } from '../../api/modules'
import { Card, PageHeader, StatusBadge, Spinner, EmptyState } from '../../components/common/UI'
import { useAuthStore } from '../../store/authStore'
import { Plus, Search, Filter, MapPin, Scale, Tag, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const MOCK_LOTS = [
  {
    id: '1a2b3c4d-0001-4000-8000-000000000001',
    commodity: 'Wheat',
    variety: 'Sharbati HD-2967',
    quantity_kg: 2500,
    min_price_per_kg: 24.5,
    grade: 'A+',
    quality_score: 0.92,
    status: 'active',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    mandi_name: 'Sehore Krishi Mandi',
    is_aggregated: false,
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: '1a2b3c4d-0002-4000-8000-000000000002',
    commodity: 'Tomato',
    variety: 'Hybrid Vaishali',
    quantity_kg: 1800,
    min_price_per_kg: 16.0,
    grade: 'A',
    quality_score: 0.84,
    status: 'active',
    state: 'Karnataka',
    district: 'Kolar',
    mandi_name: 'Kolar APMC Market',
    is_aggregated: true,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: '1a2b3c4d-0003-4000-8000-000000000003',
    commodity: 'Onion',
    variety: 'Nashik Red',
    quantity_kg: 5000,
    min_price_per_kg: 18.5,
    grade: 'B',
    quality_score: 0.74,
    status: 'active',
    state: 'Maharashtra',
    district: 'Nashik',
    mandi_name: 'Lasalgaon APMC',
    is_aggregated: true,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: '1a2b3c4d-0004-4000-8000-000000000004',
    commodity: 'Rice',
    variety: 'Basmati Pusa 1121',
    quantity_kg: 3200,
    min_price_per_kg: 34.0,
    grade: 'A+',
    quality_score: 0.95,
    status: 'active',
    state: 'Punjab',
    district: 'Amritsar',
    mandi_name: 'Amritsar Grain Market',
    is_aggregated: false,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
]

export default function ListingsPage() {
  const { role } = useAuthStore()
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCommodity, setSearchCommodity] = useState('')
  const [selectedState, setSelectedState] = useState('')

  const fetchLots = async () => {
    setLoading(true)
    try {
      const res = await listingsAPI.getAll({
        commodity: searchCommodity || undefined,
        state: selectedState || undefined,
      })
      if (res.data && res.data.length > 0) {
        setLots(res.data)
      } else {
        setLots(MOCK_LOTS)
      }
    } catch {
      // Fallback for seamless demo
      setLots(MOCK_LOTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLots()
  }, [])

  const filteredLots = lots.filter((lot) => {
    const matchComm = !searchCommodity || lot.commodity.toLowerCase().includes(searchCommodity.toLowerCase())
    const matchState = !selectedState || lot.state?.toLowerCase().includes(selectedState.toLowerCase())
    return matchComm && matchState
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="Produce Listings (Module 4)"
        subtitle="Explore active digital lots created by farmers and FPOs with verifiable grades and floor prices."
        actions={
          role !== 'buyer' && (
            <Link to="/listings/new" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} /> Create New Lot
            </Link>
          )
        }
      />

      {/* Filter Bar */}
      <Card className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search commodity (e.g. Wheat, Tomato, Onion)..."
              value={searchCommodity}
              onChange={(e) => setSearchCommodity(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative sm:w-60">
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Filter by State..."
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <button onClick={fetchLots} className="btn-secondary w-full md:w-auto">
          Refresh List
        </button>
      </Card>

      {/* Lots Grid */}
      {loading ? (
        <Spinner />
      ) : filteredLots.length === 0 ? (
        <EmptyState
          title="No produce lots found"
          description="Try modifying your filters or create a new listing."
          action={
            role !== 'buyer' && (
              <Link to="/listings/new" className="btn-primary">
                Create First Lot
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => (
            <Card key={lot.id} className="hover:shadow-md transition-shadow duration-150 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{lot.commodity}</h3>
                    <p className="text-xs text-gray-500">{lot.variety || 'Standard Variety'}</p>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    {lot.is_aggregated && (
                      <span className="badge bg-purple-100 text-purple-800 text-xs">FPO Aggregated</span>
                    )}
                    <StatusBadge status={lot.status} />
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Scale size={13} /> Quantity
                    </span>
                    <p className="font-semibold text-gray-800">{lot.quantity_kg.toLocaleString()} kg</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs flex items-center gap-1">
                      <Tag size={13} /> Floor Price
                    </span>
                    <p className="font-semibold text-brand-600">₹{lot.min_price_per_kg} / kg</p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Quality Grade</span>
                    <p className="font-semibold text-gray-800">
                      <span className="inline-block px-2 py-0.5 rounded bg-brand-100 text-brand-800 font-bold text-xs">
                        {lot.grade || 'Ungraded'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 text-xs">Quality Score</span>
                    <p className="font-semibold text-gray-700">
                      {lot.quality_score ? `${(lot.quality_score * 100).toFixed(0)}%` : 'Pending'}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">{lot.mandi_name || `${lot.district}, ${lot.state}`}</span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(lot.created_at).toLocaleDateString()}
                </span>
                <Link
                  to={`/listings/${lot.id}`}
                  className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  View Details <ArrowRight size={15} />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
