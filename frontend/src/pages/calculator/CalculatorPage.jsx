import { useState } from 'react'
import toast from 'react-hot-toast'
import { Plus, Trash2, Calculator, Award, Loader2 } from 'lucide-react'
import { calcAPI } from '../../api/modules'
import { PageHeader, Spinner } from '../../components/common/UI'

const INITIAL_MARKET = { name: '', lat: '', lng: '', modal_price: '', commission_pct: 2.5 }

const MOCK_RESULT = [
  { market_name: 'Azadpur Mandi', distance_km: 45, transport_cost: 4500, commission: 2250, storage_cost: 800, net_realization: 38450, modal_price: 46000 },
  { market_name: 'Vashi APMC', distance_km: 280, transport_cost: 18200, commission: 2300, storage_cost: 800, net_realization: 24700, modal_price: 46000 },
  { market_name: 'Lasalgaon', distance_km: 320, transport_cost: 20800, commission: 1900, storage_cost: 800, net_realization: 22500, modal_price: 46000 },
]

export default function CalculatorPage() {
  const [form, setForm] = useState({
    commodity: 'Wheat',
    quantity_kg: '',
    my_lat: '',
    my_lng: '',
    storage_days: 0,
  })
  const [markets, setMarkets] = useState([{ ...INITIAL_MARKET }])
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setMarket = (i, k, v) =>
    setMarkets((ms) => ms.map((m, idx) => idx === i ? { ...m, [k]: v } : m))

  const addMarket = () => {
    if (markets.length >= 5) { toast.error('Maximum 5 markets allowed'); return }
    setMarkets((ms) => [...ms, { ...INITIAL_MARKET }])
  }
  const removeMarket = (i) => setMarkets((ms) => ms.filter((_, idx) => idx !== i))

  const calculate = async () => {
    if (!form.quantity_kg) { toast.error('Enter quantity'); return }
    setLoading(true)
    try {
      const payload = {
        commodity: form.commodity,
        quantity_kg: Number(form.quantity_kg),
        my_location: { lat: Number(form.my_lat) || 28.6, lng: Number(form.my_lng) || 77.2 },
        storage_days: Number(form.storage_days),
        markets: markets.map((m) => ({
          name: m.name || 'Market',
          lat: Number(m.lat) || 28.7,
          lng: Number(m.lng) || 77.1,
          modal_price: Number(m.modal_price),
          commission_pct: Number(m.commission_pct),
        })),
      }
      const { data } = await calcAPI.calculate(payload)
      setResults(data?.rankings || data || MOCK_RESULT)
    } catch {
      toast.error('Calculation failed — showing demo results')
      setResults(MOCK_RESULT)
    } finally {
      setLoading(false)
    }
  }

  const best = results?.[0]

  return (
    <div>
      <PageHeader
        title="Net Realization Calculator"
        subtitle="Compare mandis and find where you'll earn the most"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Produce Details */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Produce Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Commodity</label>
                <input
                  value={form.commodity}
                  onChange={(e) => setF('commodity', e.target.value)}
                  className="input-field"
                  placeholder="e.g. Wheat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity (kg)</label>
                <input
                  type="number"
                  value={form.quantity_kg}
                  onChange={(e) => setF('quantity_kg', e.target.value)}
                  className="input-field"
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">My Latitude</label>
                <input
                  type="number"
                  value={form.my_lat}
                  onChange={(e) => setF('my_lat', e.target.value)}
                  className="input-field"
                  placeholder="e.g. 28.6"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">My Longitude</label>
                <input
                  type="number"
                  value={form.my_lng}
                  onChange={(e) => setF('my_lng', e.target.value)}
                  className="input-field"
                  placeholder="e.g. 77.2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Days: {form.storage_days}
                </label>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={form.storage_days}
                  onChange={(e) => setF('storage_days', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Markets */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Target Markets</h3>
              <button onClick={addMarket} className="btn-secondary text-sm flex items-center gap-1 px-3 py-1.5">
                <Plus size={14} /> Add Market
              </button>
            </div>
            <div className="space-y-3">
              {markets.map((m, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Market {i + 1}</span>
                    {markets.length > 1 && (
                      <button onClick={() => removeMarket(i)} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-3">
                      <input
                        value={m.name}
                        onChange={(e) => setMarket(i, 'name', e.target.value)}
                        placeholder="Mandi name"
                        className="input-field"
                      />
                    </div>
                    <input value={m.lat} onChange={(e) => setMarket(i, 'lat', e.target.value)} placeholder="Latitude" className="input-field" type="number" />
                    <input value={m.lng} onChange={(e) => setMarket(i, 'lng', e.target.value)} placeholder="Longitude" className="input-field" type="number" />
                    <input value={m.modal_price} onChange={(e) => setMarket(i, 'modal_price', e.target.value)} placeholder="Modal Price (₹)" className="input-field" type="number" />
                    <input value={m.commission_pct} onChange={(e) => setMarket(i, 'commission_pct', e.target.value)} placeholder="Commission %" className="input-field" type="number" />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={calculate}
              disabled={loading}
              className="btn-primary w-full mt-4 py-3 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Calculator size={18} />}
              {loading ? 'Calculating…' : 'Calculate Net Realization'}
            </button>
          </div>
        </div>

        {/* Right: Info Card */}
        <div className="space-y-4">
          <div className="card bg-brand-50 border border-brand-200">
            <h4 className="font-semibold text-brand-800 mb-2">How it works</h4>
            <ul className="text-sm text-brand-700 space-y-2">
              <li>• Enter your farm location (lat/lng)</li>
              <li>• Add up to 5 potential markets</li>
              <li>• We calculate transport, commission & storage costs</li>
              <li>• Get ranked results showing your best market</li>
            </ul>
          </div>
          {best && (
            <div className="card border-2 border-brand-500 bg-brand-50">
              <div className="flex items-center gap-2 mb-2">
                <Award size={20} className="text-brand-600" />
                <span className="font-bold text-brand-700">Best Market</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{best.market_name}</p>
              <p className="text-2xl font-extrabold text-brand-700 mt-1">
                ₹{best.net_realization?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Net realization</p>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="mt-8">
          <h3 className="font-semibold text-gray-900 mb-4">📊 Ranked Results</h3>
          <div className="space-y-3">
            {results.map((r, i) => (
              <div
                key={i}
                className={`card ${i === 0 ? 'border-2 border-brand-500' : ''}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      i === 0 ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{r.market_name}</p>
                      <p className="text-xs text-gray-500">{r.distance_km} km away</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6 text-center">
                    <div>
                      <p className="text-xs text-gray-500">Transport</p>
                      <p className="font-semibold text-red-600">₹{r.transport_cost?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Commission</p>
                      <p className="font-semibold text-red-600">₹{r.commission?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Storage</p>
                      <p className="font-semibold text-red-600">₹{r.storage_cost?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Net Realization</p>
                      <p className={`font-extrabold text-lg ${i === 0 ? 'text-brand-700' : 'text-gray-800'}`}>
                        ₹{r.net_realization?.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                {i === 0 && (
                  <div className="mt-3 p-3 bg-brand-50 rounded-xl text-sm text-brand-700 flex items-center gap-2">
                    <Award size={16} />
                    Recommended: Highest net realization — sell here for maximum profit!
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
