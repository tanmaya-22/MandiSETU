import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Calculator, Award, Loader2, Sparkles, MapPin, Navigation, Info, ArrowRight, Crosshair, Pin } from 'lucide-react'
import { calcAPI } from '../../api/modules'
import { PageHeader, Spinner, Card } from '../../components/common/UI'
import MandiMap from '../../components/common/MandiMap'
import { useLangStore } from '../../store/langStore'

const PRESETS = [
  {
    label: '🧅 Maharashtra Onion Route',
    commodity: 'Onion',
    qty: 5000,
    myLat: 20.0,
    myLng: 74.0,
    originName: 'Niphad (Nashik)',
    markets: [
      { name: 'Lasalgaon APMC (Nashik)', lat: 20.1466, lng: 74.2259, modal_price: 3250, commission_pct: 2.0 },
      { name: 'Vashi APMC (Navi Mumbai)', lat: 19.0760, lng: 73.0075, modal_price: 3750, commission_pct: 2.5 },
      { name: 'Pimpalgaon Baswant APMC', lat: 20.1706, lng: 73.9856, modal_price: 3300, commission_pct: 2.0 },
    ],
  },
  {
    label: '🌾 North India Wheat Route',
    commodity: 'Wheat',
    qty: 8000,
    myLat: 30.5,
    myLng: 76.0,
    originName: 'Samrala (Punjab)',
    markets: [
      { name: 'Khanna Grain Market (Punjab)', lat: 30.7028, lng: 76.2195, modal_price: 2375, commission_pct: 1.5 },
      { name: 'Azadpur Mandi (Delhi)', lat: 28.7126, lng: 77.1723, modal_price: 2485, commission_pct: 2.5 },
      { name: 'Karnal Market (Haryana)', lat: 29.6857, lng: 76.9905, modal_price: 2410, commission_pct: 2.0 },
    ],
  },
]

// Haversine formula to calculate accurate geodesic distance in km
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

