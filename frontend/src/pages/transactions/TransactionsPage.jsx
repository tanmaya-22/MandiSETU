import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { transactionsAPI } from '../../api/modules'
import { Card, PageHeader, StatusBadge, Spinner, EmptyState } from '../../components/common/UI'
import { ArrowRight, Receipt, Truck, Calendar, IndianRupee } from 'lucide-react'
import { useLangStore } from '../../store/langStore'

const MOCK_TRANSACTIONS = [
  {
    id: 'txn-9901-4401-8801',
    lot_id: '1a2b3c4d-0001-4000-8000-000000000001',
    final_price_per_kg: 24.5,
    quantity_kg: 2500,
    total_amount: 61250,
    transport_cost: 1120,
    commission_cost: 612.5,
    storage_cost: 0,
    net_realization: 59517.5,
    status: 'in_transit',
    logistics_provider: 'MandiSetu AgriLogistics (Tata 407)',
    tracking_id: 'TRK-IND-9281',
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    commodity: 'Wheat (Sharbati)',
  },
  {
    id: 'txn-9902-4402-8802',
    lot_id: '1a2b3c4d-0002-4000-8000-000000000002',
    final_price_per_kg: 16.0,
    quantity_kg: 1800,
    total_amount: 28800,
    transport_cost: 840,
    commission_cost: 288,
    storage_cost: 0,
    net_realization: 27672,
    status: 'completed',
    logistics_provider: 'Direct Buyer Fleet',
    tracking_id: 'TRK-IND-8819',
    created_at: new Date(Date.now() - 3600000 * 96).toISOString(),
    commodity: 'Tomato (Hybrid)',
  },
  {
    id: 'txn-9903-4403-8803',
    lot_id: '1a2b3c4d-0003-4000-8000-000000000003',
    final_price_per_kg: 18.2,
    quantity_kg: 4000,
    total_amount: 72800,
    transport_cost: 1650,
    commission_cost: 728,
    storage_cost: 0,
    net_realization: 70422,
    status: 'payment_received',
    logistics_provider: 'Scheduled Dispatch',
    tracking_id: 'TRK-IND-1049',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    commodity: 'Onion (Nashik Red)',
  },
]

export default function TransactionsPage() {
  const { t } = useLangStore()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTxns = async () => {
      setLoading(true)
      try {
        const res = await transactionsAPI.getAll()
        if (res.data && res.data.length > 0) {
          setTransactions(res.data)
        } else {
          setTransactions(MOCK_TRANSACTIONS)
        }
      } catch {
        setTransactions(MOCK_TRANSACTIONS)
      } finally {
        setLoading(false)
      }
    }
    fetchTxns()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('tp_title') || 'Transaction Tracking & Settlement (Module 6)'}
        subtitle={t('tp_subtitle') || 'End-to-end digital audit trail tracking lifecycle stages from offer acceptance to delivery and escrow settlement.'}
      />

      {loading ? (
        <Spinner />
      ) : transactions.length === 0 ? (
        <EmptyState
          title="No recorded transactions"
          description="Transactions appear when buyer offers are accepted by produce sellers."
        />
      ) : (
        <div className="space-y-4">
          {transactions.map((txn) => (
            <Card key={txn.id} className="hover:shadow-md transition-shadow duration-150">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-base">
                      {txn.commodity || 'Agricultural Produce Lot'}
                    </span>
                    <StatusBadge status={txn.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Receipt size={13} /> {txn.id.substring(0, 18)}...
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {new Date(txn.created_at).toLocaleDateString()}
                    </span>
                    {txn.tracking_id && (
                      <span className="flex items-center gap-1 text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                        <Truck size={13} /> {txn.tracking_id}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-xs text-gray-400 block">Gross Trade Value</span>
                    <span className="text-base font-bold text-gray-900">
                      ₹{txn.total_amount?.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-gray-400 block">Net Realization</span>
                    <span className="text-base font-bold text-brand-600">
                      ₹{txn.net_realization ? txn.net_realization.toLocaleString() : txn.total_amount?.toLocaleString()}
                    </span>
                  </div>

                  <Link
                    to={`/transactions/${txn.id}`}
                    className="btn-primary text-xs px-3.5 py-2 inline-flex items-center gap-1"
                  >
                    View Timeline <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
