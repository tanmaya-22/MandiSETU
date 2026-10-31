import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const cleanBackendUrl = (input) => {
  if (!input || !input.trim()) return ''
  let cleaned = input.trim()
  // Strip accidental quotes, brackets, parentheses or trailing punctuation from copy-pasting
  cleaned = cleaned.replace(/^[<"'\(\[\s]+|[>"'\)\];\s,]+$/g, '').trim()
  // Strip trailing slashes
  cleaned = cleaned.replace(/\/+$/, '')
  // If user pasted with /health, strip it
  if (cleaned.endsWith('/health')) {
    cleaned = cleaned.substring(0, cleaned.length - 7)
  }
  // If user pasted with /docs, strip it
  if (cleaned.endsWith('/docs')) {
    cleaned = cleaned.substring(0, cleaned.length - 5)
  }
  cleaned = cleaned.replace(/\/+$/, '')
  // Ensure valid HTTP protocol
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    cleaned = `https://${cleaned}`
  }
  // Ensure it points to the API route prefix
  if (!cleaned.endsWith('/api/v1')) {
    cleaned = `${cleaned}/api/v1`
  }
  return cleaned
}

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('mandisetu_api_base_url')
    if (customUrl && customUrl.trim()) {
      // Auto-migrate away from old non-working URL without -rn2n
      if (customUrl.includes('mandisetu-api.onrender.com') && !customUrl.includes('-rn2n')) {
        localStorage.removeItem('mandisetu_api_base_url')
      } else {
        return cleanBackendUrl(customUrl)
      }
    }
  }
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && envUrl.trim()) {
    return cleanBackendUrl(envUrl)
  }
  // Default to standard Render backend URL if running on Vercel or any cloud domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://mandisetu-api-rn2n.onrender.com/api/v1'
  }
  return '/api/v1'
}

export const setApiBaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('mandisetu_api_base_url')
    } else {
      const cleaned = cleanBackendUrl(url)
      localStorage.setItem('mandisetu_api_base_url', cleaned)
    }
  }
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 60000, // 60s timeout to gracefully accommodate Render Free Tier cold starts
})

// Attach JWT token and ensure baseURL is fresh on every request
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401 only if user was actually logged in and not already on /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (
      err.response?.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login' &&
      useAuthStore.getState().isAuthenticated
    ) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
