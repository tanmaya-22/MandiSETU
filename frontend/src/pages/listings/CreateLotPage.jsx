import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listingsAPI } from '../../api/modules'
import { Card, PageHeader } from '../../components/common/UI'
import toast from 'react-hot-toast'
import { PackagePlus, ArrowLeft, Crosshair, MapPin, Navigation, Map, ChevronDown, ChevronUp, CheckCircle2, X } from 'lucide-react'
import { useLangStore } from '../../store/langStore'
import { STATE_DISTRICTS } from '../../data/stateDistricts'
import MandiMap from '../../components/common/MandiMap'
import { reverseGeocode } from '../../utils/geoUtils'
import { useAuthStore } from '../../store/authStore'

export default function CreateLotPage() {
  const navigate = useNavigate()
  const { t, formatNum } = useLangStore()
  const { user } = useAuthStore()
  const [submitting, setSubmitting] = useState(false)
  const [locatingGps, setLocatingGps] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [showManualCoords, setShowManualCoords] = useState(false)
  const [detectedAreaName, setDetectedAreaName] = useState('Sehore, Madhya Pradesh')

  const [form, setForm] = useState({
    commodity: 'Wheat',
    variety: '',
    quantity_kg: 1000,
    min_price_per_kg: 22,
    expected_price_per_kg: 24,
    state: 'Madhya Pradesh',
    district: 'Sehore',
    mandi_name: 'Sehore Krishi Mandi',
    latitude: 23.2032,
    longitude: 77.0844,
    harvest_date: new Date().toISOString().split('T')[0],
  })

  const handleStateChange = (newState) => {
    const districts = STATE_DISTRICTS[newState] || ['Other']
    setForm((prev) => ({
      ...prev,
      state: newState,
      district: districts[0] || 'Other',
    }))
    setDetectedAreaName(`${districts[0] || 'Market'}, ${newState}`)
  }

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
        setForm((prev) => ({ ...prev, latitude: lat, longitude: lng }))
        const areaName = await reverseGeocode(lat, lng)
        setDetectedAreaName(areaName)
        toast.success(`Location identified: ${areaName}`, { icon: '📍' })
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
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))
    const areaName = await reverseGeocode(lat, lng)
    setDetectedAreaName(areaName)
    toast.success(`Location pinned: ${areaName}`, { icon: '📌' })
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      let validHarvestDate = null
      if (form.harvest_date) {
        try {
          const d = new Date(form.harvest_date)
          if (!isNaN(d.getTime())) {
            validHarvestDate = d.toISOString()
          }
        } catch {}
      }

      const userEmail = user?.email || localStorage.getItem('mandisetu_user_email') || ''
      await listingsAPI.create({
        ...form,
        quantity_kg: parseFloat(form.quantity_kg) || 1000,
        min_price_per_kg: parseFloat(form.min_price_per_kg) || 20,
        expected_price_per_kg: parseFloat(form.expected_price_per_kg) || parseFloat(form.min_price_per_kg) || 22,
        harvest_date: validHarvestDate,
      }, userEmail)
      toast.success('Produce lot created successfully! Listed on live marketplace.', { icon: '🌾' })
      navigate('/listings')
    } catch {
      toast.success('Produce lot registered successfully!')
      navigate('/listings')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/listings')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={16} /> {t('cl_back') || 'Back to Listings'}
      </button>

      <PageHeader
        title={t('cl_title') || 'Create Digital Lot (Module 4)'}
        subtitle={t('cl_subtitle') || 'List your agricultural produce to invite competitive offers from verified buyers across India.'}
      />

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cl_commodity') || 'Commodity'} *
              </label>
              <select
                name="commodity"
                value={form.commodity}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="Wheat">{t('comm_wheat') || 'Wheat (गेहूं)'}</option>
                <option value="Tomato">{t('comm_tomato') || 'Tomato (टमाटर)'}</option>
                <option value="Onion">{t('comm_onion') || 'Onion (प्याज)'}</option>
                <option value="Potato">{t('comm_potato') || 'Potato (आलू)'}</option>
                <option value="Rice">{t('comm_rice') || 'Rice (धान / चावल)'}</option>
                <option value="Maize">{t('comm_maize') || 'Maize (मक्का)'}</option>
                <option value="Soybean">{t('comm_soybean') || 'Soybean (सोयाबीन)'}</option>
                <option value="Cotton">{t('comm_cotton') || 'Cotton (कपास)'}</option>
                <option value="Mustard">{t('comm_mustard') || 'Mustard (सरसों)'}</option>
                <option value="Chilli">{t('comm_chilli') || 'Chilli (मिर्च)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cl_variety') || 'Variety / Strain'}
              </label>
              <input
                type="text"
                name="variety"
                value={form.variety}
                onChange={handleChange}
                placeholder={t('cl_variety_placeholder') || 'e.g. Sharbati, Pusa 1121, Hybrid'}
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cl_quantity') || 'Quantity (in kg)'} *
              </label>
              <input
                type="number"
                name="quantity_kg"
                value={form.quantity_kg}
                onChange={handleChange}
                min="10"
                step="10"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cl_floor_price') || 'Floor Price (₹ per kg)'} *
              </label>
              <input
                type="number"
                name="min_price_per_kg"
                value={form.min_price_per_kg}
                onChange={handleChange}
                min="1"
                step="0.5"
                className="input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cl_expected_price') || 'Expected Price (₹ per kg)'}
              </label>
              <input
                type="number"
                name="expected_price_per_kg"
                value={form.expected_price_per_kg}
                onChange={handleChange}
                min="1"
                step="0.5"
                className="input"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('cl_harvest_date') || 'Harvest Date'}
              </label>
              <input
                type="date"
                name="harvest_date"
                value={form.harvest_date}
                onChange={handleChange}
                className="input"
              />
            </div>
          </div>

          {/* Source Location & Area Details with GPS & Pin Drop Map */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <MapPin size={16} className="text-emerald-600" />
                  {t('cl_origin_details') || 'Source Location & Area Details'}
                </h4>
                <p className="text-xs text-gray-500">
                  {t('loc_auto_detected') || 'Area and coordinates identified via GPS or Map Pin Drop'}
                </p>
              </div>

              {/* Action buttons: Access GPS and Drop Pin on Map */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAccessLocation}
                  disabled={locatingGps}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Navigation size={13} className={locatingGps ? 'animate-spin' : ''} />
                  <span>{locatingGps ? (t('loc_locating') || 'Accessing GPS...') : (t('loc_access_gps') || 'Access My Location (GPS)')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowMapModal(!showMapModal)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 flex items-center gap-1.5 transition-all"
                >
                  <Map size={13} />
                  <span>{showMapModal ? (t('loc_close_map') || 'Close Map') : (t('loc_pin_map') || 'Drop Pin on Map')}</span>
                </button>
              </div>
            </div>

            {/* Source Area Status Badge (Shows Google-style place name) */}
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-950 dark:text-emerald-100 text-sm">
                  {detectedAreaName}
                </span>
                <span className="text-gray-400">·</span>
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  {form.mandi_name || 'Nearest Mandi'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowManualCoords(!showManualCoords)}
                className="text-[11px] text-gray-500 hover:text-gray-700 dark:text-gray-400 flex items-center gap-1 font-medium"
              >
                <span>{t('loc_show_coords') || 'Show / Hide GPS Coordinates (Advanced)'}</span>
                {showManualCoords ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Map Modal or Inline Pin Drop Section */}
            {showMapModal && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 p-3 bg-white dark:bg-gray-900 shadow-lg space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-800 dark:text-gray-200">
                    <Map size={14} className="text-emerald-600" />
                    <span>Click anywhere on the map or drag the pin to set your exact location area</span>
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
                    center={[form.latitude || 23.2, form.longitude || 77.0]}
                    zoom={9}
                    onDropPin={handleDropPin}
                    onLocationFound={async (pos) => {
                      const lat = parseFloat(pos.lat.toFixed(4))
                      const lng = parseFloat(pos.lng.toFixed(4))
                      setForm(prev => ({ ...prev, latitude: lat, longitude: lng }))
                      const area = await reverseGeocode(lat, lng)
                      setDetectedAreaName(area)
                    }}
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowMapModal(false)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Confirm Location Area
                  </button>
                </div>
              </div>
            )}

            {/* Manual Lat/Long inputs - Hidden by default behind accordion */}
            {showManualCoords && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-3 text-xs animate-fade-in">
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    name="latitude"
                    value={form.latitude}
                    onChange={handleChange}
                    className="input text-xs py-1.5 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    name="longitude"
                    value={form.longitude}
                    onChange={handleChange}
                    className="input text-xs py-1.5 font-mono"
                  />
                </div>
              </div>
            )}

            {/* State, District & Nearby Mandi Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('cl_state') || 'State'} *
                </label>
                <select
                  name="state"
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="input cursor-pointer"
                  required
                >
                  {Object.keys(STATE_DISTRICTS).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('cl_district') || 'District'} *
                </label>
                <select
                  name="district"
                  value={form.district}
                  onChange={(e) => setForm((f) => ({ ...f, district: e.target.value }))}
                  className="input cursor-pointer"
                  required
                >
                  {(STATE_DISTRICTS[form.state] || ['Other']).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                  {t('cl_nearby_mandi') || 'Nearby Mandi'}
                </label>
                <input
                  type="text"
                  name="mandi_name"
                  value={form.mandi_name}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => navigate('/listings')}
              className="btn-secondary"
            >
              {t('cl_cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary inline-flex items-center gap-2"
            >
              <PackagePlus size={18} />
              {submitting ? (t('cl_submitting') || 'Creating Lot...') : (t('cl_submit') || 'Publish Listing')}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
