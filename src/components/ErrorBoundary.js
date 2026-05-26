import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: '#0d1b2a',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: "'DM Sans', sans-serif",
          color: 'white', textAlign: 'center', padding: '40px'
        }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(229,57,53,0.15)', border: '1px solid rgba(229,57,53,0.3)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px', fontSize: '22px' }}>
            ⚠️
          </div>
          <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '500' }}>Something went wrong</h2>
          <p style={{ margin: '0 0 24px 0', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: '300' }}>
            An unexpected error occurred. Please refresh the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#2e86ab', color: 'white', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}
          >
            Refresh Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary