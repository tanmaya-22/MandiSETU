import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp, Calculator, Star, Calendar, ShieldCheck, CloudRain,
  ArrowRight, Users, MapPin, IndianRupee, CheckCircle2, Leaf,
  ChevronRight, Sparkles, Navigation, Layers, Tractor, Building2,
  BarChart3, Camera, Truck, AlertTriangle
} from 'lucide-react'
import { useLangStore } from '../store/langStore'
import HeaderControls from '../components/common/HeaderControls'

const TICKER_ITEMS = [
  { mandi: 'Lasalgaon APMC', commodity: 'Onion', price: '₹3,250/Qtl', change: '+₹150', up: true },
  { mandi: 'Azadpur Mandi', commodity: 'Wheat', price: '₹2,485/Qtl', change: '+₹35', up: true },
  { mandi: 'Kolar Mandi', commodity: 'Tomato', price: '₹2,050/Qtl', change: '-₹80', up: false },
  { mandi: 'Agra Mandi', commodity: 'Potato', price: '₹1,620/Qtl', change: '+₹40', up: true },
  { mandi: 'Indore Mandi', commodity: 'Soybean', price: '₹4,780/Qtl', change: '+₹110', up: true },
  { mandi: 'Rajkot APMC', commodity: 'Cotton', price: '₹7,420/Qtl', change: '-₹50', up: false },
  { mandi: 'Karnal Market', commodity: 'Basmati Rice', price: '₹3,950/Qtl', change: '+₹90', up: true },
]

const MODULES = [
  {
    num: '01',
    icon: Users,
    title: 'User & Role Architecture',
    desc: 'Distinct unified dashboards for Farmers, Bulk Buyers, Aggregators/FPOs, and Admins.',
    color: 'from-emerald-500/10 to-emerald-600/20 text-emerald-700',
  },
  {
    num: '02',
    icon: TrendingUp,
    title: 'Price Discovery & Forecast',
    desc: 'Real-time Agmarknet APMC rates with Prophet ML 14-day price trajectory curves.',
    color: 'from-blue-500/10 to-blue-600/20 text-blue-700',
  },
  {
    num: '03',
    icon: Calculator,
    title: 'Net-Realization Calculator',
    desc: 'Haversine distance freight deduction, APMC cess, and net in-hand realization.',
    color: 'from-amber-500/10 to-amber-600/20 text-amber-700',
  },
  {
    num: '04',
    icon: Tractor,
    title: 'Produce Lot Listings',
    desc: 'Create verified crop listings with harvest dates, floor prices, and location coordinates.',
    color: 'from-teal-500/10 to-teal-600/20 text-teal-700',
  },
  {
    num: '05',
    icon: ShieldCheck,
    title: 'Buyer-Farmer Match Engine',
    desc: 'Algorithmic matching scoring buyers and farmers based on crop grade, price, and distance.',
    color: 'from-indigo-500/10 to-indigo-600/20 text-indigo-700',
  },
  {
    num: '06',
    icon: IndianRupee,
    title: 'Escrow & Transaction State',
    desc: 'End-to-end 7-stage state machine from contract agreement to final disbursement.',
    color: 'from-green-500/10 to-green-600/20 text-green-700',
  },
  {
    num: '07',
    icon: Calendar,
    title: 'Optimal Sale Window (ML)',
    desc: 'Balances price appreciation curves against crop perishability and storage degradation.',
    color: 'from-purple-500/10 to-purple-600/20 text-purple-700',
  },
  {
    num: '08',
    icon: Star,
    title: 'Buyer Trust & Scoring',
    desc: 'Verified reliability rating based on payment punctuality, dispute history, and volume.',
    color: 'from-rose-500/10 to-rose-600/20 text-rose-700',
  },
  {
    num: '8B',
    icon: Truck,
    title: 'Logistics Coordination',
    desc: 'Per-tonne-km freight estimation and carrier integration with live tracking.',
    color: 'from-orange-500/10 to-orange-600/20 text-orange-700',
  },
  {
    num: '09',
    icon: AlertTriangle,
    title: 'Dispute Arbitration',
    desc: 'Transparent dispute filing with photo evidence, weights verification, and admin mediation.',
    color: 'from-red-500/10 to-red-600/20 text-red-700',
  },
  {
    num: '10',
    icon: Camera,
    title: 'Computer Vision Grading',
    desc: 'Upload produce photos for instant ML color, shape, and defect analysis (Grades A+ to C).',
    color: 'from-cyan-500/10 to-cyan-600/20 text-cyan-700',
  },
  {
    num: '11',
    icon: CloudRain,
    title: 'Weather Risk Advisory',
    desc: 'Hyperlocal weather risk matrix warning against unseasonal rain during transit or harvest.',
    color: 'from-sky-500/10 to-sky-600/20 text-sky-700',
  },
]

