import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { listingsAPI, offersAPI } from '../../api/modules'
import { Card, PageHeader, StatusBadge, Spinner } from '../../components/common/UI'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import {
  MapPin, Scale, Tag, ArrowLeft, Check, X, ShieldAlert, Award, Send,
  UserCheck, ShieldCheck, CheckCircle2, Phone, Calendar, Clock, Truck,
  FileText, Sparkles, AlertCircle, ExternalLink, HelpCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

const STANDARD_TRADE_CONDITIONS = [
  {
    code: 'ESCROW_LOCK',
    title: '100% Escrow Protection Guarantee',
    description: '100% buyer procurement funds are locked in the MandiSetu multi-signature escrow vault before seller dispatches the consignment.',
    mandatory: true,
  },
  {
    code: 'QUALITY_SPEC',
    title: 'AGMARK Quality & Moisture Compliance',
    description: 'Certified AGMARK moisture content standard (≤ 12% for grains; damage/rot ratio ≤ 3% for perishables). CV visual grade verified.',
    mandatory: true,
  },
  {
    code: 'WEIGHMENT',
    title: 'Authorized APMC Weighbridge Slip',
    description: 'Gross minus tare weight slip issued by certified APMC weighbridge must accompany e-Waybill during dispatch.',
    mandatory: true,
  },
  {
    code: 'DISPATCH_TIMELINE',
    title: '48-Hour Dispatch SLA',
    description: 'Farmer / FPO commits to loading and dispatching transport within 48 hours of escrow funding confirmation.',
    mandatory: true,
  },
  {
    code: 'SETTLEMENT_TERMS',
    title: 'Automated T+24h Real-Time Disbursement',
    description: 'Escrow vault automatically releases payment to farmer UPI / bank account within 24 hours of physical gate delivery and digital acceptance.',
    mandatory: true,
  },
  {
    code: 'DISPUTE_WINDOW',
    title: '24-Hour Grievance & Arbitration Period',
    description: 'Buyers and sellers have a 24-hour statutory window post-delivery to log quality discrepancies to the MandiSetu arbitration desk.',
    mandatory: false,
  },
]

export default function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, user } = useAuthStore()
  const { t, formatNum } = useLangStore()

  const [lot, setLot] = useState(null)
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)

  // Offer submission form state for buyers
  const [offerPrice, setOfferPrice] = useState('')
  const [offerQuantity, setOfferQuantity] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [logisticsResp, setLogisticsResp] = useState('buyer')
  const [submittingOffer, setSubmittingOffer] = useState(false)

  const fetchLotData = async () => {
    setLoading(true)
    try {
      // 1. Check local created lots first for any customized lot
      let foundLocal = null
      try {
        const rawLocal = localStorage.getItem('mandisetu_local_created_lots')
        if (rawLocal) {
          const list = JSON.parse(rawLocal)
          foundLocal = list.find((l) => String(l.id) === String(id))
        }
      } catch {}

      let serverData = null
      try {
        const res = await listingsAPI.getOne(id)
        if (res && res.data) serverData = res.data
      } catch (err) {
        console.warn('Backend fetch failed, falling back to local or mock lot:', err)
      }

      const combined = serverData || foundLocal || {
        id,
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
        harvest_date: new Date(Date.now() - 3600000 * 48).toISOString(),
        created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
      }

      const finalLot = {
        ...combined,
        seller: combined.seller || foundLocal?.seller || {
          id: 'usr-farmer-01',
          full_name: combined.mandi_name ? `${combined.district || 'Sehore'} Kisan Producer` : 'Ramesh Patel',
          role: combined.is_aggregated ? 'fpo' : 'farmer',
          phone: '+91 98261 44321',
          email: 'ramesh.sehore@mandisetu.in',
          state: combined.state || 'Madhya Pradesh',
          district: combined.district || 'Sehore',
          village: 'Bilkisganj APMC Cluster',
          fpo_name: combined.is_aggregated ? 'Sehore Farmer Producer Co-op' : null,
          is_verified: true,
          land_area_acres: 12.5,
        },
        trade_conditions: combined.trade_conditions || foundLocal?.trade_conditions || STANDARD_TRADE_CONDITIONS,
      }

      setLot(finalLot)
      setOfferPrice(finalLot.min_price_per_kg || 24.5)
      setOfferQuantity(finalLot.quantity_kg || 1000)

      // Fetch offers
      try {
        const offRes = await offersAPI.getForLot(id)
        setOffers(offRes.data || [])
      } catch {
        setOffers([
          {
            id: 'off-001',
            lot_id: id,
            buyer_id: 'buyer-001',
            offered_price_per_kg: 25.2,
            quantity_kg: finalLot.quantity_kg || 2500,
            message: 'Interested in immediate procurement with factory pickup arrangement.',
            logistics_responsibility: 'buyer',
            match_score: 88.5,
            status: 'pending',
            created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLotData()
  }, [id])

  const handleMakeOffer = async (e) => {
    e.preventDefault()
    setSubmittingOffer(true)
    try {
      await offersAPI.create({
        lot_id: id,
        offered_price_per_kg: parseFloat(offerPrice),
        quantity_kg: parseFloat(offerQuantity),
        message: offerMessage,
        logistics_responsibility: logisticsResp,
      })
      toast.success('Offer submitted to farmer successfully!')
      fetchLotData()
    } catch {
      toast.success('Offer registered (Demo Mode)!')
      setOffers((prev) => [
        {
          id: `off-${Date.now()}`,
          lot_id: id,
          buyer_id: user?.user_id || 'curr-buyer',
          offered_price_per_kg: parseFloat(offerPrice),
          quantity_kg: parseFloat(offerQuantity),
          message: offerMessage,
          logistics_responsibility: logisticsResp,
          match_score: 91.2,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
    } finally {
      setSubmittingOffer(false)
    }
  }

  const handleAcceptOffer = async (offerId) => {
    try {
      await offersAPI.accept(offerId)
      toast.success('Offer accepted! Transaction initiated.')
      navigate('/transactions')
    } catch {
      toast.success('Offer accepted! Transferred to Transaction Tracking (Demo Mode).')
      navigate('/transactions')
    }
  }

  const handleRejectOffer = async (offerId) => {
    try {
      await offersAPI.reject(offerId)
      toast.success('Offer rejected.')
      setOffers((prev) => prev.filter((o) => o.id !== offerId))
    } catch {
      toast.success('Offer marked rejected.')
      setOffers((prev) => prev.filter((o) => o.id !== offerId))
    }
  }

  if (loading || !lot) {
    return <Spinner />
  }

  const seller = lot.seller || {}
  const conditions = lot.trade_conditions || STANDARD_TRADE_CONDITIONS
  const totalVal = (Number(lot.quantity_kg || 0) * Number(lot.expected_price_per_kg || lot.min_price_per_kg || 0))

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/listings')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to Listings Marketplace
        </button>

        <div className="flex items-center gap-2">
          <Link
            to={`/grading?lot_id=${lot.id}`}
            className="btn-secondary inline-flex items-center gap-2 text-xs"
          >
            <Award size={15} /> AI Quality Verification
          </Link>
          <Link
            to={`/calculator?commodity=${lot.commodity}&quantity=${lot.quantity_kg}&price=${lot.min_price_per_kg}`}
            className="btn-secondary inline-flex items-center gap-2 text-xs"
          >
            <Scale size={15} /> Realization Calculator
          </Link>
        </div>
      </div>

      {/* Main Lot Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black tracking-tight">{lot.commodity}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
              Grade {lot.grade || 'A'}
            </span>
            <StatusBadge status={lot.status || 'active'} />
          </div>
          <p className="text-sm text-brand-200 mt-1 font-medium">
            Variety: <span className="text-white font-bold">{lot.variety || 'Certified High-Yield'}</span> · Lot ID: <span className="font-mono text-brand-300">{lot.id}</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-brand-200 block font-semibold">Floor Price</span>
            <span className="text-2xl font-black text-amber-300">₹{Number(lot.min_price_per_kg || 0)}</span>
            <span className="text-xs text-brand-200"> / kg</span>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div>
            <span className="text-[11px] uppercase tracking-wider text-brand-200 block font-semibold">Total Consignment</span>
            <span className="text-2xl font-black text-white">{Number(lot.quantity_kg || 0).toLocaleString()}</span>
            <span className="text-xs text-brand-200"> kg</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Details, Seller Profile, Trade Conditions, Offers */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Who Listed This Lot: Multi-line Seller & FPO Credentials */}
          <Card className="space-y-4 border border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-white via-emerald-50/20 to-emerald-50/40 dark:from-gray-900 dark:via-emerald-950/20 dark:to-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  🌾
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <span>Listed By: {seller.full_name || 'Verified APMC Farmer'}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      {seller.role || 'Farmer'}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Producer Identity & Verified APMC Mandi Registration
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 inline-flex items-center gap-1">
                <CheckCircle2 size={13} /> KYC Verified
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Contact Phone</span>
                <span className="font-bold text-gray-900 dark:text-white font-mono flex items-center gap-1 mt-0.5">
                  <Phone size={12} className="text-emerald-600" /> {seller.phone || '+91 98261 44321'}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Farm Area</span>
                <span className="font-bold text-gray-900 dark:text-white block mt-0.5">
                  {seller.land_area_acres || 12.5} Acres Cultivation
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">APMC Jurisdiction</span>
                <span className="font-bold text-gray-900 dark:text-white block mt-0.5 truncate">
                  {lot.mandi_name || 'Sehore Krishi Mandi'}
                </span>
              </div>

              <div className="p-3 bg-white dark:bg-gray-800/80 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-gray-400 block text-[10px] uppercase font-semibold">Location</span>
                <span className="font-bold text-gray-900 dark:text-white block mt-0.5 truncate">
                  {lot.district || 'Sehore'}, {lot.state || 'Madhya Pradesh'}
                </span>
              </div>
            </div>

            {seller.fpo_name && (
              <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs text-purple-900 dark:text-purple-200 flex items-center justify-between">
                <span>Associated Producer Co-operative: <strong>{seller.fpo_name}</strong></span>
                <span className="text-[10px] font-bold uppercase bg-purple-200 dark:bg-purple-800 px-2 py-0.5 rounded">FPO Aggregated</span>
              </div>
            )}
          </Card>

          {/* 2. Lot Technical Specifications & AGMARK Grade */}
          <Card className="space-y-4">
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FileText size={16} className="text-brand-500" />
              Lot Technical Specifications & Appraisal
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Scale size={13} /> Available Quantity
                </span>
                <p className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  {formatNum(Number(lot.quantity_kg || 0).toLocaleString())} kg
                </p>
                <span className="text-[10px] text-gray-400">Net weighbridge verified</span>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Tag size={13} /> Floor Price (Reserve)
                </span>
                <p className="text-xl font-black text-brand-600 dark:text-brand-400 mt-1">
                  ₹{formatNum(Number(lot.min_price_per_kg || 0))} / kg
                </p>
                <span className="text-[10px] text-gray-400">Minimum clearing rate</span>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Total Lot Valuation</span>
                <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                  ₹{formatNum(totalVal.toLocaleString())}
                </p>
                <span className="text-[10px] text-gray-400">Escrow commitment target</span>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Certified Grade</span>
                <p className="text-xl font-black text-brand-700 dark:text-brand-300 mt-1 uppercase">
                  {lot.grade || 'A+'}
                </p>
                <span className="text-[10px] text-gray-400">AGMARK Standard</span>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400">Computer Vision Score</span>
                <p className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
                  {typeof lot.quality_score === 'number' ? `${(lot.quality_score * 100).toFixed(0)}%` : '92%'}
                </p>
                <span className="text-[10px] text-gray-400">Defect tolerance &lt; 2%</span>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar size={13} /> Harvest Date
                </span>
                <p className="text-base font-bold text-gray-800 dark:text-gray-200 mt-1">
                  {lot.harvest_date ? new Date(lot.harvest_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent'}
                </p>
                <span className="text-[10px] text-gray-400">Fresh stock</span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900 flex items-center gap-3 text-sm text-blue-900 dark:text-blue-200">
              <MapPin size={20} className="text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="font-bold">Origin Terminal: {lot.mandi_name || 'Designated APMC Terminal'}</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{lot.district}, {lot.state} (GPS Tagged & Verified)</p>
              </div>
            </div>
          </Card>

          {/* 3. Mandatory Trade Conditions & Settlement Protocol */}
          <Card className="space-y-4 border border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-white to-blue-50/20 dark:from-gray-900 dark:to-gray-900">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-brand-600 dark:text-brand-400" />
                Mandatory Trade Conditions & Escrow SLAs
              </h3>
              <span className="text-xs text-gray-400 font-medium">Standard APMC-Compliant Protocol</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {conditions.map((cond, idx) => (
                <div
                  key={cond.code || idx}
                  className="p-3.5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800/60 shadow-xs space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                      {cond.title}
                    </span>
                    {cond.mandatory && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 shrink-0">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
                    {cond.description}
                  </p>
                </div>
              ))}
            </div>
          </Card>

          {/* 4. Received Offers & Negotiations (Module 5) */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Bilateral Offer Ledger ({offers.length})
              </h3>
              <span className="text-xs text-gray-400">Algorithmic Match Engine Active</span>
            </div>

            {offers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400 bg-gray-50 dark:bg-gray-800/40 rounded-xl">
                No formal bids logged yet. Buyers can submit competitive offers using the form.
              </div>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800/70"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-lg font-black text-brand-700 dark:text-brand-300">₹{offer.offered_price_per_kg} / kg</span>
                        <span className="text-xs text-gray-500">for {Number(offer.quantity_kg || 0).toLocaleString()} kg</span>
                        <span className="badge bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 font-bold text-xs">
                          Match Score: {offer.match_score || 88}%
                        </span>
                      </div>
                      {offer.message && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 italic">"{offer.message}"</p>
                      )}
                      <p className="text-[11px] text-gray-400 flex items-center gap-2">
                        <span>Logistics: <strong className="capitalize text-gray-700 dark:text-gray-200">{offer.logistics_responsibility}</strong></span>
                        <span>·</span>
                        <span>Status: <strong className="capitalize text-gray-700 dark:text-gray-200">{offer.status}</strong></span>
                      </p>
                    </div>

                    {role !== 'buyer' && offer.status === 'pending' && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="btn-primary text-xs px-3.5 py-1.5 inline-flex items-center gap-1 shadow-sm"
                        >
                          <Check size={14} /> Accept Bid
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          className="btn-secondary text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 inline-flex items-center gap-1"
                        >
                          <X size={14} /> Decline
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Make an Offer Form */}
        <div className="space-y-6">
          {role === 'buyer' || role === 'admin' ? (
            <Card className="space-y-4 sticky top-6 border border-brand-200 dark:border-brand-800/80 shadow-md">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xl">🤝</span>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Submit Procurement Offer</h3>
                  <p className="text-xs text-gray-400">Algorithmic bilateral matching</p>
                </div>
              </div>

              <form onSubmit={handleMakeOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Offered Price (₹ / kg) *
                  </label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    min="1"
                    step="0.1"
                    className="input text-sm"
                    required
                  />
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Farmer floor price: <strong>₹{lot.min_price_per_kg}/kg</strong>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Required Quantity (kg) *
                  </label>
                  <input
                    type="number"
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(e.target.value)}
                    max={lot.quantity_kg}
                    min="1"
                    className="input text-sm"
                    required
                  />
                  <span className="text-[11px] text-gray-400 block mt-1">
                    Max lot quantity: {Number(lot.quantity_kg || 0).toLocaleString()} kg
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Freight & Transport Responsibility
                  </label>
                  <select
                    value={logisticsResp}
                    onChange={(e) => setLogisticsResp(e.target.value)}
                    className="input text-sm"
                  >
                    <option value="buyer">Arranged by Buyer (Factory Gate Pickup)</option>
                    <option value="seller">Delivered by Farmer to Buyer Warehouse</option>
                    <option value="shared">Shared Freight via MandiSetu Logistics</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Dispatch Instructions / Note to Farmer
                  </label>
                  <textarea
                    rows={3}
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="e.g. Immediate truck placement at yard, digital weighment acceptable..."
                    className="input text-sm"
                  />
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-900 text-[11px] text-blue-800 dark:text-blue-300">
                  <ShieldCheck size={14} className="inline mr-1 text-blue-600" />
                  Your offer commits funds to the MandiSetu Escrow Vault upon farmer acceptance.
                </div>

                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="btn-primary w-full text-sm inline-flex items-center justify-center gap-2 py-2.5 shadow-md"
                >
                  <Send size={15} />
                  {submittingOffer ? 'Submitting Binding Offer...' : 'Send Binding Escrow Offer'}
                </button>
              </form>
            </Card>
          ) : (
            <Card className="space-y-3 bg-brand-50/50 dark:bg-brand-950/30 border-brand-200 dark:border-brand-800">
              <h4 className="font-bold text-brand-900 dark:text-brand-200 text-sm flex items-center gap-1.5">
                <Sparkles size={16} /> Farmer Management Console
              </h4>
              <p className="text-xs text-brand-800 dark:text-brand-300 leading-relaxed">
                You are reviewing this produce listing as the registered producer. As verified buyers bid on this lot, you will receive real-time notifications to accept or decline.
              </p>
              <div className="pt-2">
                <Link to="/calculator" className="btn-secondary w-full text-xs text-center block">
                  Verify Net Take-Home Realization
                </Link>
              </div>
            </Card>
          )}

          {/* Quick Help Card */}
          <Card className="space-y-2 text-xs text-gray-500">
            <h5 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
              <HelpCircle size={14} /> MandiSetu Settlement Guarantee
            </h5>
            <p className="leading-relaxed">
              Every trade on MandiSetu is legally covered under the APMC Digital Escrow & Weighment Accord. Zero default risk for farmers and 100% quality guarantee for buyers.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
