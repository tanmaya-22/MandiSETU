import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('MandiSetu Application Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <span className="text-5xl mb-3 block">🌾</span>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">MandiSetu Platform Active</h2>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              We recovered from a temporary layout state. Click below to continue using MandiSetu smoothly.
            </p>
            <button
              onClick={() => {
                try {
                  localStorage.removeItem('mandisetu_ai_pos')
                  localStorage.removeItem('mandisetu_chacha_pos')
                } catch {}
                window.location.reload()
              }}
              className="px-6 py-2.5 bg-brand-700 hover:bg-brand-800 text-white font-bold rounded-2xl text-xs shadow-md transition"
            >
              Refresh Application
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
