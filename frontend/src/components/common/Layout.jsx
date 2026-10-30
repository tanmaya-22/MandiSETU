import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import HeaderControls from './HeaderControls'
import {
  LayoutDashboard, TrendingUp, Calculator, Package, Users,
  CreditCard, Lightbulb, ShieldCheck, Truck, AlertTriangle,
  Camera, CloudRain, BarChart3, LogOut, Menu, X, Leaf,
  MoreHorizontal, Equal, ChevronDown, User, Mail, Phone, MapPin,
  ExternalLink, Settings, Sparkles
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function Layout() {
  const { role, user, logout } = useAuthStore()
  const { t } = useLangStore()
  const navigate = useNavigate()

  // Sidebar collapse states:
  // - sidebarOpen: for mobile drawer
  // - isCollapsed: for desktop width minimization (w-64 <-> w-20)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const profileRef = useRef(null)

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navItems = (userRole) => {
    const dashboardLink =
      userRole === 'buyer'
        ? { to: '/buyer-dashboard', icon: LayoutDashboard, label: t('nav_dashboard'), module: '1' }
        : userRole === 'admin'
        ? { to: '/admin', icon: LayoutDashboard, label: t('nav_dashboard'), module: '1' }
        : { to: '/farmer-dashboard', icon: LayoutDashboard, label: t('nav_dashboard'), module: '1' }

    const base = [
      dashboardLink,
      { to: '/prices',       icon: TrendingUp,   label: t('nav_prices'),       module: '2' },
      { to: '/calculator',   icon: Calculator,   label: t('nav_calculator'),   module: '3' },
      { to: '/listings',     icon: Package,      label: t('nav_listings'),     module: '4' },
      { to: '/transactions', icon: CreditCard,   label: t('nav_transactions'), module: '6' },
      { to: '/buyers',       icon: Users,        label: t('nav_buyers'),       module: '8' },
      { to: '/logistics',    icon: Truck,        label: t('nav_logistics'),    module: '8b' },
      { to: '/disputes',     icon: AlertTriangle,label: t('nav_disputes'),     module: '9' },
      { to: '/weather',      icon: CloudRain,    label: t('nav_weather'),      module: '11' },
    ]
    const farmer = [
      { to: '/grading',      icon: Camera,       label: t('nav_grading'),      module: '10' },
      { to: '/sale-window',  icon: Lightbulb,    label: t('nav_salewindow'),   module: '7' },
    ]
    const buyer = [
      { to: '/matching',     icon: ShieldCheck,  label: t('nav_matching'),     module: '5' },
    ]
    const admin = [
      { to: '/analytics',    icon: BarChart3,    label: t('nav_analytics'),    module: '12' },
    ]

    if (userRole === 'admin') return [...base, ...farmer, ...buyer, ...admin]
    if (userRole === 'buyer') return [...base, ...buyer]
    return [...base, ...farmer]
  }

  const items = navItems(role)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleOpenPageTour = () => {
    window.dispatchEvent(new CustomEvent('mandisetu_open_guide', { detail: { pageMode: true } }))
  }

  const handleOpenFullTour = () => {
    window.dispatchEvent(new CustomEvent('mandisetu_open_guide', { detail: { pageMode: false } }))
  }

  const roleStyles = {
    farmer: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    buyer: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    admin: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    fpo: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  }

  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'MS'

  return (
    <div className="min-h-screen flex bg-gray-50/70 dark:bg-gray-950 font-sans antialiased text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* ─── Collapsible Sidebar ──────────────────────────────────────────────── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-brand-950 via-brand-900 to-gray-950 text-white transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col shadow-2xl border-r border-brand-800/40
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        {/* Brand Header with Minimize / Expand Toggle */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-brand-800/50">
          {!isCollapsed ? (
            <Link to="/" className="flex items-center gap-2.5 group overflow-hidden">
              <div className="w-9 h-9 bg-gradient-to-tr from-brand-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition flex-shrink-0">
                <Leaf size={18} className="text-white" />
              </div>
              <div className="truncate">
                <p className="font-extrabold text-lg leading-tight tracking-tight text-white">{t('brand_name')}</p>
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Agri-Market Suite</p>
              </div>
            </Link>
          ) : (
            <Link to="/" className="mx-auto" title={t('brand_name')}>
              <div className="w-10 h-10 bg-gradient-to-tr from-brand-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition">
                <Leaf size={20} className="text-white" />
              </div>
            </Link>
          )}

          {/* Desktop Minimize Button (Three dots when open, Two horizontal lines '=' when collapsed) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar (2 Lines)' : 'Minimize Sidebar (3 Dots)'}
            className="hidden lg:flex items-center justify-center p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 hover:text-white transition"
          >
            {isCollapsed ? (
              /* Two horizontal lines '=' to expand */
              <div className="flex flex-col gap-1 items-center justify-center w-5 h-5">
                <span className="w-4 h-0.5 bg-emerald-400 rounded-full"></span>
                <span className="w-4 h-0.5 bg-emerald-400 rounded-full"></span>
              </div>
            ) : (
              /* Three dots '...' to minimize */
              <MoreHorizontal size={18} />
            )}
          </button>

          {/* Mobile close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card inside Sidebar (Hidden or compact in collapsed mode) */}
        {!isCollapsed ? (
          <div className="px-5 py-4 border-b border-brand-800/40 bg-white/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-white truncate">{user?.full_name || 'Agri User'}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      roleStyles[role] || roleStyles.farmer
                    }`}
                  >
                    {role || 'Farmer'}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center border-b border-brand-800/40">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-xs shadow-md cursor-pointer"
              title={user?.full_name}
              onClick={() => setProfileDropdownOpen(true)}
            >
              {initials}
            </div>
          </div>
        )}

        {/* Navigation items list */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1 scrollbar-none">
          {items.map(({ to, icon: Icon, label, module: mod }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              title={isCollapsed ? `${label} (M${mod})` : ''}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5'
                } ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-md font-bold'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={18} className="transition-transform group-hover:scale-110 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="flex-1 truncate">{label}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-emerald-300/80">
                    M{mod}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sign Out Button */}
        <div className="p-3 border-t border-brand-800/50 bg-black/20">
          <button
            onClick={handleLogout}
            title={isCollapsed ? t('nav_sign_out') : ''}
            className={`flex items-center rounded-xl text-xs font-semibold text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition ${
              isCollapsed ? 'justify-center p-2.5 w-full' : 'gap-2.5 w-full px-3 py-2'
            }`}
          >
            <LogOut size={16} />
            {!isCollapsed && <span>{t('nav_sign_out')}</span>}
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── Main Content Area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile menu drawer button */}
            <button
              className="lg:hidden p-1.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Desktop Quick Sidebar Expand / Collapse button (Two horizontal lines) */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              title={isCollapsed ? 'Expand Sidebar (2 Lines)' : 'Minimize Sidebar (3 Dots)'}
              className="hidden lg:flex items-center gap-2 px-2.5 py-1.5 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition text-xs font-bold border border-gray-200 dark:border-gray-700"
            >
              {isCollapsed ? (
                /* Two horizontal lines '=' to expand */
                <div className="flex flex-col gap-1 items-center justify-center w-4 h-4">
                  <span className="w-3.5 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>
                  <span className="w-3.5 h-0.5 bg-emerald-600 dark:bg-emerald-400 rounded-full"></span>
                </div>
              ) : (
                <MoreHorizontal size={16} className="text-gray-500" />
              )}
              <span>{isCollapsed ? 'Expand Menu' : 'Minimize'}</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{t('live_feed_active')}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Multilingual Switcher + Dark Mode Toggle + (i) Page Tour Button */}
            <HeaderControls
              onOpenPageTour={handleOpenPageTour}
              onOpenFullTour={handleOpenFullTour}
            />

            {/* ─── Top Right Interactive User Profile & Quick Navigation ────────── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800 p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition group cursor-pointer"
                title="View Profile & Navigation"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight group-hover:text-brand-600 dark:group-hover:text-emerald-400 transition">
                    {user?.full_name || 'Agri User'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{role || 'Farmer'}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shadow-md group-hover:scale-105 transition">
                  {initials}
                </div>
                <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200" />
              </button>

              {/* Profile Navigation Dropdown Panel */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 py-3 z-50 animate-scale-in text-gray-900 dark:text-gray-100">
                  {/* Profile Header Details */}
                  <div className="px-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white truncate">
                          {user?.full_name || 'Agri Member'}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-1 mt-0.5">
                          <Mail size={12} />
                          <span>{user?.email || 'user@mandisetu.com'}</span>
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${roleStyles[role] || roleStyles.farmer}`}>
                            {role || 'Farmer'}
                          </span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <span>ID:</span>
                            <span className="font-mono">{user?.user_id || user?.id || 'usr_' + (user?.email?.split('@')[0] || '101')}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact & Location details */}
                    <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 text-[11px] text-gray-500 dark:text-gray-400 space-y-1">
                      {user?.phone && (
                        <div className="flex items-center gap-1.5">
                          <Phone size={12} className="text-gray-400" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      {(user?.district || user?.state) && (
                        <div className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-400" />
                          <span>{user.district ? `${user.district}, ` : ''}{user.state || 'India'}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Navigation Power Hub */}
                  <div className="p-2 space-y-0.5 text-xs font-semibold">
                    <div className="px-3 py-1 text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                      Quick Platform Navigation
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-emerald-400 transition"
                    >
                      <LayoutDashboard size={16} className="text-emerald-600 dark:text-emerald-400" />
                      <span>{t('nav_dashboard')}</span>
                    </Link>

                    <Link
                      to="/listings"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-emerald-400 transition"
                    >
                      <Package size={16} className="text-teal-600" />
                      <span>{t('nav_listings')}</span>
                    </Link>

                    <Link
                      to="/prices"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-emerald-400 transition"
                    >
                      <TrendingUp size={16} className="text-blue-600" />
                      <span>{t('nav_prices')}</span>
                    </Link>

                    <Link
                      to="/calculator"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-emerald-400 transition"
                    >
                      <Calculator size={16} className="text-amber-600" />
                      <span>{t('nav_calculator')}</span>
                    </Link>

                    <Link
                      to="/transactions"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-emerald-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 hover:text-brand-700 dark:hover:text-emerald-400 transition"
                    >
                      <CreditCard size={16} className="text-purple-600" />
                      <span>{t('nav_transactions')}</span>
                    </Link>

                    {role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-purple-50 dark:hover:bg-gray-800 text-purple-700 dark:text-purple-400 font-bold transition"
                      >
                        <ShieldCheck size={16} className="text-purple-600" />
                        <span>Admin Oversight & Users Audit</span>
                      </Link>
                    )}
                  </div>

                  {/* Actions & Sign Out */}
                  <div className="p-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                    >
                      <LogOut size={16} />
                      <span>{t('nav_sign_out')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
