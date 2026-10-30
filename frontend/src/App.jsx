import { Component, useEffect, useState } from 'react'
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

// ─── Per-page isolated error boundary so one page never kills the whole app ──
class PageErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error) {
    console.error('[MandiSetu Page Error]', error)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center">
          <span className="text-4xl mb-3">🌾</span>
          <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Page Temporarily Unavailable</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm">
            This page encountered a temporary issue (often a network timeout). Your other pages are working fine.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition"
          >
            Retry this page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Wrap any page component with page-level error boundary
function SafePage({ children }) {
  return <PageErrorBoundary>{children}</PageErrorBoundary>
}

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
      <PageErrorBoundary>
        <FarmerGuide
          isOpen={guideOpen}
          onClose={() => setGuideOpen(false)}
          pageMode={guidePageMode}
        />
      </PageErrorBoundary>

      {/* Global Floating AI Assistant */}
      <PageErrorBoundary>
        <AIAssistant />
      </PageErrorBoundary>

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SafePage><LandingPage /></SafePage>} />
        <Route path="/login" element={<SafePage><LoginPage /></SafePage>} />
        <Route path="/register" element={<SafePage><RegisterPage /></SafePage>} />

        {/* Authenticated Layout with all 12 modules */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<DashboardRedirect />} />

          <Route path="/farmer-dashboard" element={<SafePage><FarmerDashboard /></SafePage>} />
          <Route path="/buyer-dashboard" element={<SafePage><BuyerDashboard /></SafePage>} />
          <Route path="/admin" element={<SafePage><AdminDashboard /></SafePage>} />

          <Route path="/listings" element={<SafePage><ListingsPage /></SafePage>} />
          <Route path="/listings/new" element={<SafePage><CreateLotPage /></SafePage>} />
          <Route path="/listings/:id" element={<SafePage><LotDetailPage /></SafePage>} />

          <Route path="/grading" element={<SafePage><GradingPage /></SafePage>} />
          <Route path="/sale-window" element={<SafePage><SaleWindowPage /></SafePage>} />

          <Route path="/matching" element={<SafePage><MatchingPage /></SafePage>} />
          <Route path="/buyers" element={<SafePage><BuyersPage /></SafePage>} />

          <Route path="/prices" element={<SafePage><PricesPage /></SafePage>} />
          <Route path="/calculator" element={<SafePage><CalculatorPage /></SafePage>} />

          <Route path="/transactions" element={<SafePage><TransactionsPage /></SafePage>} />
          <Route path="/transactions/:id" element={<SafePage><TransactionDetailPage /></SafePage>} />

          <Route path="/logistics" element={<SafePage><LogisticsPage /></SafePage>} />
          <Route path="/disputes" element={<SafePage><DisputesPage /></SafePage>} />
          <Route path="/weather" element={<SafePage><WeatherPage /></SafePage>} />
          <Route path="/mandi-map" element={<SafePage><MandiMapPage /></SafePage>} />
          <Route path="/analytics" element={<SafePage><AnalyticsPage /></SafePage>} />
          <Route path="/feedback" element={<SafePage><FeedbackPage /></SafePage>} />
          <Route path="/profile" element={<SafePage><ProfilePage /></SafePage>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
