import { useState, useRef, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  Home, TrendingUp, Calculator, Award, Tractor, ShieldCheck,
  FileText, Clock, AlertTriangle, MapPin, CloudRain, Truck,
  BarChart2, MessageSquare, User, Shield, LogOut, ChevronDown,
  Sparkles, Menu, MoreHorizontal, Leaf, HelpCircle, X
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'
import { useLangStore } from '../../store/langStore'
import HeaderControls from './HeaderControls'
import Footer from './Footer'

// Ordered Modules in ascending order with clean labels
const ASCENDING_MODULES = [
  { to: '/dashboard', icon: Home, label: '01. Dashboard' },
  { to: '/prices', icon: TrendingUp, label: '02. Market Prices' },
  { to: '/calculator', icon: Calculator, label: '03. Net Calculator' },
  { to: '/grading', icon: Award, label: '04. Produce Grading' },
  { to: '/listings', icon: Tractor, label: '05. Produce Lots' },
  { to: '/matching', icon: ShieldCheck, label: '06. Buyer Matching' },
  { to: '/transactions', icon: FileText, label: '07. Smart Contracts' },
  { to: '/sale-window', icon: Clock, label: '08. Sale Window' },
  { to: '/disputes', icon: AlertTriangle, label: '09. Dispute Arbitration' },
  { to: '/mandi-map', icon: MapPin, label: '10. Mandi Maps' },
  { to: '/weather', icon: CloudRain, label: '11. Weather Intelligence' },
  { to: '/logistics', icon: Truck, label: '12. Logistics Network' },
  { to: '/analytics', icon: BarChart2, label: '13. Agri Analytics' },
  { to: '/feedback', icon: MessageSquare, label: '14. Feedback & Support' },
  { to: '/profile', icon: User, label: '15. Profile & Settings' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { isDark } = useThemeStore()
  const { language } = useLangStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Sidebar starts open by default on desktop with comfortable generous width
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileMenuRef = useRef(null)

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  // Trigger Chacha's interactive tour
  const handleStartTour = () => {
    window.dispatchEvent(
      new CustomEvent('mandisetu_open_guide', { detail: { pageMode: true } })
    )
  }

  const isOwner =
    user?.isOwner ||
    user?.email?.toLowerCase() === 'tanmayapradhan2322@gmail.com' ||
    user?.username === 'TanmayA' ||
    user?.name === 'TanmayA'

  return (
    <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 ${isDark ? 'dark' : ''}`}>
      {/* ── Top Header Navigation Bar ── */}
      <header className="sticky top-0 z-40 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-sm">
        <div className="flex items-center gap-3">
          {/* Aesthetic Menu Button when sidebar is collapsed */}
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="px-3.5 py-1.5 rounded-2xl bg-brand-50 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800 text-brand-800 dark:text-brand-300 font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-all hover:scale-105"
              title="Open Navigation Menu"
            >
              <Menu size={16} />
              <span>Menu</span>
            </button>
          )}

          {/* Brand Logo & Name (No weird bars or equal sign beside leaf!) */}
          <NavLink to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Leaf size={22} className="text-white" />
            </div>
            <div className="block">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                MandiSetu
              </span>
              <span className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider -mt-1">
                Fair Agricultural Markets
              </span>
            </div>
          </NavLink>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-3">
          {/* Interactive Demo Tour trigger button */}
          <button
            onClick={handleStartTour}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all hover:scale-105 shadow-sm"
            title="Interactive Walkthrough with Kisan Chacha"
          >
            <Sparkles size={14} className="text-amber-500" />
            <span>Interactive Demo</span>
          </button>

          {/* Language & Numeral Switcher & Theme Toggle */}
          <HeaderControls />

          {/* ── Top-Right User Profile with Full Navigation Powers ── */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-500 flex items-center justify-center text-white font-extrabold text-sm shadow-md group-hover:scale-105 transition-transform">
                {user?.full_name?.[0] || user?.name?.[0] || 'U'}
              </div>
              <div className="hidden lg:block text-left text-xs pr-1">
                <div className="font-bold text-gray-900 dark:text-white truncate max-w-[120px]">
                  {user?.full_name || user?.name || 'Farmer'}
                </div>
                <div className="text-[10px] text-gray-500 dark:text-gray-400 capitalize -mt-0.5 font-medium">
                  {isOwner ? '👑 Platform Admin' : user?.role || 'Farmer'}
                </div>
              </div>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Profile Dropdown Menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl z-50 p-3 space-y-2 animate-fade-in">
                {/* User Info Header */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-50 to-emerald-50 dark:from-gray-800 dark:to-gray-800/60 border border-brand-100 dark:border-gray-700">
                  <div className="font-extrabold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>{user?.full_name || user?.name || 'Logged User'}</span>
                    {isOwner && <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 font-bold">ADMIN</span>}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 font-mono truncate mt-0.5">
                    {user?.email || 'farmer@mandisetu.in'}
                  </div>
                  <div className="text-[11px] text-brand-700 dark:text-brand-400 font-semibold mt-1">
                    Role: <span className="capitalize">{user?.role || 'farmer'}</span> · {user?.state || 'India'}
                  </div>
                </div>

                {/* Direct Navigation Links */}
                <div className="space-y-1 text-xs font-semibold text-gray-700 dark:text-gray-300">
                  <button
                    onClick={() => { navigate('/profile'); setProfileDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                  >
                    <User size={15} className="text-brand-600" />
                    <span>View & Edit My Profile</span>
                  </button>

                  <button
                    onClick={() => { navigate('/dashboard'); setProfileDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                  >
                    <Home size={15} className="text-blue-600" />
                    <span>Farmer Dashboard</span>
                  </button>

                  <button
                    onClick={() => { navigate('/prices'); setProfileDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                  >
                    <TrendingUp size={15} className="text-emerald-600" />
                    <span>Market Prices</span>
                  </button>

                  <button
                    onClick={() => { navigate('/mandi-map'); setProfileDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                  >
                    <MapPin size={15} className="text-indigo-600" />
                    <span>Mandi Maps</span>
                  </button>

                  <button
                    onClick={() => { navigate('/feedback'); setProfileDropdownOpen(false) }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center gap-2.5 transition-colors"
                  >
                    <MessageSquare size={15} className="text-amber-600" />
                    <span>Platform Feedback</span>
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => { navigate('/admin'); setProfileDropdownOpen(false) }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 font-bold flex items-center gap-2.5 transition-colors"
                    >
                      <Shield size={15} className="text-purple-600" />
                      <span>Admin Oversight Panel</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Layout Body (Sidebar + Content + Footer) ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar Navigation with generous width and vibrant readable colors ── */}
        <aside
          className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 flex-shrink-0 z-30 shadow-sm ${
            sidebarOpen ? 'w-64' : 'w-0 -translate-x-full md:w-0 overflow-hidden'
          }`}
        >
          {/* Sidebar Top: Header with 3 Dots to minimize */}
          {sidebarOpen && (
            <div className="h-14 px-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-900/50">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Navigation Modules
              </span>

              {/* 3 Dots Button to minimize menu */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                title="Minimize menu (3 dots)"
              >
                <MoreHorizontal size={20} />
              </button>
            </div>
          )}

          {/* Module Links (Ascending Order, Comfortable Font, Rich Contrast) */}
          {sidebarOpen && (
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
              {ASCENDING_MODULES.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.to

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.02] ${
                      isActive
                        ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/20'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                )
              })}

              {/* Admin Panel Link */}
              {user?.role === 'admin' && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-bold transition-all mt-3 hover:scale-[1.02] ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md'
                        : 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                    }`
                  }
                >
                  <Shield size={18} />
                  <span>16. Admin Command</span>
                </NavLink>
              )}
            </nav>
          )}

          {/* Sidebar Bottom: User snapshot */}
          {sidebarOpen && (
            <div className="p-3.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <div className="flex items-center gap-3 text-xs">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm shadow">
                  {user?.full_name?.[0] || 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-gray-900 dark:text-white text-sm truncate">
                    {user?.full_name || 'Farmer'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.district || 'India'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* ── Main Scrollable Page Area ── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>

          {/* ── Footer on Every Page with Prototype Credits ── */}
          <Footer />
        </div>
      </div>
    </div>
  )
}
