/**
 * MandiSetu Geolocation & Reverse Geocoding Utility
 * Formats coordinates into real place / area names just like Google Maps.
 */

// Heuristic fallback dictionary for major Indian agricultural districts & belts
const AGRI_HUBS = [
  { name: 'Lasalgaon, Nashik', state: 'Maharashtra', lat: 20.14, lng: 74.22, radius: 1.5 },
  { name: 'Pimpalgaon, Nashik', state: 'Maharashtra', lat: 20.17, lng: 73.98, radius: 1.5 },
  { name: 'Nashik Central Mandi', state: 'Maharashtra', lat: 19.99, lng: 73.78, radius: 1.5 },
  { name: 'Indore APMC Yard, Malwa', state: 'Madhya Pradesh', lat: 22.72, lng: 75.86, radius: 1.5 },
  { name: 'Sehore Krishi Mandi', state: 'Madhya Pradesh', lat: 23.20, lng: 77.08, radius: 1.5 },
  { name: 'Ujjain Grain Market', state: 'Madhya Pradesh', lat: 23.18, lng: 75.78, radius: 1.5 },
  { name: 'Kolar APMC Tomato Belt', state: 'Karnataka', lat: 13.14, lng: 78.13, radius: 1.5 },
  { name: 'Karnal Grain Hub', state: 'Haryana', lat: 29.69, lng: 76.99, radius: 1.5 },
  { name: 'Amritsar Mandi Area', state: 'Punjab', lat: 31.63, lng: 74.87, radius: 1.5 },
  { name: 'Azadpur Terminal, Delhi', state: 'Delhi', lat: 28.71, lng: 77.17, radius: 1.5 },
  { name: 'Guntur Chilli Yard', state: 'Andhra Pradesh', lat: 16.31, lng: 80.44, radius: 1.5 },
  { name: 'Rajkot Market Yard', state: 'Gujarat', lat: 22.30, lng: 70.80, radius: 1.5 },
  { name: 'Cuttack Rice Delta APMC', state: 'Odisha', lat: 20.46, lng: 85.88, radius: 1.5 },
  { name: 'Bhubaneswar Agro Yard', state: 'Odisha', lat: 20.29, lng: 85.82, radius: 1.5 },
]

export async function reverseGeocode(lat, lng) {
  if (!lat || !lng) return ''

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
      headers: { 'Accept-Language': 'en' },
    })
    if (res.ok) {
      const data = await res.json()
      const addr = data.address || {}

      // Pick the most specific place name like Google Maps
      const sub = addr.suburb || addr.neighbourhood || addr.village || addr.town || addr.hamlet || ''
      const district = addr.county || addr.state_district || addr.city || ''
      const state = addr.state || ''

      const parts = [sub, district, state].filter(Boolean)
      if (parts.length > 0) {
        return parts.slice(0, 2).join(', ')
      }
      if (data.display_name) {
        const short = data.display_name.split(',').slice(0, 3).map(s => s.trim()).join(', ')
        return short
      }
    }
  } catch {}

  // Fallback heuristic based on nearest agricultural hub
  let closest = null
  let minDiff = Infinity
  for (const hub of AGRI_HUBS) {
    const diff = Math.hypot(hub.lat - lat, hub.lng - lng)
    if (diff < minDiff) {
      minDiff = diff
      closest = hub
    }
  }

  if (closest && minDiff < 3.0) {
    return `${closest.name}, ${closest.state}`
  }

  return `Area around ${lat.toFixed(2)}°N, ${lng.toFixed(2)}°E`
}
