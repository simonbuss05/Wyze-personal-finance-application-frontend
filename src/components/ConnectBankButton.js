import { useState, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import api from '../services/api'
import * as PlaidLinkModule from 'react-plaid-link'
console.log(PlaidLinkModule)

function ConnectBankButton() {
  const [linkToken, setLinkToken] = useState(null)

  async function fetchLinkToken() {
    const response = await api.post('/api/plaid/create-link-token')
    setLinkToken(response.data.link_token)
  }

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: async (publicToken) => {
      await api.post('/api/plaid/exchange-token', { publicToken })
      window.location.href = '/dashboard'
    }
  })

  useEffect(() => {
    if (ready) {
      open()
    }
  }, [ready, open])

  return (
    <button onClick={fetchLinkToken}>
      Connect a Bank Account
    </button>
  )
}

export default ConnectBankButton