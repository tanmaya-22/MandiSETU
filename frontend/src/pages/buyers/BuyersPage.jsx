import { useState, useEffect } from 'react'
import { buyersAPI } from '../../api/modules'
import { Card, PageHeader, Spinner, EmptyState } from '../../components/common/UI'
import {
  ShieldCheck, Award, Building2, CheckCircle2,
  Clock, AlertCircle, Search
} from 'lucide-react'
import { useLangStore } from '../../store/langStore'

const MOCK_BUYERS = [
  {
    buyer_id: 'b-001',
    full_name: 'Rajesh Agrawal',
    business_name: 'Agrawal Agro Foods & Mills Pvt Ltd',
    reliability_score: 94.5,
    total_transactions: 48,
    completed_on_time: 46,
    disputes_filed_against: 0,
    avg_payment_days: 1.2,
    verified: true,
    badge: 'Gold',
  },
  {
    buyer_id: 'b-002',
    full_name: 'Suresh Patil',
    business_name: 'Sahyadri Farmer Producer & Retail',
    reliability_score: 87.0,
    total_transactions: 34,
    completed_on_time: 32,
    disputes_filed_against: 1,
    avg_payment_days: 2.0,
    verified: true,
    badge: 'Gold',
  },
  {
    buyer_id: 'b-003',
    full_name: 'Kavita Menon',
    business_name: 'Malabar Fresh Exports Ltd',
    reliability_score: 76.5,
    total_transactions: 19,
    completed_on_time: 17,
    disputes_filed_against: 1,
    avg_payment_days: 3.5,
    verified: true,
    badge: 'Silver',
  },
  {
    buyer_id: 'b-004',
    full_name: 'Vikas Singhal',
    business_name: 'Singhal Trading Co.',
    reliability_score: 62.0,
    total_transactions: 12,
    completed_on_time: 10,
    disputes_filed_against: 2,
    avg_payment_days: 4.8,
    verified: false,
    badge: 'Bronze',
  },
]

export default function BuyersPage() {
  const { t } = useLangStore()
  const [buyers, setBuyers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchBuyers = async () => {
      setLoading(true)
      try {
        const res = await buyersAPI.listVerified()
        if (res.data && res.data.length > 0) {
          setBuyers(res.data)
        } else {
          setBuyers(MOCK_BUYERS)
        }
      } catch {
        setBuyers(MOCK_BUYERS)
      } finally {
        setLoading(false)
      }
    }
    fetchBuyers()
  }, [])

  const filtered = buyers.filter(
    (b) =>
      b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.business_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getBadgeStyle = (badge) => {
    switch (badge) {
      case 'Gold':
        return 'bg-amber-100 text-amber-900 border-amber-300'
      case 'Silver':
        return 'bg-slate-100 text-slate-800 border-slate-300'
      case 'Bronze':
        return 'bg-orange-100 text-orange-900 border-orange-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('bp_title') || 'Buyer Verification & Credibility Index (Module 8)'}
        subtitle={t('bp_subtitle') || 'Transparent institutional and merchant credibility scores calculated from historical payment turnaround and grievance outcomes.'}
      />

      <Card className="flex items-center gap-3">
        <Search className="text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search buyers by name or business organization..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </Card>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState title="No verified buyers found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((buyer) => (
            <Card key={buyer.buyer_id} className="hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-base">{buyer.full_name}</h3>
                      {buyer.verified && (
                        <span className="text-brand-600 inline-flex items-center" title="Govt/GST Verified">
                          <CheckCircle2 size={16} />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Building2 size={13} /> {buyer.business_name || 'Independent Commercial Buyer'}
                    </p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1 ${getBadgeStyle(
                      buyer.badge
                    )}`}
                  >
                    <Award size={13} /> {buyer.badge} Tier
                  </span>
                </div>

                {/* Score bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500 font-medium">Reliability Trust Score</span>
                    <span className="font-bold text-brand-700">{buyer.reliability_score} / 100</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${
                        buyer.reliability_score >= 80
                          ? 'bg-brand-600'
                          : buyer.reliability_score >= 60
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(100, buyer.reliability_score)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-gray-400 block">Fulfilled Deals</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {buyer.completed_on_time} / {buyer.total_transactions}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Avg Payment</span>
                    <span className="font-semibold text-gray-800 text-sm">
                      {buyer.avg_payment_days} days
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Grievances</span>
                    <span
                      className={`font-semibold text-sm ${
                        buyer.disputes_filed_against > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {buyer.disputes_filed_against}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
