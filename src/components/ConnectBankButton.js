import { useState, useEffect } from 'react'
import api from '../services/api'

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

function ConnectBankButton({ redirectTo = '/dashboard' }) {
  const [linkToken, setLinkToken] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.post('/api/plaid/create-link-token')
      .then(res => {
        if (!cancelled) setLinkToken(res.data.link_token)
      })
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
        window.location.href = redirectTo + '?connected=true'
      },
      onExit: () => {}
    })
    handler.open()
  }

  return (
    <button
      onClick={handleClick}
      disabled={!ready}
      style={{ ...btnStyle, opacity: ready ? 1 : 0.6, cursor: ready ? 'pointer' : 'not-allowed' }}
      onMouseEnter={e => { if (ready) { e.target.style.background = 'rgba(46,134,171,0.25)'; e.target.style.borderColor = 'rgba(46,134,171,0.7)' }}}
      onMouseLeave={e => { e.target.style.background = 'rgba(46,134,171,0.15)'; e.target.style.borderColor = 'rgba(46,134,171,0.4)' }}
    >
      {ready ? '+ Connect Bank' : 'Loading...'}
    </button>
  )
}

export default ConnectBankButton