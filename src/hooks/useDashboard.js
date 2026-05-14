import { useState, useEffect } from 'react'
import api from '../services/api'

function useDashboard() {
  const [summary, setSummary] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [summaryRes, accountsRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/accounts')
        ])
        setSummary(summaryRes.data)
        setAccounts(accountsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return { summary, accounts, loading, error }
}

export default useDashboard