export default function LandingPage() {
  const { t } = useLangStore()
  const [sampleQty, setSampleQty] = useState(50) // quintals
  const [sampleCommodity, setSampleCommodity] = useState('Onion')

  const commodityPrices = {
    Onion: { localMandi: 2800, distantMandi: 3650, distance: 180 },
    Wheat: { localMandi: 2280, distantMandi: 2550, distance: 120 },
    Tomato: { localMandi: 1600, distantMandi: 2200, distance: 95 },
    Potato: { localMandi: 1350, distantMandi: 1750, distance: 140 },
  }
  const currentCalc = commodityPrices[sampleCommodity]
  const transportCostPerQtl = Math.round(currentCalc.distance * 1.8)
  const netLocal = currentCalc.localMandi * sampleQty
  const netDistant = (currentCalc.distantMandi - transportCostPerQtl) * sampleQty
  const extraProfit = Math.max(0, netDistant - netLocal)

  const handleOpenTour = () => {
    window.dispatchEvent(new CustomEvent('mandisetu_open_guide', { detail: { pageMode: false } }))
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors selection:bg-brand-200">
      {/* 1. Real-time Live Mandi Ticker Bar */}
      <div className="bg-brand-950 text-white text-xs py-2 px-4 overflow-hidden border-b border-brand-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold tracking-wider uppercase text-[10px] text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{t('live_feed_active')}:</span>
          </div>
          <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
            {TICKER_ITEMS.map((item, i) => (
              <div key={i} className="inline-flex items-center gap-1.5 text-xs">
                <span className="font-medium text-gray-300">{item.mandi}</span>
                <span className="font-bold text-white">{item.commodity}</span>
                <span className="font-extrabold text-emerald-300">{item.price}</span>
                <span className={`text-[10px] font-bold ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                  {item.change}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Sticky Glass Navigation */}
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-brand-600 to-emerald-500 rounded-xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Leaf size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                {t('brand_name')}
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                12 Integrated Modules
              </span>
            </div>
          </Link>

          {/* Multilingual Selector + Dark Mode Toggle + Auth buttons */}
          <div className="flex items-center gap-3">
            <HeaderControls onOpenFullTour={handleOpenTour} />

            <Link
              to="/login"
              className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-700 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition"
            >
              {t('nav_sign_in')}
            </Link>
            <Link
              to="/register"
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shadow-sm hover:shadow-md"
            >
              <span>{t('nav_get_started')}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* 3. Hero Section with Interactive Gradient & Glow */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-emerald-800 to-green-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-teal-300/15 rounded-full blur-3xl animate-blob delay-500" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-emerald-200">
                <Sparkles size={14} className="text-amber-300" />
                <span>India’s 1st AI & Geospatial Agricultural Market Bridge</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                Bridging Farmers to <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-green-300">
                  Fair Mandi Prices.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-emerald-100 max-w-2xl leading-relaxed">
                Stop selling below market value. MandiSetu connects Indian smallholder farmers and FPOs directly to verified buyers, providing real-time APMC price intelligence, haversine transport cost optimization, and computer vision quality grading.
              </p>

              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="px-7 py-3.5 bg-white text-brand-900 font-bold rounded-2xl shadow-xl hover:bg-emerald-50 hover:shadow-2xl transition-all duration-200 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:scale-95"
                >
                  <span>Explore Platform Free</span>
                  <ArrowRight size={18} />
                </Link>

                <button
                  onClick={handleOpenTour}
                  className="px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Sparkles size={18} className="text-amber-300" />
                  <span>Interactive Farmer Tour</span>
                </button>
              </div>

              {/* Feature Pill Highlights */}
              <div className="pt-4 flex flex-wrap gap-4 text-xs text-emerald-200">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Real Agmarknet Benchmark Data</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>Interactive Geospatial Mandi Map</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={16} className="text-emerald-400" />
                  <span>4 Languages (EN / हिन्दी / मराठी / ଓଡ଼ିଆ)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Live Take-Home Profit Calculator Preview */}
            <div className="lg:col-span-5 animate-scale-in">
              <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/80 dark:border-gray-800 text-gray-900 dark:text-gray-100">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-xl">
                      <Calculator size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">Net Realization Estimator</h3>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Compare take-home profit across mandis</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-100 dark:bg-brand-950 text-brand-800 dark:text-brand-300 rounded-full">
                    Module 3
                  </span>
                </div>

                {/* Crop & Quantity Selector */}
                <div className="space-y-3.5">
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-300 block mb-1">Select Crop</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {['Onion', 'Wheat', 'Tomato', 'Potato'].map((crop) => (
                        <button
                          key={crop}
                          onClick={() => setSampleCommodity(crop)}
                          className={`py-1.5 text-xs font-bold rounded-xl transition ${
                            sampleCommodity === crop
                              ? 'bg-brand-600 text-white shadow-sm'
                              : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {crop}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                      <span>Harvest Quantity</span>
                      <span className="text-brand-700 dark:text-emerald-400 font-bold">{sampleQty} Quintals ({sampleQty * 100} kg)</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      step="5"
                      value={sampleQty}
                      onChange={(e) => setSampleQty(Number(e.target.value))}
                      className="w-full accent-brand-600 cursor-pointer"
                    />
                  </div>

                  {/* Profit Comparison Card */}
                  <div className="p-3.5 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Local Village Broker:</span>
                      <span className="font-semibold text-gray-700 dark:text-gray-200">₹{netLocal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">MandiSetu Terminal APMC:</span>
                      <span className="font-bold text-brand-700 dark:text-emerald-400">₹{netDistant.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex justify-between items-center">
                      <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200">Your Extra Take-Home:</span>
                      <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400">
                        +₹{extraProfit.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <Link
                    to="/calculator"
                    className="block w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold text-center rounded-xl transition shadow-md"
                  >
                    Open Full Multi-Mandi Route Calculator →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Platform Statistics */}
      <section className="bg-emerald-50/60 dark:bg-gray-900 py-12 border-b border-emerald-100 dark:border-gray-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-700 dark:text-emerald-400">500+</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">APMC Mandis Connected</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-700 dark:text-emerald-400">10,000+</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Empowered Farmers</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-700 dark:text-emerald-400">₹50 Cr+</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">Facilitated Trade Value</div>
            </div>
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-brand-700 dark:text-emerald-400">12 Modules</div>
              <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mt-1">End-to-End Agri Suite</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. 12 Comprehensive Integrated Modules Grid */}
      <section className="py-20 bg-white dark:bg-gray-950 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-emerald-400 bg-brand-50 dark:bg-gray-900 px-3 py-1 rounded-full border border-brand-200 dark:border-gray-800">
              Full Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-3 mb-4">
              All 12 Modules Built Ground-Up for Indian Agriculture
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              Every stage from harvest date planning, ML price discovery, quality assessment to dispute settlement is covered under a unified digital workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((m) => {
              const Icon = m.icon
              return (
                <div
                  key={m.num}
                  className="card-interactive group p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-brand-300 dark:hover:border-emerald-600 hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-900"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                      <Icon size={22} />
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-400 group-hover:text-brand-600 dark:group-hover:text-emerald-400 transition">
                      M{m.num}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-700 dark:group-hover:text-emerald-400 transition">
                    {m.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. Call to Action Banner */}
      <section className="bg-gradient-to-r from-brand-700 via-emerald-700 to-green-800 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to experience transparent agri-market intelligence?
          </h2>
          <p className="text-emerald-100 max-w-xl mx-auto text-sm sm:text-base">
            Create a free account in under 60 seconds. Sign in with demo credentials or register as a farmer, buyer, or FPO.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 bg-white text-brand-900 font-bold rounded-2xl shadow-xl hover:bg-emerald-50 transition transform hover:-translate-y-0.5"
            >
              Get Started for Free
            </Link>
            <Link
              to="/login"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-2xl transition"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Comprehensive Decluttered Modern Footer */}
      <footer className="bg-gray-950 text-gray-300 py-12 border-t border-gray-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-gray-800">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Leaf size={22} className="text-emerald-400" />
                <span className="text-white font-extrabold text-lg">MandiSetu</span>
                <span className="text-emerald-400 text-xs px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 font-bold">
                  Agri-Market Platform
                </span>
              </div>
              <p className="text-gray-400 text-xs max-w-md">
                Empowering Indian farmers with Agmarknet price intelligence, net take-home calculators, OpenStreetMap logistics, and dispute arbitration.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <Link to="/prices" className="hover:text-emerald-400 transition">Market Rates</Link>
              <Link to="/calculator" className="hover:text-emerald-400 transition">Net Calculator</Link>
              <Link to="/mandi-map" className="hover:text-emerald-400 transition">Mandi Maps</Link>
              <Link to="/weather" className="hover:text-emerald-400 transition">Weather Alerts</Link>
              <Link to="/feedback" className="text-emerald-400 font-bold hover:underline">💬 Give Feedback</Link>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
            <div>
              © 2024–2026 MandiSetu. All rights reserved.
            </div>

            <div className="font-semibold text-gray-200 text-center">
              Credits for Prototype: <span className="text-emerald-400 font-bold">Tanmaya; Anuj; Yatharth and team</span>
            </div>

            <div className="flex items-center gap-4 font-mono text-[11px]">
              <a href="mailto:tanmayapradhan2322@gmail.com" className="hover:text-emerald-400 transition">
                tanmayapradhan2322@gmail.com
              </a>
              <span>·</span>
              <a href="tel:+917008800192" className="hover:text-emerald-400 transition">
                +91 7008800192
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
