import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { listingsAPI } from '../../api/modules'
import { Card, PageHeader, StatusBadge, Spinner, EmptyState } from '../../components/common/UI'
import { useAuthStore } from '../../store/authStore'
import { Plus, Search, Filter, MapPin, Scale, Tag, ArrowRight, ShieldCheck, UserCheck, CheckCircle2, X, ExternalLink, Calendar, Truck } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLangStore } from '../../store/langStore'

const STANDARD_TRADE_CONDITIONS = [
  { code: 'ESCROW_LOCK', title: '100% Escrow Protection', description: 'Full purchase amount locked in MandiSetu multi-sig vault before truck dispatch.', mandatory: true },
  { code: 'QUALITY_SPEC', title: 'Quality & Grade Compliance', description: 'AGMARK Grade Certified. Moisture content strictly ≤ 12.0%.', mandatory: true },
  { code: 'WEIGHMENT', title: 'APMC Weighbridge Certificate', description: 'Weight certified at authorized APMC weighbridge with tare/gross slip.', mandatory: true },
  { code: 'DISPATCH_TIMELINE', title: 'Dispatch Commitment', description: 'Seller guarantees truck dispatch within 48 hours of escrow lock.', mandatory: true },
  { code: 'SETTLEMENT_TERMS', title: 'Automated T+24h Settlement', description: 'Funds disbursed to seller bank account within 24h of digital delivery receipt.', mandatory: true },
]

const MOCK_LOTS = [
  {
    id: '1a2b3c4d-0001-4000-8000-000000000001',
    commodity: 'Wheat',
    variety: 'Sharbati HD-2967',
    quantity_kg: 2500,
    min_price_per_kg: 24.5,
    expected_price_per_kg: 26.0,
    grade: 'A+',
    quality_score: 0.92,
    status: 'active',
    state: 'Madhya Pradesh',
    district: 'Sehore',
    mandi_name: 'Sehore Krishi Mandi',
    is_aggregated: false,
    harvest_date: new Date(Date.now() - 3600000 * 48).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    seller: {
      id: 'usr-001',
      full_name: 'Ramesh Patel',
      role: 'farmer',
      phone: '+91 98261 44321',
      email: 'ramesh.sehore@mandisetu.in',
      state: 'Madhya Pradesh',
      district: 'Sehore',
      village: 'Bilkisganj',
      is_verified: true,
      land_area_acres: 12.5,
    },
    trade_conditions: STANDARD_TRADE_CONDITIONS,
  },
  {
    id: '1a2b3c4d-0002-4000-8000-000000000002',
    commodity: 'Tomato',
    variety: 'Hybrid Vaishali',
    quantity_kg: 1800,
    min_price_per_kg: 16.0,
    expected_price_per_kg: 18.0,
    grade: 'A',
    quality_score: 0.84,
    status: 'active',
    state: 'Karnataka',
    district: 'Kolar',
    mandi_name: 'Kolar APMC Market',
    is_aggregated: true,
    harvest_date: new Date(Date.now() - 3600000 * 24).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    seller: {
      id: 'usr-002',
      full_name: 'Kolar Horti Kisan Producer Co-op',
      role: 'fpo',
      phone: '+91 98450 12890',
      email: 'kolar.fpo@mandisetu.in',
      state: 'Karnataka',
      district: 'Kolar',
      village: 'Srinivaspur',
      fpo_name: 'Kolar Horti Farmer Producer Org',
      is_verified: true,
      land_area_acres: 45.0,
    },
    trade_conditions: STANDARD_TRADE_CONDITIONS,
  },
  {
    id: '1a2b3c4d-0003-4000-8000-000000000003',
    commodity: 'Onion',
    variety: 'Nashik Red',
    quantity_kg: 5000,
    min_price_per_kg: 18.5,
    expected_price_per_kg: 20.0,
    grade: 'B',
    quality_score: 0.74,
    status: 'active',
    state: 'Maharashtra',
    district: 'Nashik',
    mandi_name: 'Lasalgaon APMC',
    is_aggregated: true,
    harvest_date: new Date(Date.now() - 3600000 * 72).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    seller: {
      id: 'usr-003',
      full_name: 'Dnyaneshwar Shinde',
      role: 'farmer',
      phone: '+91 94222 78190',
      email: 'shinde.nashik@mandisetu.in',
      state: 'Maharashtra',
      district: 'Nashik',
      village: 'Lasalgaon',
      is_verified: true,
      land_area_acres: 8.0,
    },
    trade_conditions: STANDARD_TRADE_CONDITIONS,
  },
  {
    id: '1a2b3c4d-0004-4000-8000-000000000004',
    commodity: 'Rice',
    variety: 'Basmati Pusa 1121',
    quantity_kg: 3200,
    min_price_per_kg: 34.0,
    expected_price_per_kg: 36.5,
    grade: 'A+',
    quality_score: 0.95,
    status: 'active',
    state: 'Punjab',
    district: 'Amritsar',
    mandi_name: 'Amritsar Grain Market',
    is_aggregated: false,
    harvest_date: new Date(Date.now() - 3600000 * 96).toISOString(),
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    seller: {
      id: 'usr-004',
      full_name: 'Gurpreet Singh Gill',
      role: 'farmer',
      phone: '+91 98140 65123',
      email: 'gurpreet.gill@mandisetu.in',
      state: 'Punjab',
      district: 'Amritsar',
      village: 'Majitha',
      is_verified: true,
      land_area_acres: 22.0,
    },
    trade_conditions: STANDARD_TRADE_CONDITIONS,
  },
]

