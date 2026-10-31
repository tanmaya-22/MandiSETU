import { useEffect, useRef, useState } from 'react'
import { MapPin, Navigation, Info, ArrowUpRight, Layers, ZoomIn, ZoomOut, Search, Crosshair, Pin } from 'lucide-react'
import { ALL_MANDIS } from '../../data/mandisData'

// Realistic coordinates and public data for major Indian mandis across all regions
export const MANDI_GEO_DATA = ALL_MANDIS

export default function MandiMap({
  selectedCommodity = 'All',
  onSelectMandi,
  onDropPin,
  onLocationFound,
  height = '500px',
  interactive = true,
}) {
  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [selectedMandi, setSelectedMandi] = useState(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [tileMode, setTileMode] = useState('standard') // 'standard' or 'satellite'
  const [userLocation, setUserLocation] = useState(null)
  const userMarkerRef = useRef(null)
  const droppedPinRef = useRef(null)
  const [droppedPin, setDroppedPin] = useState(null)
  const [locatingUser, setLocatingUser] = useState(false)
  const [pinDropMode, setPinDropMode] = useState(false)

  // Dynamically load Leaflet from reliable CDN so it never has bundler issues
  useEffect(() => {
    let isMounted = true

    const loadLeaflet = async () => {
      // 1. Add Leaflet CSS if not already present
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link')
        link.id = 'leaflet-css'
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // 2. Add Leaflet JS if not already loaded
      if (!window.L) {
        const script = document.createElement('script')
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload = () => {
          if (isMounted) initMap()
        }
        document.head.appendChild(script)
      } else {
        initMap()
      }
    }

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current || !window.L) return

      const L = window.L

      // Center around Central/Western India (covers major mandis)
      const map = L.map(mapContainerRef.current, {
        center: [21.5, 76.5],
        zoom: 5,
        zoomControl: false,
        attributionControl: false,
      })

      // Add 100% Free OpenStreetMap tile layer (Zero API key required, public domain)
      const standardTile = L.tileLayer(
        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
      )

      standardTile.addTo(map)
      mapInstanceRef.current = map
      setMapLoaded(true)
    }

    loadLeaflet()

    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  // Update markers when filtered or map loaded
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !window.L) return

    const L = window.L
    const map = mapInstanceRef.current

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const filtered = MANDI_GEO_DATA.filter((m) => {
      const matchComm = selectedCommodity === 'All' || m.commodity.toLowerCase() === selectedCommodity.toLowerCase()
      const matchSearch = !searchQuery || m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.city.toLowerCase().includes(searchQuery.toLowerCase()) || m.state.toLowerCase().includes(searchQuery.toLowerCase())
      return matchComm && matchSearch
    })

    filtered.forEach((mandi) => {
      // Custom styled HTML pin for Leaflet
      const isSelected = selectedMandi?.id === mandi.id
      const pinHtml = `
        <div class="relative group cursor-pointer">
          <div class="flex items-center gap-1.5 px-2.5 py-1 bg-white text-gray-900 rounded-full shadow-lg border-2 ${
            isSelected ? 'border-brand-600 ring-4 ring-brand-500/30 scale-110' : 'border-emerald-500'
          } font-bold text-xs whitespace-nowrap transition-all transform hover:scale-110">
            <span class="w-2 h-2 rounded-full ${isSelected ? 'bg-brand-600 animate-ping' : 'bg-emerald-500'}"></span>
            <span>₹${(mandi.modal_price / 100).toFixed(1)}/kg</span>
          </div>
          <div class="w-2 h-2 bg-emerald-600 rotate-45 mx-auto -mt-1 shadow-md"></div>
        </div>
      `

      const customIcon = L.divIcon({
        html: pinHtml,
        className: 'custom-mandi-pin',
        iconSize: [80, 36],
        iconAnchor: [40, 36],
      })

      const marker = L.marker([mandi.lat, mandi.lng], { icon: customIcon }).addTo(map)

      marker.on('click', () => {
        setSelectedMandi(mandi)
        if (onSelectMandi) onSelectMandi(mandi)
        map.flyTo([mandi.lat, mandi.lng], 8, { duration: 1.2 })
      })

      markersRef.current.push(marker)
    })
  }, [mapLoaded, selectedCommodity, searchQuery, selectedMandi])

  const handleZoomIn = () => mapInstanceRef.current?.zoomIn()
  const handleZoomOut = () => mapInstanceRef.current?.zoomOut()
  const handleReset = () => {
    mapInstanceRef.current?.flyTo([21.5, 76.5], 5, { duration: 1 })
    setSelectedMandi(null)
    // Clear dropped pin
    if (droppedPinRef.current) {
      droppedPinRef.current.remove()
      droppedPinRef.current = null
    }
    setDroppedPin(null)
  }

  const handleLocateMe = () => {
    if (!navigator.geolocation) return
    setLocatingUser(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        if (onLocationFound) onLocationFound({ lat: latitude, lng: longitude })
        const map = mapInstanceRef.current
        const L = window.L
        if (map && L) {
          // Remove old user marker if any
          if (userMarkerRef.current) userMarkerRef.current.remove()
          const userIcon = L.divIcon({
            html: `<div class="flex items-center justify-center w-8 h-8"><div class="w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-xl animate-pulse"></div></div>`,
            className: 'user-location-pin',
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          })
          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup(`<div class="text-xs font-bold text-center">📍 Your Location<br/><span class="font-mono text-gray-500">${latitude.toFixed(5)}, ${longitude.toFixed(5)}</span></div>`)
            .openPopup()
          map.flyTo([latitude, longitude], 10, { duration: 1.5 })
        }
        setLocatingUser(false)
      },
      (err) => {
        console.warn('[MandiSetu Map] Location access denied:', err)
        setLocatingUser(false)
      },
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const handleTogglePinDrop = () => {
    const map = mapInstanceRef.current
    if (!map) return
    if (pinDropMode) {
      // Exit pin drop mode
      setPinDropMode(false)
      map.getContainer().style.cursor = ''
      map.off('click')
    } else {
      setPinDropMode(true)
      map.getContainer().style.cursor = 'crosshair'
      map.once('click', (e) => {
        const L = window.L
        if (!L) return
        // Remove old dropped pin
        if (droppedPinRef.current) droppedPinRef.current.remove()
        const pinIcon = L.divIcon({
          html: `<div class="flex flex-col items-center"><div class="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-white">📌</div><div class="w-1.5 h-1.5 bg-red-700 rotate-45 -mt-0.5 mx-auto"></div></div>`,
          className: 'dropped-pin',
          iconSize: [24, 30],
          iconAnchor: [12, 30],
        })
        const marker = L.marker([e.latlng.lat, e.latlng.lng], { icon: pinIcon, draggable: true })
          .addTo(map)
          .bindPopup(`<div class="text-xs font-bold text-center">📌 Dropped Pin<br/><span class="font-mono text-gray-500">${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}</span></div>`)
          .openPopup()
        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          setDroppedPin({ lat: pos.lat, lng: pos.lng })
          if (onDropPin) onDropPin({ lat: pos.lat, lng: pos.lng })
          marker.setPopupContent(`<div class="text-xs font-bold text-center">📌 Dropped Pin<br/><span class="font-mono text-gray-500">${pos.lat.toFixed(5)}, ${pos.lng.toFixed(5)}</span></div>`)
        })
        droppedPinRef.current = marker
        setDroppedPin({ lat: e.latlng.lat, lng: e.latlng.lng })
        if (onDropPin) onDropPin({ lat: e.latlng.lat, lng: e.latlng.lng })
        setPinDropMode(false)
        map.getContainer().style.cursor = ''
      })
    }
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-md bg-gray-100">
      {/* Map Search & Control Header */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Search bar */}
        <div className="relative pointer-events-auto w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search mandi, city or state..."
            className="w-full pl-9 pr-4 py-2 bg-white/95 backdrop-blur-md rounded-xl text-xs font-medium border border-gray-200 shadow-md focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {/* Action badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl text-xs font-semibold text-gray-700 shadow-md border border-gray-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Agmarknet GPS Coordinates</span>
          </div>
          <button
            onClick={handleReset}
            className="px-3 py-1.5 bg-white/95 backdrop-blur-md hover:bg-white rounded-xl text-xs font-semibold text-gray-700 shadow-md border border-gray-200 hover:text-brand-600 transition"
          >
            Reset View
          </button>
        </div>
      </div>

      {/* Floating Zoom & Map Controls (Google Maps Style) */}
      <div className="absolute bottom-5 right-4 z-[1000] flex flex-col gap-1.5 shadow-lg rounded-xl overflow-hidden border border-gray-200 bg-white">
        <button
          onClick={handleLocateMe}
          title="Access My Current GPS Location"
          className={`p-2.5 hover:bg-gray-50 active:bg-gray-100 transition border-b border-gray-100 ${
            locatingUser ? 'text-blue-600 animate-spin' : userLocation ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
          }`}
        >
          <Crosshair size={18} />
        </button>
        <button
          onClick={handleTogglePinDrop}
          title={pinDropMode ? 'Click on map to drop pin' : 'Drop a Pin on Map'}
          className={`p-2.5 hover:bg-gray-50 active:bg-gray-100 transition border-b border-gray-100 ${
            pinDropMode ? 'text-red-600 bg-red-50 animate-bounce' : droppedPin ? 'text-red-600' : 'text-gray-700'
          }`}
        >
          <Pin size={18} />
        </button>
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-2.5 hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition border-b border-gray-100"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-2.5 hover:bg-gray-50 active:bg-gray-100 text-gray-700 transition"
        >
          <ZoomOut size={18} />
        </button>
      </div>

      {/* Main Map Container */}
      <div ref={mapContainerRef} style={{ height }} className="w-full z-0" />

      {/* Interactive Selected Mandi Details Card (Google Maps Popup Style) */}
      {selectedMandi && (
        <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:w-96 z-[1000] bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-brand-200 animate-fade-in-up">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full mb-1">
                <MapPin size={12} /> {selectedMandi.state} · APMC
              </div>
              <h3 className="font-extrabold text-gray-900 text-base">{selectedMandi.name}</h3>
              <p className="text-xs text-gray-500">{selectedMandi.type}</p>
            </div>
            <button
              onClick={() => setSelectedMandi(null)}
              className="text-gray-400 hover:text-gray-600 text-sm font-bold p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
            <div>
              <div className="text-gray-500 text-[10px] uppercase font-bold">Modal Price</div>
              <div className="text-base font-extrabold text-brand-700">₹{selectedMandi.modal_price} <span className="text-[10px] text-gray-500 font-normal">/ Qtl</span></div>
              <div className="text-[11px] font-semibold text-emerald-600">₹{(selectedMandi.modal_price / 100).toFixed(1)} / kg</div>
            </div>
            <div>
              <div className="text-gray-500 text-[10px] uppercase font-bold">Daily Arrivals</div>
              <div className="text-base font-extrabold text-gray-800">{selectedMandi.arrivals} <span className="text-[10px] text-gray-500 font-normal">Tonnes</span></div>
              <div className="text-[11px] text-gray-500">Range: ₹{selectedMandi.min_price} - {selectedMandi.max_price}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedMandi.lat},${selectedMandi.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1 transition"
            >
              <span>Google Maps</span>
              <ArrowUpRight size={14} />
            </a>
            <button
              onClick={() => onSelectMandi && onSelectMandi(selectedMandi)}
              className="flex-1 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-1 transition shadow-sm"
            >
              <span>Use in Calculator</span>
              <Navigation size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
