// Shared UI primitives with full Dark Mode support

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}

export function StatusBadge({ status }) {
  const colors = {
    active: 'badge-green', draft: 'badge-gray', matched: 'badge-blue',
    in_transit: 'badge-yellow', delivered: 'badge-green', completed: 'badge-green',
    closed: 'badge-gray', disputed: 'badge-red', cancelled: 'badge-red',
    initiated: 'badge-blue', payment_pending: 'badge-yellow',
    payment_received: 'badge-green', pickup_scheduled: 'badge-blue',
    open: 'badge-red', under_review: 'badge-yellow', resolved: 'badge-green',
    rising: 'badge-green', falling: 'badge-red', stable: 'badge-blue',
    low: 'badge-green', medium: 'badge-yellow', high: 'badge-red', critical: 'badge-red',
    Gold: 'badge-yellow', Silver: 'badge-gray', Bronze: 'badge-yellow', Unrated: 'badge-gray',
  }
  return <span className={colors[status] || 'badge-gray'}>{status?.replace(/_/g, ' ')}</span>
}

export function Spinner() {
  return (
    <div className="flex justify-center items-center py-16">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600 dark:border-emerald-400" />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      {Icon && <Icon className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />}
      <p className="text-gray-700 dark:text-gray-300 font-medium">{title}</p>
      {description && <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600 dark:bg-emerald-950/60 dark:text-emerald-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-amber-950/60 dark:text-amber-400',
    red: 'bg-red-50 text-red-600 dark:bg-red-950/60 dark:text-red-400',
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  )
}
