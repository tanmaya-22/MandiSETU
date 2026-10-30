import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('MandiSetu Application Error:', error, errorInfo)
    this.setState({ errorInfo })
  }

  handleReload() {
    // Clear any stale state that might re-trigger the error
    try {
      localStorage.clear()
      sessionStorage.clear()
    } catch {}
    this.setState({ hasError: false, error: null, errorInfo: null })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100 flex items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
            <span className="text-5xl mb-3 block">🌾</span>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1.5">MandiSetu Platform Active</h2>
            <p className="text-xs text-gray-500 mb-3 leading-relaxed">
              Click below to launch MandiSetu fresh with clean state.
            </p>
            {this.state.error && (
              <details className="mb-4 text-left">
                <summary className="text-xs text-red-500 cursor-pointer hover:underline">Technical details</summary>
                <pre className="text-[10px] text-red-400 mt-1 overflow-auto max-h-24 bg-red-50 p-2 rounded-lg">
                  {this.state.error?.message}
                </pre>
              </details>
            )}
            <button
              onClick={() => this.handleReload()}
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-2xl text-xs shadow-md transition"
            >
              Reset &amp; Open MandiSetu
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
