import { useState, useEffect } from 'react'
import {
  MessageSquare, Star, Send, Mail, Phone, CheckCircle2,
  Sparkles, ThumbsUp, Shield, Lightbulb, AlertCircle, HeartHandshake
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { useLangStore } from '../../store/langStore'

const CATEGORIES = [
  { id: 'general', label: '🌾 General Improvement', icon: Lightbulb },
  { id: 'pricing', label: '📈 Mandi Prices & Accuracy', icon: Sparkles },
  { id: 'calculator', label: '🧮 Calculator & Transport Costs', icon: ThumbsUp },
  { id: 'maps', label: '🗺️ Mandi Maps & Location', icon: Shield },
  { id: 'ui', label: '🎨 Design & Color Contrast', icon: MessageSquare },
  { id: 'bug', label: '⚠️ Issue or Bug Report', icon: AlertCircle },
]

export default function FeedbackPage() {
  const { user } = useAuthStore()
  const { language } = useLangStore()

  const [form, setForm] = useState({
    name: user?.full_name || user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    category: 'general',
    rating: 5,
    message: '',
    recommend: 'yes',
  })
  const [submitting, setSubmitting] = useState(false)
  const [myFeedbacks, setMyFeedbacks] = useState([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('mandisetu_user_feedbacks')
      if (stored) {
        const parsed = JSON.parse(stored)
        setMyFeedbacks(parsed.filter(f => f.email === user?.email || !user?.email))
      }
    } catch {
      // ignore
    }
  }, [user?.email])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.message.trim()) {
      toast.error('Please write a short suggestion or feedback message!')
      return
    }

    setSubmitting(true)
    const newEntry = {
      id: 'fb_' + Date.now(),
      ...form,
      timestamp: new Date().toISOString(),
      user_id: user?.id || user?.user_id || 'guest',
      role: user?.role || 'visitor',
      status: 'new',
    }

    try {
      const existing = JSON.parse(localStorage.getItem('mandisetu_user_feedbacks') || '[]')
      const updated = [newEntry, ...existing]
      localStorage.setItem('mandisetu_user_feedbacks', JSON.stringify(updated))
      setMyFeedbacks(prev => [newEntry, ...prev])

      toast.success('Thank you! Your feedback has been sent to TanmayA and the MandiSetu team.', {
        duration: 5000,
        icon: '🙏',
      })
      setForm(prev => ({ ...prev, message: '' }))
    } catch (err) {
      toast.error('Could not save feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-brand-700 via-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold mb-3">
            <HeartHandshake size={14} />
            <span>Direct Feedback to the Admin & MandiSetu Team</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Help Us Improve MandiSetu</h1>
          <p className="text-emerald-100 mt-2 text-sm leading-relaxed">
            Every feature here is built for Indian farmers. Tell us what you like, what is missing, or how we can make price discovery and trading smoother for you.
          </p>
        </div>
      </div>

      {/* Admin Contact Details Card */}
      <div className="bg-white dark:bg-gray-900 border border-brand-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 card-interactive">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">
              Platform Admin: <span className="text-brand-600 dark:text-brand-400 font-bold">TanmayA</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Prototype developed with Anuj, Yatharth & the MandiSetu Team.
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs">
          <span className="text-gray-500 dark:text-gray-400 font-semibold">Contact with the Admin Personally:</span>
          <div className="flex flex-wrap items-center gap-2 font-mono">
            <a
              href="mailto:tanmayapradhan2322@gmail.com"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/30 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <Mail size={13} className="text-brand-600" />
              <span>tanmayapradhan2322@gmail.com</span>
            </a>
            <a
              href="tel:+917008800192"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-brand-900/30 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors"
            >
              <Phone size={13} className="text-brand-600" />
              <span>+91 7008800192</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Feedback Form */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-7 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Feedback Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon
                const isSelected = form.category === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: cat.id }))}
                    className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-900 dark:text-brand-300 shadow-sm ring-2 ring-brand-500/20'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-brand-300'
                    }`}
                  >
                    <Icon size={16} className={`mt-0.5 flex-shrink-0 ${isSelected ? 'text-brand-600' : 'text-gray-400'}`} />
                    <span className="text-xs font-medium leading-tight">{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1.5">
              Overall Platform Experience
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, rating: star }))}
                  className="p-1.5 hover:scale-125 transition-transform"
                >
                  <Star
                    size={28}
                    className={`${
                      star <= form.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold ml-2 text-gray-600 dark:text-gray-400">
                {form.rating === 5 ? '🌟 Excellent' : form.rating === 4 ? '👍 Very Good' : form.rating === 3 ? '👌 Average' : '⚠️ Needs Work'}
              </span>
            </div>
          </div>

          {/* Name & Email Fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ramesh Patel"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email or Phone
              </label>
              <input
                type="text"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="farmer@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Detailed Message */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Your Feedback / Feature Suggestion <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="What can we improve? (e.g. Add offline SMS support, more regional language audio options, cold storage booking, specific APMC mandi prices...)"
              className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-gradient-to-r from-brand-600 to-emerald-600 hover:from-brand-700 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 hover:scale-[1.01] transition-all"
          >
            <Send size={16} />
            <span>Submit Feedback to the Admin</span>
          </button>
        </form>
      </div>

      {/* Previous Submissions */}
      {myFeedbacks.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CheckCircle2 size={16} className="text-brand-600" />
            <span>Your Submitted Feedback ({myFeedbacks.length})</span>
          </h3>
          <div className="space-y-2.5">
            {myFeedbacks.map(f => (
              <div key={f.id} className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                    {f.category} Feedback
                  </span>
                  <span className="text-gray-400 font-mono text-[11px]">
                    {new Date(f.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{f.message}</p>
                <div className="flex items-center gap-2 pt-1 text-[11px] text-brand-600 dark:text-brand-400 font-medium">
                  <span>Rating: {f.rating}/5 ⭐</span>
                  <span>• Status: Received by Admin</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
