import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'

// Auth
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

// Dashboards
import FarmerDashboard from './pages/dashboard/FarmerDashboard'
import BuyerDashboard from './pages/dashboard/BuyerDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

// Module pages
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

import Layout from './components/common/Layout'
import LandingPage from './pages/LandingPage'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />
  return children
}

function DashboardRedirect() {
  const { role } = useAuthStore()
  if (role === 'admin') return <Navigate to="/admin" replace />
  if (role === 'buyer') return <Navigate to="/buyer-dashboard" replace />
  return <Navigate to="/farmer-dashboard" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected app routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="dashboard" element={<DashboardRedirect />} />

          {/* Farmer routes */}
          <Route path="farmer-dashboard" element={<ProtectedRoute allowedRoles={['farmer','fpo']}><FarmerDashboard /></ProtectedRoute>} />
          <Route path="listings" element={<ListingsPage />} />
          <Route path="listings/new" element={<ProtectedRoute allowedRoles={['farmer','fpo','admin']}><CreateLotPage /></ProtectedRoute>} />
          <Route path="listings/:id" element={<LotDetailPage />} />
          <Route path="grading" element={<ProtectedRoute allowedRoles={['farmer','fpo','admin']}><GradingPage /></ProtectedRoute>} />
          <Route path="sale-window" element={<ProtectedRoute allowedRoles={['farmer','fpo','admin']}><SaleWindowPage /></ProtectedRoute>} />

          {/* Buyer routes */}
          <Route path="buyer-dashboard" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
          <Route path="matching" element={<ProtectedRoute allowedRoles={['buyer','admin']}><MatchingPage /></ProtectedRoute>} />
          <Route path="buyers" element={<BuyersPage />} />

          {/* Shared routes */}
          <Route path="prices" element={<PricesPage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="transactions" element={<TransactionsPage />} />
          <Route path="transactions/:id" element={<TransactionDetailPage />} />
          <Route path="logistics" element={<LogisticsPage />} />
          <Route path="disputes" element={<DisputesPage />} />
          <Route path="weather" element={<WeatherPage />} />

          {/* Admin */}
          <Route path="admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="analytics" element={<ProtectedRoute allowedRoles={['admin']}><AnalyticsPage /></ProtectedRoute>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
