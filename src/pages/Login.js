import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');

  .wyze-auth-root {
    height: 100vh;
    width: 100vw;
    background: #0d1b2a;
    display: flex;
    font-family: 'DM Sans', sans-serif;
    overflow: hidden;
  }

  .wyze-auth-root::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -200px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(46,134,171,0.15) 0%, transparent 70%);
    pointer-events: none;
  }

  .wyze-auth-root::after {
    content: '';
    position: absolute;
    bottom: -150px;
    left: -150px;
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(46,134,171,0.08) 0%, transparent 70%);
    pointer-events: none;
  }

  .wyze-left-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 80px;
    position: relative;
    z-index: 1;
    overflow: hidden;
  }

  .wyze-right-panel {
    width: 480px;
    flex-shrink: 0;
    background: rgba(255,255,255,0.03);
    border-left: 1px solid rgba(255,255,255,0.06);
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 56px;
    position: relative;
    z-index: 1;
    backdrop-filter: blur(10px);
    overflow-y: auto;
  }

  .wyze-logo-mark {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 64px;
  }

  .wyze-logo-icon {
    width: 36px;
    height: 36px;
    background: #2e86ab;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .wyze-logo-text {
    font-family: 'DM Serif Display', serif;
    font-size: 22px;
    color: white;
    letter-spacing: -0.3px;
  }

  .wyze-hero-headline {
    font-family: 'DM Serif Display', serif;
    font-size: 52px;
    line-height: 1.1;
    color: white;
    margin: 0 0 24px 0;
    letter-spacing: -1px;
  }

  .wyze-hero-headline em {
    color: #2e86ab;
    font-style: italic;
  }

  .wyze-hero-sub {
    font-size: 16px;
    color: rgba(255,255,255,0.45);
    line-height: 1.6;
    max-width: 380px;
    margin: 0;
    font-weight: 300;
  }

  .wyze-stats {
    display: flex;
    gap: 48px;
    margin-top: 64px;
  }

  .wyze-stat-num {
    font-family: 'DM Serif Display', serif;
    font-size: 28px;
    color: white;
    display: block;
  }

  .wyze-stat-label {
    font-size: 12px;
    color: rgba(255,255,255,0.35);
    text-transform: uppercase;
    letter-spacing: 1px;
    font-weight: 500;
  }

  .wyze-form-heading {
    font-family: 'DM Serif Display', serif;
    font-size: 30px;
    color: white;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }

  .wyze-form-sub {
    font-size: 14px;
    color: rgba(255,255,255,0.4);
    margin: 0 0 40px 0;
    font-weight: 300;
  }

  .wyze-field {
    margin-bottom: 20px;
  }

  .wyze-label {
    display: block;
    font-size: 12px;
    color: rgba(255,255,255,0.5);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    font-weight: 500;
  }

  .wyze-input {
    width: 100%;
    padding: 14px 16px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    color: white;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }

  .wyze-input:focus {
    border-color: #2e86ab;
    background: rgba(46,134,171,0.08);
  }

  .wyze-input::placeholder {
    color: rgba(255,255,255,0.2);
  }

  .wyze-submit {
    width: 100%;
    padding: 15px;
    background: #2e86ab;
    border: none;
    border-radius: 10px;
    color: white;
    font-size: 15px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    margin-top: 8px;
    transition: background 0.2s, transform 0.1s;
    letter-spacing: 0.2px;
  }

  .wyze-submit:hover {
    background: #267a9e;
  }

  .wyze-submit:active {
    transform: scale(0.99);
  }

  .wyze-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .wyze-error {
    background: rgba(229,57,53,0.1);
    border: 1px solid rgba(229,57,53,0.3);
    border-radius: 8px;
    padding: 12px 14px;
    color: #ff6b6b;
    font-size: 13px;
    margin-bottom: 20px;
  }

  .wyze-link-row {
    text-align: center;
    margin-top: 28px;
    font-size: 13px;
    color: rgba(255,255,255,0.35);
  }

  .wyze-link-row a {
    color: #2e86ab;
    text-decoration: none;
    font-weight: 500;
  }

  .wyze-link-row a:hover {
    text-decoration: underline;
  }

  .wyze-divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 32px 0;
  }
`

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await api.post('/api/auth/login', { email, password })
      login(response.data.token)
      navigate('/dashboard')
    } catch (err) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style>{styles}</style>
      <div className="wyze-auth-root" style={{ position: 'fixed', top: 0, left: 0 }}>
        <div className="wyze-left-panel">
          <div className="wyze-logo-mark">
            <div className="wyze-logo-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 5L8 13L10 9L12 13L16 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 15H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              </svg>
            </div>
            <span className="wyze-logo-text">Wyze</span>
          </div>
          <h1 className="wyze-hero-headline">
            Your money,<br />
            <em>finally</em> in<br />
            one place.
          </h1>
          <p className="wyze-hero-sub">
            Connect all your bank accounts and get a clear picture of your finances — balances, spending, and trends at a glance.
          </p>
          <div className="wyze-stats">
            <div>
              <span className="wyze-stat-num">256-bit</span>
              <span className="wyze-stat-label">Encryption</span>
            </div>
            <div>
              <span className="wyze-stat-num">Real-time</span>
              <span className="wyze-stat-label">Sync</span>
            </div>
            <div>
              <span className="wyze-stat-num">Bank-grade</span>
              <span className="wyze-stat-label">Security</span>
            </div>
          </div>
        </div>

        <div className="wyze-right-panel">
          <h2 className="wyze-form-heading">Welcome back</h2>
          <p className="wyze-form-sub">Sign in to your Wyze account</p>
          {error && <div className="wyze-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="wyze-field">
              <label className="wyze-label">Email</label>
              <input className="wyze-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="wyze-field">
              <label className="wyze-label">Password</label>
              <input className="wyze-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="wyze-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="wyze-divider" />
          <div className="wyze-link-row">
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </>
  )
}