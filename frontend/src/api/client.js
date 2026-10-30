import axios from 'axios'
import { useAuthStore } from '../store/authStore'

export const getApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('mandisetu_api_base_url')
    if (customUrl && customUrl.trim()) {
      return customUrl.trim().replace(/\/+$/, '')
    }
  }
  const envUrl = import.meta.env.VITE_API_URL
  if (envUrl && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '')
  }
  // Default to standard Render backend URL if running on Vercel or any cloud domain
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://mandisetu-api.onrender.com/api/v1'
  }
  return '/api/v1'
}

export const setApiBaseUrl = (url) => {
  if (typeof window !== 'undefined') {
    if (!url || !url.trim()) {
      localStorage.removeItem('mandisetu_api_base_url')
    } else {
      let cleaned = url.trim().replace(/\/+$/, '')
      if (!cleaned.endsWith('/api/v1')) {
        cleaned = `${cleaned}/api/v1`
      }
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
