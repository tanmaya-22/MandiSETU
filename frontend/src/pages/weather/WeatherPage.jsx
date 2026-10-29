import { useState } from 'react'
import { weatherAPI } from '../../api/modules'
import { Card, PageHeader, StatusBadge, Spinner } from '../../components/common/UI'
import {
  CloudRain, Wind, Droplets, Thermometer, AlertTriangle,
  CheckCircle, ArrowRight, Sun, CloudLightning
} from 'lucide-react'
import toast from 'react-hot-toast'

const PRESET_REGIONS = [
  { name: 'Kolar, Karnataka (Tomato Hub)', lat: 13.1367, lng: 78.1291, defaultCrop: 'Tomato' },
  { name: 'Nashik, Maharashtra (Onion Belt)', lat: 19.9975, lng: 73.7898, defaultCrop: 'Onion' },
  { name: 'Hapur, UP (Wheat & Grain)', lat: 28.7306, lng: 77.7759, defaultCrop: 'Wheat' },
  { name: 'Agra, UP (Potato Belt)', lat: 27.1767, lng: 78.0081, defaultCrop: 'Potato' },
  { name: 'Amritsar, Punjab (Basmati Rice)', lat: 31.6340, lng: 74.8723, defaultCrop: 'Rice' },
]

export default function WeatherPage() {
  const [selectedRegion, setSelectedRegion] = useState(PRESET_REGIONS[0])
  const [commodity, setCommodity] = useState('Tomato')
  const [loading, setLoading] = useState(false)

  const [weatherData, setWeatherData] = useState({
    location: 'Kolar, Karnataka',
    commodity: 'Tomato',
    risk_level: 'medium',
    risk_factors: [
      'Elevated relative humidity (78%) elevates fungal blight spore germination risk.',
      'Scattered afternoon showers forecast (4mm/hr) may impact open-cart transport.',
    ],
    advisory: 'Harvest tomatoes in the early morning before peak ambient heat. Ensure tarpaulin coverings during farm-to-mandi road transit to prevent moisture accumulation.',
    current_weather: {
      temp: 27.4,
      humidity: 78,
      wind_speed: 12.5,
      rain_1h: 1.2,
      description: 'scattered thunderstorm clouds',
    },
    forecast_7day: [
      { dt: 'Today', temp: 27.4, humidity: 78, description: 'light rain' },
      { dt: 'Tomorrow', temp: 28.1, humidity: 72, description: 'partly cloudy' },
      { dt: 'Day 3', temp: 29.0, humidity: 65, description: 'sunny' },
      { dt: 'Day 4', temp: 29.5, humidity: 60, description: 'clear sky' },
      { dt: 'Day 5', temp: 28.8, humidity: 64, description: 'mild breeze' },
      { dt: 'Day 6', temp: 27.9, humidity: 70, description: 'cloudy' },
      { dt: 'Day 7', temp: 26.5, humidity: 82, description: 'moderate rain' },
    ],
  })

  const handleFetch = async () => {
    setLoading(true)
    try {
      const res = await weatherAPI.getRisk(selectedRegion.lat, selectedRegion.lng, commodity)
      setWeatherData(res.data)
      toast.success('Agro-weather advisory updated!')
    } catch {
      // Mock update based on crop
      setWeatherData((prev) => ({
        ...prev,
        location: selectedRegion.name,
        commodity,
        risk_level: commodity === 'Tomato' ? 'medium' : 'low',
        advisory: `Favorable atmospheric conditions present for ${commodity} handling across ${selectedRegion.name}.`,
      }))
      toast.success('Agro-meteorological forecast refreshed (Demo Mode)!')
    } finally {
      setLoading(false)
    }
  }

  const handleRegionChange = (e) => {
    const reg = PRESET_REGIONS.find((r) => r.name === e.target.value)
    if (reg) {
      setSelectedRegion(reg)
      setCommodity(reg.defaultCrop)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Weather-Integrated Agro-Risk Advisory (Module 11)"
        subtitle="Localized climate risk modelling synthesizing IMD & OpenWeather signals with commodity-specific biophysical thresholds."
      />

      {/* Control Selector */}
      <Card className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex-1 w-full sm:w-auto">
          <label className="block text-xs font-medium text-gray-500 mb-1">Select Farming Region</label>
          <select
            value={selectedRegion.name}
            onChange={handleRegionChange}
            className="input text-sm"
          >
            {PRESET_REGIONS.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-48">
          <label className="block text-xs font-medium text-gray-500 mb-1">Target Crop</label>
          <input
            type="text"
            value={commodity}
            onChange={(e) => setCommodity(e.target.value)}
            className="input text-sm"
          />
        </div>

        <button
          onClick={handleFetch}
          disabled={loading}
          className="btn-primary w-full sm:w-auto self-end text-sm"
        >
          {loading ? 'Polling Radar...' : 'Evaluate Climate Risk'}
        </button>
      </Card>

      {/* Weather Dashboard Output */}
      {weatherData && (
        <div className="space-y-6">
          {/* Main Risk Advisory Banner */}
          <div
            className={`p-6 rounded-2xl border text-white shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${
              weatherData.risk_level === 'low'
                ? 'bg-gradient-to-r from-green-700 to-brand-800 border-green-600'
                : weatherData.risk_level === 'medium'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-700 border-amber-500'
                : 'bg-gradient-to-r from-red-700 to-rose-800 border-red-600'
            }`}
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                <AlertTriangle size={14} /> Risk Level: {weatherData.risk_level}
              </div>
              <h2 className="text-xl font-bold">{weatherData.location}</h2>
              <p className="text-sm text-white/90 max-w-2xl leading-relaxed">
                {weatherData.advisory}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/20 text-center shrink-0">
              <span className="text-3xl font-bold">{weatherData.current_weather.temp}°C</span>
              <span className="text-xs text-white/80 block capitalize">
                {weatherData.current_weather.description}
              </span>
            </div>
          </div>

          {/* Current Micro-climate Sensors */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
                <Thermometer size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Temperature</span>
                <span className="text-base font-bold text-gray-900">{weatherData.current_weather.temp}°C</span>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                <Droplets size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Humidity</span>
                <span className="text-base font-bold text-gray-900">{weatherData.current_weather.humidity}%</span>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-lg">
                <Wind size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Wind Velocity</span>
                <span className="text-base font-bold text-gray-900">{weatherData.current_weather.wind_speed} km/h</span>
              </div>
            </Card>

            <Card className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <CloudRain size={20} />
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Precipitation</span>
                <span className="text-base font-bold text-gray-900">{weatherData.current_weather.rain_1h || 0} mm/h</span>
              </div>
            </Card>
          </div>

          {/* Risk Factors Checklist */}
          {weatherData.risk_factors?.length > 0 && (
            <Card className="space-y-3">
              <h4 className="text-sm font-bold text-gray-900">Biophysical Risk Triggers</h4>
              <ul className="space-y-2">
                {weatherData.risk_factors.map((f, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2 bg-gray-50 p-2.5 rounded-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* 7-Day Forecast Horizon */}
          <Card className="space-y-3">
            <h4 className="text-sm font-bold text-gray-900">7-Day Transit Weather Horizon</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {weatherData.forecast_7day.map((d, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-2.5 text-center text-xs space-y-1">
                  <span className="text-gray-500 block font-medium">{d.dt}</span>
                  <Sun size={20} className="mx-auto text-amber-500 my-1" />
                  <span className="font-bold text-gray-900 block">{d.temp}°C</span>
                  <span className="text-[10px] text-gray-400 capitalize block truncate">
                    {d.description}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
