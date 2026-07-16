import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Error boundary — show a readable message instead of a blank page if anything throws.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  componentDidCatch(error, info) {
    console.error('HalıStats error:', error, info)
  }
  render() {
    if (this.state.error) {
      return (
        <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col items-center justify-center gap-3 px-8 text-center">
          <div className="font-display text-[22px] font-extrabold text-white">
            Bir şeyler ters gitti
          </div>
          <div className="text-[13px] text-slate-400">{String(this.state.error?.message || this.state.error)}</div>
          <button
            onClick={() => location.reload()}
            className="mt-2 rounded-2xl bg-grass px-5 py-3 font-semibold text-field-bg"
          >
            Yeniden dene
          </button>
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
  </React.StrictMode>,
)
