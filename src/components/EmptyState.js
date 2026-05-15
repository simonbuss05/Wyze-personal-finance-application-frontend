import ConnectBankButton from './ConnectBankButton'

export default function EmptyState() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '60px 20px',
      textAlign: 'center',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(46,134,171,0.08) 0%, transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{
        width: '72px',
        height: '72px',
        background: 'rgba(46,134,171,0.12)',
        border: '1px solid rgba(46,134,171,0.25)',
        borderRadius: '18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '28px',
        position: 'relative'
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <rect x="3" y="7" width="26" height="18" rx="3" stroke="#2e86ab" strokeWidth="1.5"/>
          <path d="M3 13H29" stroke="#2e86ab" strokeWidth="1.5"/>
          <path d="M9 19H13" stroke="#2e86ab" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M9 22H17" stroke="#2e86ab" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
        </svg>
      </div>

      <h2 style={{
        margin: '0 0 10px 0',
        fontSize: '24px',
        fontWeight: '400',
        color: 'white',
        fontFamily: "'DM Serif Display', serif",
        letterSpacing: '-0.3px'
      }}>
        No accounts connected
      </h2>

      <p style={{
        margin: '0 0 36px 0',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.4)',
        lineHeight: '1.7',
        maxWidth: '320px',
        fontWeight: '300'
      }}>
        Connect your bank accounts to start tracking balances, transactions, and spending in one place.
      </p>

      <ConnectBankButton redirectTo="/dashboard" />

      <p style={{
        marginTop: '20px',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.3px'
      }}>
        Bank-grade security via Plaid
      </p>
    </div>
  )
}