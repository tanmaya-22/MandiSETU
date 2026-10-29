import { Link } from 'react-router-dom'
import {
  TrendingUp, Calculator, Star, Calendar, ShieldCheck, CloudRain,
  ArrowRight, Users, MapPin, IndianRupee, CheckCircle, Leaf
} from 'lucide-react'

const FEATURES = [
  {
    icon: TrendingUp,
    title: 'Price Discovery',
    desc: 'Real-time APMC mandi prices with ML-powered forecasts. Know exactly when and where to sell.',
    color: 'bg-green-50 text-green-600',
  },
  {
    icon: Calculator,
    title: 'Net Calculator',
    desc: 'Compare transport, commission and storage costs across mandis to maximise your take-home profit.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Star,
    title: 'Quality Grading',
    desc: 'AI-powered image analysis assigns A+–D grades instantly, boosting buyer confidence.',
    color: 'bg-yellow-50 text-yellow-600',
  },
  {
    icon: Calendar,
    title: 'ML Sale Window',
    desc: 'Optimal selling date recommendations balancing price peaks against spoilage risk.',
    color: 'bg-purple-50 text-purple-600',
  },
  {
    icon: ShieldCheck,
    title: 'Buyer Trust Score',
    desc: 'Verified buyer reliability scores so you always transact with trustworthy partners.',
    color: 'bg-red-50 text-red-600',
  },
  {
    icon: CloudRain,
    title: 'Weather Advisory',
    desc: 'Hyperlocal weather risk alerts protect your harvest from unexpected climate events.',
    color: 'bg-cyan-50 text-cyan-600',
  },
]

const STATS = [
  { label: 'Farmers Empowered', value: '10,000+', icon: Users },
  { label: 'Mandis Connected', value: '500+', icon: MapPin },
  { label: 'Transactions Facilitated', value: '₹50Cr+', icon: IndianRupee },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">MandiSetu</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-green-800 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <CheckCircle size={14} />
              Trusted by 10,000+ Indian farmers
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              MandiSetu —{' '}
              <span className="text-green-300">Bridging Farmers</span>{' '}
              to Fair Markets
            </h1>
            <p className="text-lg sm:text-xl text-green-100 mb-10 max-w-2xl">
              India's intelligent agri-market platform. Discover prices, calculate
              net realization, grade produce, and connect with verified buyers — all
              in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-green-50 transition shadow-lg"
              >
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-brand-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-100 rounded-2xl mb-3">
                  <Icon size={24} className="text-brand-600" />
                </div>
                <p className="text-3xl font-extrabold text-brand-700">{value}</p>
                <p className="text-gray-600 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything a Farmer Needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              12 integrated modules designed ground-up for Indian agricultural
              markets — from field to final sale.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="group p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-md transition-all cursor-default"
              >
                <div className={`inline-flex p-3 rounded-xl ${color} mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-brand-600 to-green-700 py-20">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to get fair prices for your produce?
          </h2>
          <p className="text-green-100 mb-8 text-lg">
            Join thousands of farmers already using MandiSetu to increase their income.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-brand-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-green-50 transition shadow-lg"
            >
              Register as Farmer <ArrowRight size={18} />
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition"
            >
              Register as Buyer
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Leaf size={16} className="text-brand-400" />
          <span className="text-white font-semibold">MandiSetu</span>
        </div>
        <p>© 2025 MandiSetu. Empowering Indian Agriculture.</p>
      </footer>
    </div>
  )
}
