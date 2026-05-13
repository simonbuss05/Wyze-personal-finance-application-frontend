import { useState, useEffect } from 'react'
import api from '../services/api'

function useDashboard() {
  const [summary, setSummary] = useState(null)
  const [accounts, setAccounts] = useState(null)
  const [transactions, setTransactions] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [summaryRes, accountsRes, transactionsRes] = await Promise.all([
          api.get('/api/dashboard/summary'),
          api.get('/api/accounts'),
          api.get('/api/transactions?page=0&size=20')
        ])
        setSummary(summaryRes.data)
        setAccounts(accountsRes.data)
        setTransactions(transactionsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return { summary, accounts, transactions, loading, error }
}

export default useDashboard

