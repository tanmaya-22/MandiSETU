import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'
import HeaderControls from './HeaderControls'
import {
  LayoutDashboard, TrendingUp, Calculator, Package, Users,
  CreditCard, Lightbulb, ShieldCheck, Truck, AlertTriangle,
  Camera, CloudRain, BarChart3, LogOut, Menu, X, Leaf
} from 'lucide-react'
import { useState } from 'react'

export default function Layout() {
  const { role, user, logout } = useAuthStore()
  const { t } = useLangStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
      {/* Sidebar for Desktop & Drawer for Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-brand-950 via-brand-900 to-gray-950 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col shadow-2xl border-r border-brand-800/40`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-800/50">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-brand-500 to-emerald-400 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition">
              <Leaf size={18} className="text-white" />
            </div>
            <div>
              <p className="font-extrabold text-lg leading-tight tracking-tight text-white">{t('brand_name')}</p>
              <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Agri-Market Suite</p>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card inside Sidebar */}
        <div className="px-5 py-4 border-b border-brand-800/40 bg-white/[0.03]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
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

        {/* Navigation items list */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-none">
          {items.map(({ to, icon: Icon, label, module: mod }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-600 to-emerald-600 text-white shadow-md font-bold'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon size={16} className="transition-transform group-hover:scale-110" />
              <span className="flex-1 truncate">{label}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-emerald-300/80">
                M{mod}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Sign Out Button */}
        <div className="p-3 border-t border-brand-800/50 bg-black/20">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-gray-300 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition"
          >
            <LogOut size={16} />
            <span>{t('nav_sign_out')}</span>
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
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

            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">{user?.full_name || 'Farmer'}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">{role || 'Farmer'}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-bold text-xs flex items-center justify-center">
                {initials}
              </div>
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
