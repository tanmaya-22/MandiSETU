// Shared UI primitives

export function Card({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
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
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
    </div>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16">
      {Icon && <Icon className="mx-auto text-gray-300 mb-4" size={48} />}
      <p className="text-gray-500 font-medium">{title}</p>
      {description && <p className="text-gray-400 text-sm mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function StatCard({ label, value, icon: Icon, color = 'brand' }) {
  const colorMap = {
    brand: 'bg-brand-50 text-brand-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
  }
  return (
    <div className="card flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}
