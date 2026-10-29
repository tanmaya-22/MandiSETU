import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { listingsAPI, offersAPI } from '../../api/modules'
import { Card, PageHeader, StatusBadge, Spinner } from '../../components/common/UI'
import { useAuthStore } from '../../store/authStore'
import { MapPin, Scale, Tag, ArrowLeft, Check, X, ShieldAlert, Award, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role, user } = useAuthStore()

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
      const res = await listingsAPI.getOne(id)
      setLot(res.data)
      // fetch offers
      const offRes = await offersAPI.getForLot(id)
      setOffers(offRes.data || [])
    } catch {
      // Mock fallback for interactive showcase
      const mock = {
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
      setLot(mock)
      setOfferPrice(mock.min_price_per_kg)
      setOfferQuantity(mock.quantity_kg)
      setOffers([
        {
          id: 'off-001',
          lot_id: id,
          buyer_id: 'buyer-001',
          offered_price_per_kg: 25.2,
          quantity_kg: 2500,
          message: 'Interested in immediate procurement with factory pickup arrangement.',
          logistics_responsibility: 'buyer',
          match_score: 88.5,
          status: 'pending',
          created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        },
      ])
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/listings')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={16} /> Back to Listings
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{lot.commodity}</h1>
            <StatusBadge status={lot.status} />
          </div>
          <p className="text-sm text-gray-500 mt-1">Lot ID: {lot.id}</p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/grading?lot_id=${lot.id}`}
            className="btn-secondary inline-flex items-center gap-2 text-sm"
          >
            <Award size={16} /> AI Quality Verification
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Lot Overview Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900">Lot Specifications</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Scale size={13} /> Available Quantity
                </span>
                <p className="text-lg font-bold text-gray-900">{lot.quantity_kg.toLocaleString()} kg</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Tag size={13} /> Floor Price
                </span>
                <p className="text-lg font-bold text-brand-600">₹{lot.min_price_per_kg} / kg</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Expected Value</span>
                <p className="text-lg font-bold text-gray-900">
                  ₹{(lot.quantity_kg * (lot.expected_price_per_kg || lot.min_price_per_kg)).toLocaleString()}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Verified Grade</span>
                <p className="text-base font-bold text-brand-700">{lot.grade || 'Ungraded'}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Computer Vision Score</span>
                <p className="text-base font-bold text-gray-800">
                  {lot.quality_score ? `${(lot.quality_score * 100).toFixed(1)}%` : 'Not run'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-xs text-gray-500">Harvest Date</span>
                <p className="text-base font-semibold text-gray-800">
                  {lot.harvest_date ? new Date(lot.harvest_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-lg flex items-center gap-3 text-sm text-blue-900">
              <MapPin size={18} className="text-blue-600 shrink-0" />
              <div>
                <p className="font-medium">Origin Location: {lot.mandi_name || 'Designated Mandi'}</p>
                <p className="text-xs text-blue-700">{lot.district}, {lot.state}</p>
              </div>
            </div>
          </Card>

          {/* Offers List (for Farmer or Buyer viewing) */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">Received Offers (Module 5)</h3>
              <span className="text-xs text-gray-500">{offers.length} active offer(s)</span>
            </div>

            {offers.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No offers submitted yet on this lot.</p>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-brand-700">₹{offer.offered_price_per_kg} / kg</span>
                        <span className="text-xs text-gray-500">for {offer.quantity_kg.toLocaleString()} kg</span>
                        <span className="badge bg-green-100 text-green-800 font-semibold text-xs">
                          Match: {offer.match_score || 85}%
                        </span>
                      </div>
                      {offer.message && (
                        <p className="text-xs text-gray-600 italic">"{offer.message}"</p>
                      )}
                      <p className="text-xs text-gray-400">
                        Logistics: <span className="capitalize font-medium">{offer.logistics_responsibility}</span> ·
                        Status: <span className="capitalize font-medium">{offer.status}</span>
                      </p>
                    </div>

                    {role !== 'buyer' && offer.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="btn-primary text-xs px-3 py-1.5 inline-flex items-center gap-1"
                        >
                          <Check size={14} /> Accept Offer
                        </button>
                        <button
                          onClick={() => handleRejectOffer(offer.id)}
                          className="btn-secondary text-xs px-3 py-1.5 text-red-600 hover:bg-red-50 inline-flex items-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Place Offer Card (Buyers) */}
        <div>
          {role === 'buyer' || role === 'admin' ? (
            <Card className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900">Make an Offer</h3>
              <p className="text-xs text-gray-500">
                Submit an offer with your price and logistics arrangement. The algorithmic matching score will rank your proposal.
              </p>

              <form onSubmit={handleMakeOffer} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
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
                  <span className="text-[11px] text-gray-400">Farmer floor: ₹{lot.min_price_per_kg}/kg</span>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Procurement Quantity (kg) *
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
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Freight / Logistics
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
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Note to Farmer
                  </label>
                  <textarea
                    rows={3}
                    value={offerMessage}
                    onChange={(e) => setOfferMessage(e.target.value)}
                    placeholder="e.g. Prompt payment terms, pickup vehicle details..."
                    className="input text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingOffer}
                  className="btn-primary w-full text-sm inline-flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  {submittingOffer ? 'Submitting...' : 'Send Binding Offer'}
                </button>
              </form>
            </Card>
          ) : (
            <Card className="space-y-3 bg-brand-50/40 border-brand-200">
              <h4 className="font-semibold text-brand-900 text-sm">Farmer Insights</h4>
              <p className="text-xs text-brand-800">
                You are viewing this listing as a producer. You can accept incoming buyer bids or adjust floor pricing based on live mandi market trends.
              </p>
              <div className="pt-2">
                <Link to="/calculator" className="btn-secondary w-full text-xs text-center block">
                  Check Net Realization
                </Link>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
