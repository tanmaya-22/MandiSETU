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
import ProtectedRoute from './components/common/ProtectedRoute'

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
      <FarmerGuide
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        pageMode={guidePageMode}
      />

      {/* Global Floating AI Assistant */}
      <AIAssistant />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SafePage><LandingPage /></SafePage>} />
        <Route path="/login" element={<SafePage><LoginPage /></SafePage>} />
        <Route path="/register" element={<SafePage><RegisterPage /></SafePage>} />

        {/* Authenticated Layout with public exploration tools & protected modules */}
        <Route element={<Layout />}>
          {/* Publicly Accessible Tools (No login required) */}
          <Route path="/calculator" element={<SafePage><CalculatorPage /></SafePage>} />
          <Route path="/prices" element={<SafePage><PricesPage /></SafePage>} />
          <Route path="/weather" element={<SafePage><WeatherPage /></SafePage>} />
          <Route path="/mandi-map" element={<SafePage><MandiMapPage /></SafePage>} />

          {/* Protected Modules (Require Login or Signup) */}
          <Route path="/dashboard" element={<ProtectedRoute moduleName="Dashboard"><DashboardRedirect /></ProtectedRoute>} />
          <Route path="/farmer-dashboard" element={<ProtectedRoute moduleName="Farmer Dashboard"><SafePage><FarmerDashboard /></SafePage></ProtectedRoute>} />
          <Route path="/buyer-dashboard" element={<ProtectedRoute moduleName="Buyer Dashboard"><SafePage><BuyerDashboard /></SafePage></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute moduleName="Admin Oversight Panel"><SafePage><AdminDashboard /></SafePage></ProtectedRoute>} />

          <Route path="/listings" element={<ProtectedRoute moduleName="Produce Lots & Bids"><SafePage><ListingsPage /></SafePage></ProtectedRoute>} />
          <Route path="/listings/new" element={<ProtectedRoute moduleName="New Lot Creation"><SafePage><CreateLotPage /></SafePage></ProtectedRoute>} />
          <Route path="/listings/:id" element={<ProtectedRoute moduleName="Lot Trade Details"><SafePage><LotDetailPage /></SafePage></ProtectedRoute>} />

          <Route path="/grading" element={<ProtectedRoute moduleName="AGMARK AI Produce Grading"><SafePage><GradingPage /></SafePage></ProtectedRoute>} />
          <Route path="/sale-window" element={<ProtectedRoute moduleName="Optimal Sale Window Engine"><SafePage><SaleWindowPage /></SafePage></ProtectedRoute>} />

          <Route path="/matching" element={<ProtectedRoute moduleName="Algorithmic Buyer Matching"><SafePage><MatchingPage /></SafePage></ProtectedRoute>} />
          <Route path="/buyers" element={<ProtectedRoute moduleName="Verified Buyer Directory"><SafePage><BuyersPage /></SafePage></ProtectedRoute>} />

          <Route path="/transactions" element={<ProtectedRoute moduleName="Smart Contracts & Escrow"><SafePage><TransactionsPage /></SafePage></ProtectedRoute>} />
          <Route path="/transactions/:id" element={<ProtectedRoute moduleName="Escrow Contract Details"><SafePage><TransactionDetailPage /></SafePage></ProtectedRoute>} />

          <Route path="/logistics" element={<ProtectedRoute moduleName="Logistics & Fleet Booking"><SafePage><LogisticsPage /></SafePage></ProtectedRoute>} />
          <Route path="/disputes" element={<ProtectedRoute moduleName="Dispute Arbitration System"><SafePage><DisputesPage /></SafePage></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute moduleName="Agri Analytics Intelligence"><SafePage><AnalyticsPage /></SafePage></ProtectedRoute>} />
          <Route path="/feedback" element={<ProtectedRoute moduleName="Feedback & Support Hotline"><SafePage><FeedbackPage /></SafePage></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute moduleName="User Profile & Settings"><SafePage><ProfilePage /></SafePage></ProtectedRoute>} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
