import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, TrendingUp, Calculator, Package, Users,
  CreditCard, Lightbulb, ShieldCheck, Truck, AlertTriangle,
  Camera, CloudRain, BarChart3, LogOut, Menu, X, Leaf
} from 'lucide-react'
import { useState } from 'react'

const navItems = (role) => {
  const base = [
    { to: '/prices',      icon: TrendingUp,   label: 'Price Discovery',   module: '2' },
    { to: '/calculator',  icon: Calculator,   label: 'Net Calculator',    module: '3' },
    { to: '/listings',    icon: Package,       label: 'Listings',          module: '4' },
    { to: '/transactions',icon: CreditCard,   label: 'Transactions',      module: '6' },
    { to: '/buyers',      icon: Users,         label: 'Buyers',            module: '8' },
    { to: '/logistics',   icon: Truck,         label: 'Logistics',         module: '8b' },
    { to: '/disputes',    icon: AlertTriangle, label: 'Disputes',          module: '9' },
    { to: '/weather',     icon: CloudRain,     label: 'Weather Advisory',  module: '11' },
  ]
  const farmer = [
    { to: '/grading',     icon: Camera,        label: 'Quality Grading',   module: '10' },
    { to: '/sale-window', icon: Lightbulb,     label: 'Sale Window',       module: '7' },
  ]
  const buyer = [
    { to: '/matching',    icon: ShieldCheck,   label: 'Find Lots',         module: '5' },
  ]
  const admin = [
    { to: '/analytics',   icon: BarChart3,     label: 'Analytics',         module: '12' },
    { to: '/admin',       icon: LayoutDashboard, label: 'Admin Panel',     module: '1' },
  ]
  if (role === 'admin') return [...base, ...farmer, ...buyer, ...admin]
  if (role === 'buyer') return [...base, ...buyer]
  return [...base, ...farmer]
}

export default function Layout() {
  const { role, user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const items = navItems(role)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-brand-900 text-white transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-brand-800">
          <Leaf className="text-brand-300" size={28} />
          <div>
            <p className="font-bold text-lg leading-tight">MandiSetu</p>
            <p className="text-brand-400 text-xs">Farm to Market Bridge</p>
          </div>
        </div>

        {/* User info */}
        <div className="px-6 py-4 border-b border-brand-800">
          <p className="text-sm font-medium truncate">{user?.full_name || 'User'}</p>
          <span className="text-xs bg-brand-700 text-brand-200 px-2 py-0.5 rounded-full capitalize">
            {role}
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {items.map(({ to, icon: Icon, label, module: mod }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-brand-700 text-white'
                  : 'text-brand-300 hover:bg-brand-800 hover:text-white'}`
              }
            >
              <Icon size={18} />
              <span className="flex-1">{label}</span>
              <span className="text-xs text-brand-500 font-mono">M{mod}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-brand-800">
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-brand-300 hover:text-white hover:bg-brand-800 rounded-lg text-sm transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1 lg:hidden">
            <p className="font-bold text-brand-700">MandiSetu</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">
              {user?.full_name} · <span className="capitalize">{role}</span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
