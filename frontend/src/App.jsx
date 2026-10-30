import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { useThemeStore } from './store/themeStore'

import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

import FarmerDashboard from './pages/dashboard/FarmerDashboard'
import BuyerDashboard from './pages/dashboard/BuyerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

import PricesPage from './pages/prices/PricesPage'
import CalculatorPage from './pages/calculator/CalculatorPage'
import ListingsPage from './pages/listings/ListingsPage'
import CreateLotPage from './pages/listings/CreateLotPage'
import LotDetailPage from './pages/listings/LotDetailPage'
import MatchingPage from './pages/matching/MatchingPage'
import TransactionsPage from './pages/transactions/TransactionsPage'
import TransactionDetailPage from './pages/transactions/TransactionDetailPage'
import SaleWindowPage from './pages/salewindow/SaleWindowPage'
import BuyersPage from './pages/buyers/BuyersPage'
import LogisticsPage from './pages/logistics/LogisticsPage'
import DisputesPage from './pages/disputes/DisputesPage'
import GradingPage from './pages/grading/GradingPage'
import WeatherPage from './pages/weather/WeatherPage'
import AnalyticsPage from './pages/analytics/AnalyticsPage'
import MandiMapPage from './pages/maps/MandiMapPage'
import FeedbackPage from './pages/feedback/FeedbackPage'
import ProfilePage from './pages/profile/ProfilePage'

import Layout from './components/common/Layout'
import LandingPage from './pages/LandingPage'
import FarmerGuide from './components/common/FarmerGuide'
import AIAssistant from './components/common/AIAssistant'

// Smart role-based dashboard router
function DashboardRedirect() {
  const { role, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  if (role === 'buyer') return <Navigate to="/buyer-dashboard" replace />
  if (role === 'admin') return <Navigate to="/admin" replace />
  return <Navigate to="/farmer-dashboard" replace />
}

export default function App() {
  const initTheme = useThemeStore((s) => s.initTheme)
  const [guideOpen, setGuideOpen] = useState(false)
  const [guidePageMode, setGuidePageMode] = useState(false)

  useEffect(() => {
    initTheme()

    // Listen for custom guide trigger events from any page
    const handleTriggerGuide = (e) => {
      setGuidePageMode(!!e.detail?.pageMode)
      setGuideOpen(true)
    }
    window.addEventListener('mandisetu_open_guide', handleTriggerGuide)
    return () => window.removeEventListener('mandisetu_open_guide', handleTriggerGuide)
  }, [initTheme])

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 500,
          },
        }}
      />

      {/* Global Interactive Animated Indian Farmer Guide */}
      <FarmerGuide
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        pageMode={guidePageMode}
      />

      {/* Global Floating AI Assistant */}
      <AIAssistant />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Authenticated Layout with all 12 modules */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
          <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/listings" element={<ListingsPage />} />
          <Route path="/listings/new" element={<CreateLotPage />} />
          <Route path="/listings/:id" element={<LotDetailPage />} />

          <Route path="/grading" element={<GradingPage />} />
          <Route path="/sale-window" element={<SaleWindowPage />} />

          <Route path="/matching" element={<MatchingPage />} />
          <Route path="/buyers" element={<BuyersPage />} />

          <Route path="/prices" element={<PricesPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />

          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/transactions/:id" element={<TransactionDetailPage />} />

          <Route path="/logistics" element={<LogisticsPage />} />
          <Route path="/disputes" element={<DisputesPage />} />
          <Route path="/weather" element={<WeatherPage />} />
          <Route path="/mandi-map" element={<MandiMapPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
