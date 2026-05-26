import { useNavigate } from 'react-router-dom'

const font = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

const styles = `
  .landing-root {
    height: 100vh;
    width: 100vw;
    background: #0d1b2a;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
    position: fixed;
    top: 0;
    left: 0;
    overflow: hidden;
  }

  .landing-root::before {
    content: '';
    position: absolute;
    top: -200px;
    right: -100px;
    width: 700px;
    height: 700px;
    background: radial-gradient(circle, rgba(46,134,171,0.12) 0%, transparent 70%);
    pointer-events: none;
  }

  .landing-root::after {
    content: '';
    position: absolute;
    bottom: -200px;
    left: -100px;
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(46,134,171,0.07) 0%, transparent 70%);
    pointer-events: none;
  }
`

export default function Landing() {
  const navigate = useNavigate()

  return (
    <>
      <style>{font}</style>
      <style>{styles}</style>
      <div className="landing-root">

        {/* Nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 48px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', background: '#2e86ab', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 5L8 13L10 9L12 13L16 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 15H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'white', letterSpacing: '-0.3px' }}>Wyze</span>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/login')}
              style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif"}}
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#2e86ab', color: 'white', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}
            >
              Get started
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(46,134,171,0.12)', border: '1px solid rgba(46,134,171,0.25)', borderRadius: '20px', padding: '6px 14px', marginBottom: '32px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2e86ab' }} />
            <span style={{ fontSize: '13px', color: '#7ecae3', fontWeight: '400' }}>Powered by Plaid — bank-grade security</span>
          </div>

          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '64px', lineHeight: '1.05', color: 'white', margin: '0 0 24px 0', letterSpacing: '-2px', maxWidth: '700px' }}>
            Your money,<br />
            <em style={{ color: '#2e86ab', fontStyle: 'italic' }}>finally</em> in one place.
          </h1>

          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.45)', lineHeight: '1.6', maxWidth: '480px', margin: '0 0 48px 0', fontWeight: '300' }}>
            Connect all your bank accounts and get a clear picture of your finances — balances, spending trends, and insights in one dashboard.
          </p>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ padding: '14px 32px', borderRadius: '10px', border: 'none', background: '#2e86ab', color: 'white', cursor: 'pointer', fontSize: '15px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', letterSpacing: '0.2px' }}
            >
              Get started free
            </button>
            <button
              onClick={() => navigate('/login')}
              style={{ padding: '14px 32px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '15px', fontFamily: "'DM Sans', sans-serif" }}
            >
              Sign in
            </button>
          </div>

          {/* Feature pills */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '64px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Real-time sync', 'Multi-bank support', 'Spending analytics', 'Transaction search', '256-bit encryption'].map(feature => (
              <div key={feature} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                {feature}
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}