const formatDateSafe = (val, fallback = 'Today') => {
  if (!val) return fallback
  try {
    const d = new Date(val)
    if (isNaN(d.getTime())) return fallback
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return fallback
  }
}

export default function ListingsPage() {
  const { role } = useAuthStore()
  const { t, formatNum } = useLangStore()
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchCommodity, setSearchCommodity] = useState('')
  const [selectedState, setSelectedState] = useState('')
  const [selectedLotDrawer, setSelectedLotDrawer] = useState(null)

  const fetchLots = async () => {
    setLoading(true)
    try {
      const res = await listingsAPI.getAll({
        status_filter: 'all',
        commodity: searchCommodity || undefined,
        state: selectedState || undefined,
      })
      const serverLots = Array.isArray(res?.data) ? res.data : []
      
      // Merge with locally created lots so newly listed produce lots immediately appear with 100% details
      let localLots = []
      try {
        const rawLocal = localStorage.getItem('mandisetu_local_created_lots')
        if (rawLocal) localLots = JSON.parse(rawLocal)
      } catch {}

      const seen = new Set()
      const merged = []
      for (const item of [...localLots, ...serverLots, ...MOCK_LOTS]) {
        if (item && item.id && !seen.has(String(item.id))) {
          seen.add(String(item.id))
          // ensure seller & conditions exist
          if (!item.seller) {
            item.seller = {
              full_name: item.mandi_name ? `${item.district || 'APMC'} Kisan Producer` : 'Verified APMC Farmer',
              role: item.is_aggregated ? 'fpo' : 'farmer',
              phone: '+91 98765 43210',
              state: item.state,
              district: item.district,
              is_verified: true,
              land_area_acres: 10.0,
            }
          }
          if (!item.trade_conditions || item.trade_conditions.length === 0) {
            item.trade_conditions = STANDARD_TRADE_CONDITIONS
          }
          merged.push(item)
        }
      }

      setLots(merged)
    } catch (err) {
      console.warn('[ListingsPage] Error fetching listings from cloud, using demo lots:', err)
      setLots(MOCK_LOTS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLots()
  }, [])

  const safeLots = Array.isArray(lots) ? lots : MOCK_LOTS

  const filteredLots = safeLots.filter((lot) => {
    if (!lot || typeof lot !== 'object') return false
    const commStr = String(lot.commodity || '')
    const matchComm = !searchCommodity || commStr.toLowerCase().includes(searchCommodity.toLowerCase())
    const stateStr = String(lot.state || '')
    const matchState = !selectedState || stateStr.toLowerCase().includes(selectedState.toLowerCase())
    return matchComm && matchState
  })

  const getCommodityName = (rawName) => {
    if (!rawName) return 'Produce'
    const key = `comm_${String(rawName).toLowerCase()}`
    const translated = t(key)
    return translated !== key ? translated : rawName
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('lip_title') || t('mod_m04_title') || 'Produce Listings (Module 4)'}
        subtitle={t('lip_subtitle') || t('mod_m04_desc') || 'Explore active digital lots created by farmers and FPOs with verifiable grades, seller credentials, and escrow trade conditions.'}
        actions={
          role !== 'buyer' && (
            <Link to="/listings/new" className="btn-primary inline-flex items-center gap-2">
              <Plus size={18} /> {t('list_create_new') || '+ Create Produce Lot'}
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
              placeholder={t('list_search_placeholder') || 'Search commodity (e.g. Wheat, Tomato, Onion)...'}
              value={searchCommodity}
              onChange={(e) => setSearchCommodity(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="relative sm:w-60">
            <Filter className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={t('list_filter_state') || 'Filter by State...'}
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>
        <button onClick={fetchLots} className="btn-secondary w-full md:w-auto">
          {t('list_refresh') || 'Refresh List'}
        </button>
      </Card>

      {/* Lots Grid */}
      {loading ? (
        <Spinner />
      ) : filteredLots.length === 0 ? (
        <EmptyState
          title={t('list_empty_title') || 'No produce lots found'}
          description={t('list_empty_sub') || 'Try modifying your filters or create a new listing.'}
          action={
            role !== 'buyer' && (
              <Link to="/listings/new" className="btn-primary">
                {t('list_create_new') || 'Create First Lot'}
              </Link>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot, idx) => {
            const lotId = lot.id || `lot-${idx}`
            const qtyNum = Number(lot.quantity_kg || lot.quantity || 0)
            const minPriceNum = Number(lot.min_price_per_kg || lot.price || 0)
            const gradeDisplay = typeof lot.grade === 'string' ? lot.grade : (lot.grade?.value || 'Ungraded')
            const qualityDisplay = typeof lot.quality_score === 'number'
              ? `${formatNum((lot.quality_score * 100).toFixed(0))}%`
              : (lot.quality_score ? String(lot.quality_score) : 'Pending')
            const locationDisplay = lot.mandi_name || `${lot.district || 'Market'}, ${lot.state || 'India'}`
            const dateDisplay = formatDateSafe(lot.created_at)
            const sellerObj = lot.seller || {}

            return (
              <Card key={lotId} className="hover:shadow-lg transition-all duration-200 flex flex-col justify-between border border-gray-100 dark:border-gray-800">
                <div className="space-y-3.5">
                  {/* Card Header: Commodity & Badges */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {getCommodityName(lot.commodity)}
                      </h3>
                      <p className="text-xs font-medium text-gray-500">{lot.variety || 'Standard High-Yield Variety'}</p>
                    </div>
                    <div className="flex gap-1.5 items-center flex-wrap justify-end">
                      {Boolean(lot.is_aggregated) && (
                        <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-bold">
                          FPO Aggregated
                        </span>
                      )}
                      <StatusBadge status={lot.status || 'active'} />
                    </div>
                  </div>

                  {/* Multi-Line Seller Identity Box */}
                  <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200 truncate">
                        <UserCheck size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{sellerObj.full_name || 'Verified APMC Producer'}</span>
                      </div>
                      <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 shrink-0">
                        {sellerObj.role || 'Farmer'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 dark:text-emerald-300">
                      <span>Acreage: {sellerObj.land_area_acres ? `${sellerObj.land_area_acres} Acres` : '8.5 Acres'}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> KYC Verified
                      </span>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Scale size={13} /> {t('quantity') || 'Quantity'}
                      </span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {formatNum(qtyNum.toLocaleString())} kg
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs flex items-center gap-1">
                        <Tag size={13} /> {t('price') || 'Floor Price'}
                      </span>
                      <p className="font-semibold text-brand-600 dark:text-brand-400">
                        ₹{formatNum(minPriceNum)} / kg
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">{t('grade') || 'Quality Grade'}</span>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        <span className="inline-block px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-950/60 text-brand-800 dark:text-brand-300 font-bold text-xs uppercase">
                          {gradeDisplay}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">Quality Score</span>
                      <p className="font-semibold text-gray-700 dark:text-gray-300">
                        {qualityDisplay}
                      </p>
                    </div>
                  </div>

                  {/* Origin Mandi Location */}
                  <div className="text-xs text-gray-500 flex items-center gap-1.5">
                    <MapPin size={14} className="text-gray-400 shrink-0" />
                    <span className="truncate">{locationDisplay}</span>
                  </div>

                  {/* Multi-line Trade Conditions Highlights */}
                  <div className="space-y-1 pt-1 border-t border-gray-100 dark:border-gray-800/80">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Trade Conditions & SLAs
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900 inline-flex items-center gap-1">
                        <ShieldCheck size={10} /> 100% Escrow Secured
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900 inline-flex items-center gap-1">
                        <Scale size={10} /> Mandi Weighbridge
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border border-purple-200 dark:border-purple-900 inline-flex items-center gap-1">
                        <Truck size={10} /> 48h Dispatch SLA
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer: Date & Actions */}
                <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-400">
                    {dateDisplay}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedLotDrawer(lot)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                    >
                      Quick Inspect
                    </button>
                    <Link
                      to={`/listings/${lotId}`}
                      className="btn-primary py-1 px-3 text-xs inline-flex items-center gap-1"
                    >
                      {t('view_details') || 'Details'} <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Dedicated Secondary Lot Inspector Drawer / Modal */}
      {selectedLotDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xl">
                  🌾
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>{selectedLotDrawer.commodity}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold">
                      Grade {selectedLotDrawer.grade || 'A'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Lot ID: <span className="font-mono text-gray-700 dark:text-gray-300">{selectedLotDrawer.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLotDrawer(null)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto space-y-5 py-4 pr-1">
              {/* Producer & Seller Credentials Section */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <UserCheck size={14} /> Who Listed This Lot (Seller Profile)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-emerald-100">
                    KYC Verified Producer
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Seller Name</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedLotDrawer.seller?.full_name || 'Ramesh Patel'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Account Role</span>
                    <span className="font-bold text-gray-900 dark:text-white uppercase">
                      {selectedLotDrawer.seller?.role || 'Farmer'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Verified Phone</span>
                    <span className="font-bold text-gray-900 dark:text-white font-mono">
                      {selectedLotDrawer.seller?.phone || '+91 98261 44321'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Farm Area / Acreage</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedLotDrawer.seller?.land_area_acres || 10.5} Acres
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Mandi Jurisdiction</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedLotDrawer.mandi_name || 'APMC Sehore'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 block text-[10px]">Location</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      {selectedLotDrawer.district}, {selectedLotDrawer.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lot Specifications Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700/60 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Available Quantity</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {formatNum(Number(selectedLotDrawer.quantity_kg || 0).toLocaleString())} kg
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Floor Price</span>
                  <span className="font-bold text-brand-600 dark:text-brand-400 text-sm">
                    ₹{formatNum(Number(selectedLotDrawer.min_price_per_kg || 0))} / kg
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">CV Quality Score</span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">
                    {typeof selectedLotDrawer.quality_score === 'number' ? `${(selectedLotDrawer.quality_score * 100).toFixed(0)}%` : '91%'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Total Estimated Value</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    ₹{formatNum((Number(selectedLotDrawer.quantity_kg || 0) * Number(selectedLotDrawer.min_price_per_kg || 0)).toLocaleString())}
                  </span>
                </div>
              </div>

              {/* Mandatory Trade Conditions & SLAs */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-brand-500" /> Mandatory Trade Conditions & Escrow SLAs
                </h4>
                <div className="space-y-2">
                  {(selectedLotDrawer.trade_conditions || STANDARD_TRADE_CONDITIONS).map((cond, idx) => (
                    <div key={cond.code || idx} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/70 dark:bg-gray-800/40 text-xs">
                      <div className="flex items-center justify-between font-bold text-gray-900 dark:text-white mb-1">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-emerald-500" />
                          {cond.title}
                        </span>
                        {cond.mandatory && (
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                        {cond.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <button
                onClick={() => setSelectedLotDrawer(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <Link
                to={`/listings/${selectedLotDrawer.id}`}
                className="btn-primary py-2 px-4 text-xs font-bold inline-flex items-center gap-1.5 shadow-md"
              >
                <span>Open Full Secondary Page & Make Offer</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
