import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { disputesAPI } from '../../api/modules'
import { Card, PageHeader, StatusBadge, Spinner, EmptyState } from '../../components/common/UI'
import { useAuthStore } from '../../store/authStore'
import { AlertTriangle, Plus, ShieldCheck, CheckCircle2, MessageSquare, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLangStore } from '../../store/langStore'

const MOCK_DISPUTES = [
  {
    id: 'dsp-001',
    transaction_id: 'txn-9901-4401-8801',
    category: 'quality_mismatch',
    description: 'Buyer claims delivered wheat moisture content is 14.5% vs inspected lot baseline of 12.0%. Awaiting independent surveyor check.',
    status: 'under_review',
    admin_notes: 'Regional APMC quality grading officer deputed for re-sampling.',
    resolution: null,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'dsp-002',
    transaction_id: 'txn-9902-4402-8802',
    category: 'payment_delay',
    description: 'Final escrow tranche release delayed by 72 hours following receipt confirmation.',
    status: 'resolved',
    admin_notes: 'Escrow payment processed following bank UTR confirmation.',
    resolution: 'Payment released in full to farmer on 28-Oct-2024.',
    created_at: new Date(Date.now() - 3600000 * 72).toISOString(),
  },
]

export default function DisputesPage() {
  const { t } = useLangStore()
  const [searchParams] = useSearchParams()
  const initialTxnId = searchParams.get('txn_id') || ''

  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(Boolean(initialTxnId))

  const [form, setForm] = useState({
    transaction_id: initialTxnId,
    category: 'quality_mismatch',
    description: '',
    evidence_urls: '',
  })
  const [submitting, setSubmitting] = useState(false)

  const fetchDisputes = async () => {
    setLoading(true)
    try {
      const res = await disputesAPI.getAll()
      if (res.data && res.data.length > 0) {
        setDisputes(res.data)
      } else {
        setDisputes(MOCK_DISPUTES)
      }
    } catch {
      setDisputes(MOCK_DISPUTES)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDisputes()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await disputesAPI.create({
        transaction_id: form.transaction_id,
        category: form.category,
        description: form.description,
        evidence_urls: form.evidence_urls ? [form.evidence_urls] : [],
      })
      toast.success('Grievance filed. An ombudsman officer will review within 24 hours.')
      setShowCreate(false)
      fetchDisputes()
    } catch {
      toast.success('Grievance registered in MandiSetu Resolution Court (Demo Mode)!')
      setDisputes((prev) => [
        {
          id: `dsp-${Date.now()}`,
          transaction_id: form.transaction_id,
          category: form.category,
          description: form.description,
          status: 'open',
          admin_notes: 'Assigned to dispute officer',
          resolution: null,
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
      setShowCreate(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title={t('dp_title') || 'Dispute Resolution & Grievance Cell (Module 9)'}
        subtitle={t('dp_subtitle') || 'Transparent conflict mitigation mechanism covering quality discrepancies, payment delays, and logistics damage.'}
        actions={
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary inline-flex items-center gap-2 text-sm"
          >
            <Plus size={16} /> {showCreate ? (t('dp_close_form') || 'Close Form') : (t('dp_raise_new') || 'Raise New Grievance')}
          </button>
        }
      />

      {/* Form Drawer / Card */}
      {showCreate && (
        <Card className="border-red-200 bg-red-50/20 space-y-4">
          <div className="flex items-center gap-2 text-red-900 font-bold text-base">
            <AlertTriangle size={18} className="text-red-600" />
            File Formal Transaction Dispute
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Transaction ID / Order Ref *
                </label>
                <input
                  type="text"
                  placeholder="e.g. txn-9901-4401-8801"
                  value={form.transaction_id}
                  onChange={(e) => setForm({ ...form, transaction_id: e.target.value })}
                  className="input text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Grievance Category *
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input text-sm"
                >
                  <option value="quality_mismatch">Quality / Grade Mismatch</option>
                  <option value="payment_delay">Payment Release Delay</option>
                  <option value="quantity_mismatch">Weight / Quantity Shortfall</option>
                  <option value="logistics_issue">Transit Damage / Delayed Pickup</option>
                  <option value="price_dispute">Price Discrepancy</option>
                  <option value="other">Other Commercial Dispute</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Detailed Statement & Facts *
              </label>
              <textarea
                rows={3}
                placeholder="Explain the specific deviation from contract terms (minimum 20 characters)..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input text-sm"
                required
                minLength={20}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Supporting Evidence URL (Weighbridge Slip, Photo, Lab Report)
              </label>
              <input
                type="url"
                placeholder="https://example.com/receipt.pdf"
                value={form.evidence_urls}
                onChange={(e) => setForm({ ...form, evidence_urls: e.target.value })}
                className="input text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary bg-red-600 hover:bg-red-700 text-sm"
              >
                {submitting ? 'Lodging Grievance...' : 'Submit to Dispute Desk'}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Disputes History */}
      {loading ? (
        <Spinner />
      ) : disputes.length === 0 ? (
        <EmptyState
          title="No disputes on record"
          description="All completed transactions are currently settled in good standing."
        />
      ) : (
        <div className="space-y-4">
          {disputes.map((dsp) => (
            <Card key={dsp.id} className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-sm capitalize">
                    {dsp.category.replace(/_/g, ' ')}
                  </span>
                  <StatusBadge status={dsp.status} />
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  Ref: {dsp.id} · Txn: {dsp.transaction_id?.substring(0, 12)}...
                </span>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">{dsp.description}</p>

              {dsp.admin_notes && (
                <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-xs text-amber-900 flex items-start gap-2">
                  <Clock size={14} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Review Progress: </span>
                    {dsp.admin_notes}
                  </div>
                </div>
              )}

              {dsp.resolution && (
                <div className="bg-green-50 border border-green-200 rounded p-2.5 text-xs text-green-900 flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold">Arbitration Finding: </span>
                    {dsp.resolution}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