export default function CalculatorPage() {
  const { t, formatNum, formatPrice } = useLangStore()
  const [form, setForm] = useState({
    commodity: 'Onion',
    quantity_kg: 5000,
    my_lat: 20.0,
    my_lng: 74.0,
    storage_days: 0,
    originName: 'Niphad, Nashik',
  })
  const [markets, setMarkets] = useState(PRESETS[0].markets)
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [detectingGps, setDetectingGps] = useState(false)

  const handleAccessMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }
    setDetectingGps(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4))
        const lng = parseFloat(pos.coords.longitude.toFixed(4))
        setForm((f) => ({
          ...f,
          my_lat: lat,
          my_lng: lng,
          originName: `My Farm GPS (${lat}, ${lng})`,
        }))
        setDetectingGps(false)
        toast.success(`📍 GPS Position Detected: ${lat}, ${lng}`)
      },
      (err) => {
        console.warn('Geolocation error:', err)
        toast.error('Could not access GPS. Please check location permissions.')
        setDetectingGps(false)
      },
      { timeout: 8000 }
    )
  }

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setMarket = (i, k, v) =>
    setMarkets((ms) => ms.map((m, idx) => (idx === i ? { ...m, [k]: v } : m)))

  const applyPreset = (preset) => {
    setForm({
      commodity: preset.commodity,
      quantity_kg: preset.qty,
      my_lat: preset.myLat,
      my_lng: preset.myLng,
      storage_days: 0,
      originName: preset.originName,
    })
    setMarkets(preset.markets)
    setResults(null)
    toast.success(`Loaded ${preset.label} with real Agmarknet prices!`)
  }

  const addMarket = () => {
    if (markets.length >= 6) {
      toast.error('Maximum 6 markets allowed')
      return
    }
    setMarkets((ms) => [
      ...ms,
      { name: 'New Mandi', lat: form.my_lat + 0.5, lng: form.my_lng + 0.5, modal_price: 3000, commission_pct: 2.0 },
    ])
  }

  const removeMarket = (i) => setMarkets((ms) => ms.filter((_, idx) => idx !== i))

  const calculate = async () => {
    if (!form.quantity_kg || form.quantity_kg <= 0) {
      toast.error('Please enter a valid produce quantity in kg')
      return
    }
    setLoading(true)

    // Accurate local Haversine + Freight calculation
    const qtyKg = Number(form.quantity_kg)
    const qtyQtl = qtyKg / 100
    const storageDays = Number(form.storage_days) || 0

    // Freight model: base loading fee ₹80/qtl + ₹1.6/km/tonne
    const computedResults = markets.map((m) => {
      const dist = haversineDistance(
        Number(form.my_lat) || 20.0,
        Number(form.my_lng) || 74.0,
        Number(m.lat) || 20.0,
        Number(m.lng) || 74.0
      )
      const modalPricePerQtl = Number(m.modal_price) || 2500
      const grossRevenue = modalPricePerQtl * qtyQtl

      const freightPerQtl = Math.round(50 + dist * 1.6)
      const transportCost = freightPerQtl * qtyQtl

      const commPct = Number(m.commission_pct) || 2.0
      const commissionCost = Math.round((grossRevenue * commPct) / 100)

      const storageCost = Math.round(storageDays * 0.4 * qtyKg)

      const netRealization = Math.round(grossRevenue - transportCost - commissionCost - storageCost)
      const netPerKg = (netRealization / qtyKg).toFixed(1)

      return {
        market_name: m.name,
        distance_km: dist,
        modal_price: grossRevenue,
        modal_price_per_qtl: modalPricePerQtl,
        transport_cost: transportCost,
        commission: commissionCost,
        storage_cost: storageCost,
        net_realization: netRealization,
        net_per_kg: netPerKg,
      }
    })

    // Sort descending by highest take-home net realization
    computedResults.sort((a, b) => b.net_realization - a.net_realization)

    setTimeout(() => {
      setResults(computedResults)
      setLoading(false)
      toast.success('Net realization optimized across target markets!')
    }, 350)
  }

  const best = results?.[0]
  const worst = results?.[results.length - 1]
  const advantage = best && worst ? best.net_realization - worst.net_realization : 0

  return (
    <div className="space-y-6 animate-fade-in-up">
      <PageHeader
        title={t('cp_title') || 'Net Realization & Transport Cost Calculator'}
        subtitle={t('cp_subtitle') || 'Deduct Haversine freight, APMC cess, and storage degradation to find your highest take-home profit'}
      />

      {/* Quick Route Presets */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
          <Sparkles size={14} className="text-amber-500" /> {t('cp_quick_presets') || '1-Click Pre-filled Routes'}:
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.label}
            onClick={() => applyPreset(p)}
            className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:border-brand-500 hover:bg-brand-50 text-xs font-semibold text-gray-700 transition"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setShowMap(!showMap)}
          className={`ml-auto px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            showMap ? 'bg-brand-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          }`}
        >
          <MapPin size={14} />
          <span>{showMap ? (t('cp_hide_map') || 'Hide Map') : (t('cp_show_map') || 'Show Geospatial Map')}</span>
        </button>
      </div>

      {/* Geospatial Map toggle */}
      {showMap && (
        <div className="animate-fade-in-down">
          <MandiMap
            height="400px"
            selectedCommodity={form.commodity}
            onDropPin={(pos) => {
              setF('my_lat', parseFloat(pos.lat.toFixed(4)))
              setF('my_lng', parseFloat(pos.lng.toFixed(4)))
              toast.success(`Origin updated from pin: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`, { icon: '📌' })
            }}
            onLocationFound={(pos) => {
              setF('my_lat', parseFloat(pos.lat.toFixed(4)))
              setF('my_lng', parseFloat(pos.lng.toFixed(4)))
              toast.success(`GPS farm origin detected: ${pos.lat.toFixed(4)}, ${pos.lng.toFixed(4)}`, { icon: '📍' })
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Crop & Origin */}
          <div className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <Navigation size={18} className="text-brand-600" />
                <span>{t('cp_origin_details') || 'Farm Origin & Produce Details'}</span>
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAccessMyLocation}
                  disabled={detectingGps}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1.5 shadow-sm"
                  title="Detect GPS coordinates of your farm"
                >
                  <Crosshair size={14} className={detectingGps ? 'animate-spin' : ''} />
                  <span>{detectingGps ? 'Locating...' : 'Access My Location'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMap(!showMap)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm ${
                    showMap ? 'bg-brand-600 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                  }`}
                  title="Open map to pick or drop pin"
                >
                  <Pin size={14} />
                  <span>{showMap ? 'Close Pin Map' : 'Drop Pin on Map'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Commodity</label>
                <input
                  value={form.commodity}
                  onChange={(e) => setF('commodity', e.target.value)}
                  className="input-field"
                  placeholder="e.g. Onion, Wheat, Tomato"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('cp_qty_kg') || 'Quantity in Kilograms (kg)'}
                </label>
                <input
                  type="number"
                  value={form.quantity_kg}
                  onChange={(e) => setF('quantity_kg', e.target.value)}
                  className="input-field"
                  placeholder="e.g. 5000"
                />
                <span className="text-[11px] text-gray-500 mt-0.5 block">
                  = {formatNum((Number(form.quantity_kg) / 100).toFixed(1))} Quintals ({formatNum((Number(form.quantity_kg) / 1000).toFixed(2))} Tonnes)
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('cp_farm_lat') || 'Farm Origin GPS (Latitude)'}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.my_lat}
                  onChange={(e) => setF('my_lat', e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  {t('cp_farm_lng') || 'Farm Origin GPS (Longitude)'}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={form.my_lng}
                  onChange={(e) => setF('my_lng', e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1.5">
                <span>{t('cp_storage_days') || 'Storage / Holding Days before Transit'}:</span>
                <span className="font-bold text-brand-700">{formatNum(form.storage_days)} Days</span>
              </div>
              <input
                type="range"
                min={0}
                max={30}
                value={form.storage_days}
                onChange={(e) => setF('storage_days', e.target.value)}
                className="w-full accent-brand-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Target Mandis */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{t('cp_target_mandis') || 'Target APMC Mandis to Compare'}</h3>
                <p className="text-xs text-gray-500">Add up to 6 mandis to find the optimum selling destination</p>
              </div>
              <button
                onClick={addMarket}
                className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5"
              >
                <Plus size={14} /> {t('cp_add_mandi') || 'Add Mandi'}
              </button>
            </div>

            <div className="space-y-3">
              {markets.map((m, i) => (
                <div
                  key={i}
                  className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 transition hover:border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-800 bg-brand-50 px-2.5 py-0.5 rounded-full">
                      Destination {i + 1}
                    </span>
                    {markets.length > 1 && (
                      <button
                        onClick={() => removeMarket(i)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    <div className="sm:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">Mandi Name</label>
                      <input
                        value={m.name}
                        onChange={(e) => setMarket(i, 'name', e.target.value)}
                        placeholder="e.g. Vashi APMC"
                        className="input-field text-xs py-2"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">Modal Price (₹/Qtl)</label>
                      <input
                        type="number"
                        value={m.modal_price}
                        onChange={(e) => setMarket(i, 'modal_price', e.target.value)}
                        placeholder="₹3,200"
                        className="input-field text-xs py-2 font-bold text-brand-700"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-gray-500 block mb-0.5">APMC Cess (%)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={m.commission_pct}
                        onChange={(e) => setMarket(i, 'commission_pct', e.target.value)}
                        placeholder="2.0"
                        className="input-field text-xs py-2"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={calculate}
              disabled={loading}
              className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2 font-bold shadow-md hover:shadow-lg"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
              {loading ? 'Optimizing Routes…' : (t('cp_run_calc') || 'Run Net Realization Optimization')}
            </button>
          </div>
        </div>

        {/* Right Column: Comparative Results & Recommendation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {results ? (
            <div className="space-y-4 animate-scale-in">
              {/* Winner Banner */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-5 text-white shadow-xl">
                <div className="flex items-center gap-2 text-yellow-300 text-xs font-extrabold uppercase tracking-wider mb-1">
                  <Award size={18} />
                  <span>{t('cp_winner_title') || 'Optimal Recommendation'}</span>
                </div>
                <h3 className="text-xl font-extrabold">{best.market_name}</h3>
                <div className="mt-3 p-3 bg-white/15 backdrop-blur-md rounded-2xl">
                  <div className="text-xs text-emerald-100">{t('cp_max_take_home') || 'Maximum Take-Home Realization'}</div>
                  <div className="text-3xl font-extrabold">{formatPrice(best.net_realization)}</div>
                  <div className="text-xs text-emerald-200 mt-0.5">
                    ₹{formatNum(best.net_per_kg)}/kg {t('cp_in_hand_after') || 'in hand after freight'} ({formatPrice(best.transport_cost)} freight)
                  </div>
                </div>
                {advantage > 0 && (
                  <p className="text-xs text-emerald-100 mt-2 font-medium">
                    Selling here earns you <strong className="text-white font-extrabold">+{formatPrice(advantage)} extra</strong> compared to the least profitable mandi option.
                  </p>
                )}
              </div>

              {/* All Market Rankings */}
              <div className="card space-y-3">
                <h4 className="font-bold text-gray-900 text-sm">{t('cp_ranked_title') || 'All Evaluated Mandis (Ranked)'}</h4>
                {results.map((r, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border transition ${
                      idx === 0
                        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-brand-600 text-white' : 'bg-gray-200 text-gray-700'
                        }`}>
                          {formatNum(idx + 1)}
                        </span>
                        <span>{r.market_name}</span>
                      </div>
                      <span className="text-xs font-bold text-brand-700">{formatPrice(r.net_realization)}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px] text-gray-500 pt-1 border-t border-gray-200/60">
                      <div>{t('cp_distance') || 'Dist'}: <strong>{formatNum(r.distance_km)} km</strong></div>
                      <div>{t('cp_freight') || 'Freight'}: <strong>{formatPrice(r.transport_cost)}</strong></div>
                      <div>{t('cp_cess') || 'Cess'}: <strong>{formatPrice(r.commission)}</strong></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12 space-y-3 bg-white">
              <div className="w-12 h-12 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto">
                <Calculator size={24} />
              </div>
              <h4 className="font-bold text-gray-800 text-sm">Awaiting Calculation</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Click "Run Net Realization Optimization" or choose one of the pre-filled 1-Click routes above to compare in-hand earnings.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
