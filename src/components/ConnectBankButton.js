import { useState, useEffect } from 'react'
import api from '../services/api'

const font = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

const btnStyle = {
  padding: '10px 20px',
  borderRadius: '8px',
  border: '1px solid rgba(46,134,171,0.4)',
  background: 'rgba(46,134,171,0.15)',
  color: '#7ecae3',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: "'DM Sans', sans-serif",
  fontWeight: '500',
  transition: 'all 0.2s',
  letterSpacing: '0.2px'
}

function ConnectBankButton({ redirectTo = '/profile?tab=banks' }) {
  const [linkToken, setLinkToken] = useState(null)
  const [ready, setReady] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pendingRedirect, setPendingRedirect] = useState(null)

  useEffect(() => {
    let cancelled = false
    api.post('/api/plaid/create-link-token')
      .then(res => { if (!cancelled) setLinkToken(res.data.link_token) })
      .catch(err => console.error(err))
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!linkToken) return
    setReady(true)
  }, [linkToken])

  function handleClick() {
    if (!linkToken) return
    const handler = window.Plaid.create({
      token: linkToken,
      onSuccess: async (publicToken) => {
        try {
          await api.post('/api/plaid/exchange-token', { publicToken })
        } catch (err) {
          console.error(err)
        }
        setPendingRedirect(redirectTo)
        setShowModal(true)
      },
      onExit: () => {}
    })
    handler.open()
  }

  function handleConfirm() {
    setShowModal(false)
    window.location.href = pendingRedirect
  }

  return (
    <>
      <style>{font}</style>

      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 2000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: '#0f2030',
            border: '1px solid rgba(46,134,171,0.25)',
            borderRadius: '16px',
            padding: '32px 28px',
            width: '420px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            textAlign: 'center',
            fontFamily: "'DM Sans', sans-serif"
          }}>
            <div style={{
              width: '52px', height: '52px',
              background: 'rgba(46,134,171,0.15)',
              border: '1px solid rgba(46,134,171,0.3)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '22px'
            }}>
              ✓
            </div>
            <h3 style={{
              margin: '0 0 10px 0',
              fontSize: '22px',
              color: 'white',
              fontFamily: "'DM Serif Display', serif",
              fontWeight: '400',
              letterSpacing: '-0.3px'
            }}>
              Account connected
            </h3>
            <p style={{
              margin: '0 0 28px 0',
              fontSize: '14px',
              color: 'rgba(255,255,255,0.45)',
              lineHeight: '1.6',
              fontWeight: '300'
            }}>
              Your account was successfully added. Please note that it may take up to 15 minutes for your transactions to sync for the first time.
            </p>
            <button
              onClick={handleConfirm}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: '#2e86ab',
                color: 'white',
                fontSize: '14px',
                fontFamily: "'DM Sans', sans-serif",
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <button
        onClick={handleClick}
        disabled={!ready}
        style={{ ...btnStyle, opacity: ready ? 1 : 0.6, cursor: ready ? 'pointer' : 'not-allowed' }}
        onMouseEnter={e => { if (ready) { e.target.style.background = 'rgba(46,134,171,0.25)'; e.target.style.borderColor = 'rgba(46,134,171,0.7)' }}}
        onMouseLeave={e => { e.target.style.background = 'rgba(46,134,171,0.15)'; e.target.style.borderColor = 'rgba(46,134,171,0.4)' }}
      >
        {ready ? '+ Connect Bank' : 'Loading...'}
      </button>
    </>
  )
}

export default ConnectBankButton