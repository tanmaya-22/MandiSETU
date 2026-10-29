import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { transactionsAPI } from '../../api/modules'
import { Card, PageHeader, StatusBadge, Spinner } from '../../components/common/UI'
import { useAuthStore } from '../../store/authStore'
import {
  ArrowLeft, CheckCircle, Clock, Truck, ShieldAlert,
  FileText, IndianRupee, MapPin
} from 'lucide-react'
import toast from 'react-hot-toast'

const LIFECYCLE_STEPS = [
  { key: 'initiated', label: 'Offer Accepted' },
  { key: 'payment_pending', label: 'Payment Pending' },
  { key: 'payment_received', label: 'Escrow Funded' },
  { key: 'pickup_scheduled', label: 'Pickup Scheduled' },
  { key: 'in_transit', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered at Gate' },
  { key: 'completed', label: 'Settlement Completed' },
]

export default function TransactionDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { role } = useAuthStore()

  const [txn, setTxn] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [nextStatus, setNextStatus] = useState('')

  const fetchTxn = async () => {
    setLoading(true)
    try {
      const res = await transactionsAPI.getOne(id)
      setTxn(res.data)
    } catch {
      // Mock fallback
      setTxn({
        id,
        lot_id: '1a2b3c4d-0001-4000-8000-000000000001',
        final_price_per_kg: 24.5,
        quantity_kg: 2500,
        total_amount: 61250,
        transport_cost: 1120,
        commission_cost: 612.5,
        storage_cost: 250,
        net_realization: 59267.5,
        status: 'in_transit',
        status_history: [
          { status: 'initiated', timestamp: new Date(Date.now() - 3600000 * 36).toISOString(), note: 'Offer accepted by farmer' },
          { status: 'payment_pending', timestamp: new Date(Date.now() - 3600000 * 30).toISOString(), note: 'Invoice generated' },
          { status: 'payment_received', timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), note: 'Buyer escrow deposit verified' },
          { status: 'pickup_scheduled', timestamp: new Date(Date.now() - 3600000 * 18).toISOString(), note: 'Carrier assigned' },
          { status: 'in_transit', timestamp: new Date(Date.now() - 3600000 * 6).toISOString(), note: 'Vehicle departed farm gate' },
        ],
        logistics_provider: 'MandiSetu AgriLogistics (Tata 407)',
        tracking_id: 'TRK-IND-9281',
        pickup_date: new Date(Date.now() - 3600000 * 6).toISOString(),
        delivery_date: new Date(Date.now() + 3600000 * 12).toISOString(),
        commodity: 'Wheat (Sharbati HD-2967)',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTxn()
  }, [id])

  const handleAdvanceStatus = async () => {
    if (!nextStatus) return
    setUpdatingStatus(true)
    try {
      await transactionsAPI.updateStatus(id, {
        status: nextStatus,
        note: `Status updated to ${nextStatus}`,
      })
      toast.success(`Transaction progressed to ${nextStatus}!`)
      fetchTxn()
    } catch {
      toast.success(`Transaction state updated to ${nextStatus} (Demo Mode)`)
      setTxn((prev) => ({
        ...prev,
        status: nextStatus,
        status_history: [
          ...(prev.status_history || []),
          { status: nextStatus, timestamp: new Date().toISOString(), note: 'Manual override in demo' },
        ],
      }))
    } finally {
      setUpdatingStatus(false)
      setNextStatus('')
    }
  }

  if (loading || !txn) return <Spinner />

  const currentStepIdx = LIFECYCLE_STEPS.findIndex((s) => s.key === txn.status)

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/transactions')}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft size={16} /> Back to Transactions
      </button>

      <PageHeader
        title={`Transaction #${txn.id.substring(0, 8)}`}
        subtitle={`Commodity: ${txn.commodity || 'Agricultural Lot'} · Quantity: ${txn.quantity_kg.toLocaleString()} kg`}
        actions={<StatusBadge status={txn.status} />}
      />

      {/* Progress Stepper */}
      <Card>
        <h3 className="text-sm font-semibold text-gray-800 mb-6">Fulfillment Lifecycle</h3>
        <div className="relative flex flex-col md:flex-row justify-between gap-4">
          {LIFECYCLE_STEPS.map((step, idx) => {
            const isDone = currentStepIdx >= idx
            const isCurrent = currentStepIdx === idx
            return (
              <div key={step.key} className="flex-1 flex md:flex-col items-center gap-3 relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 z-10 transition-colors
                    ${isDone ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400'}`}
                >
                  {isDone ? <CheckCircle size={18} /> : idx + 1}
                </div>
                <div className="text-left md:text-center">
                  <p className={`text-xs font-semibold ${isCurrent ? 'text-brand-700' : 'text-gray-700'}`}>
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Financial Breakdown (Module 3 Integration) */}
        <div className="md:col-span-2 space-y-6">
          <Card className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <IndianRupee size={18} className="text-brand-600" />
              Settlement & Net-Realization Audit
            </h3>

            <div className="divide-y divide-gray-100 text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-600">Contracted Rate</span>
                <span className="font-semibold text-gray-900">₹{txn.final_price_per_kg} / kg</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-gray-600">Total Lot Volume</span>
                <span className="font-semibold text-gray-900">{txn.quantity_kg.toLocaleString()} kg</span>
              </div>
              <div className="py-2.5 flex justify-between text-base">
                <span className="font-bold text-gray-900">Gross Contract Value</span>
                <span className="font-bold text-gray-900">₹{txn.total_amount.toLocaleString()}</span>
              </div>

              {/* Deductions breakdown */}
              <div className="py-2 flex justify-between text-xs text-red-600">
                <span>Freight & Transport Deduction</span>
                <span>- ₹{txn.transport_cost?.toLocaleString() || 0}</span>
              </div>
              <div className="py-2 flex justify-between text-xs text-red-600">
                <span>APMC / Market Mandi Fee (2%)</span>
                <span>- ₹{txn.commission_cost?.toLocaleString() || 0}</span>
              </div>
              <div className="py-2 flex justify-between text-xs text-red-600">
                <span>Weighment & Storage Deduction</span>
                <span>- ₹{txn.storage_cost?.toLocaleString() || 0}</span>
              </div>

              <div className="pt-3 pb-1 flex justify-between text-lg bg-brand-50/60 p-3 rounded-lg mt-2">
                <span className="font-bold text-brand-900">True Net Take-Home Realization</span>
                <span className="font-bold text-brand-700">₹{txn.net_realization?.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Audit Trail Timeline */}
          <Card className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              Detailed Status Audit Log
            </h3>
            <div className="space-y-3">
              {(txn.status_history || []).map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-xs border-l-2 border-brand-500 pl-3 py-1">
                  <div>
                    <span className="font-bold capitalize text-gray-800">{h.status.replace(/_/g, ' ')}</span>
                    <p className="text-gray-500 mt-0.5">{h.note || 'State transition verified'}</p>
                    <span className="text-[11px] text-gray-400">{new Date(h.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Logistics & Actions */}
        <div className="space-y-6">
          <Card className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Truck size={17} className="text-brand-600" /> Logistics Coordinator
            </h4>
            <div className="text-xs space-y-2 text-gray-600">
              <p>
                <span className="text-gray-400 block">Fleet Operator:</span>
                <span className="font-semibold text-gray-800">{txn.logistics_provider || 'Not assigned'}</span>
              </p>
              <p>
                <span className="text-gray-400 block">Tracking Waybill:</span>
                <span className="font-mono font-semibold text-brand-700">{txn.tracking_id || 'Pending'}</span>
              </p>
            </div>
          </Card>

          {/* Admin / State Transition Panel */}
          <Card className="space-y-3">
            <h4 className="font-semibold text-gray-900 text-sm">State Progression (Demo Controls)</h4>
            <select
              value={nextStatus}
              onChange={(e) => setNextStatus(e.target.value)}
              className="input text-xs"
            >
              <option value="">Select next state...</option>
              <option value="payment_received">Payment Received</option>
              <option value="pickup_scheduled">Pickup Scheduled</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed / Settled</option>
            </select>
            <button
              onClick={handleAdvanceStatus}
              disabled={!nextStatus || updatingStatus}
              className="btn-primary w-full text-xs"
            >
              Update State
            </button>
          </Card>

          {/* Dispute Link */}
          <Card className="bg-red-50/50 border-red-200 space-y-2">
            <h4 className="font-semibold text-red-900 text-sm flex items-center gap-1.5">
              <ShieldAlert size={16} className="text-red-600" /> Need Assistance?
            </h4>
            <p className="text-xs text-red-700">
              Discrepancy in weight, quality grade, or payment delay?
            </p>
            <Link
              to={`/disputes?txn_id=${txn.id}`}
              className="btn-secondary text-xs text-red-700 border-red-300 hover:bg-red-50 w-full block text-center"
            >
              Raise Grievance (Module 9)
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
