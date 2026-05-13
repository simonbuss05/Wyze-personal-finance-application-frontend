import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useDashboard from '../hooks/useDashboard'
import ConnectBankButton from '../components/ConnectBankButton'
import api from '../services/api'

function Dashboard() {
  const { summary, accounts, transactions: initialTransactions, loading, error } = useDashboard()
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [page, setPage] = useState(0)
  const [transactionData, setTransactionData] = useState(null)

  useEffect(() => {
    if (initialTransactions) {
      setTransactionData(initialTransactions)
    }
  }, [initialTransactions])

  function handleLogout() {
    logout()
    navigate('/login')
  }

  async function loadMore() {
    const nextPage = page + 1
    const response = await api.get(`/api/transactions?page=${nextPage}&size=20`)
    setTransactionData(prev => ({
      ...prev,
      transactions: [...prev.transactions, ...response.data.transactions],
      hasMore: response.data.hasMore,
      currentPage: response.data.currentPage
    }))
    setPage(nextPage)
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>Wyze</h1>
        <div>
          <ConnectBankButton />
          <button onClick={handleLogout} style={{ marginLeft: '10px' }}>Logout</button>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '30px' }}>
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Net Worth</p>
          <h2 style={{ margin: 0 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary?.netWorth || 0)}</h2>
        </div>
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Total Assets</p>
          <h2 style={{ margin: 0 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary?.totalAssets || 0)}</h2>
        </div>
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Total Liabilities</p>
          <h2 style={{ margin: 0 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary?.totalLiabilities || 0)}</h2>
        </div>
        <div style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
          <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>Monthly Spending</p>
          <h2 style={{ margin: 0 }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(summary?.monthlySpending || 0)}</h2>
        </div>
      </div>

      {/* Accounts */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ marginBottom: '16px' }}>Accounts</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {accounts && accounts.map(account => (
            <div key={account.id} style={{ background: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{account.name}</p>
                  <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>{account.institutionName}</p>
                </div>
                <span style={{ background: '#e0e0e0', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  {account.subtype}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ margin: '0 0 2px 0', fontSize: '20px', fontWeight: 'bold' }}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.currentBalance || 0)}
                  </p>
                  {account.availableBalance && (
                    <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(account.availableBalance)} available
                    </p>
                  )}
                </div>
                <p style={{ margin: 0, color: '#999', fontSize: '13px' }}>••••{account.mask}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div>
        <h2 style={{ marginBottom: '16px' }}>Recent Transactions</h2>
        <div style={{ background: '#f5f5f5', borderRadius: '8px', overflow: 'hidden' }}>
          {transactionData && transactionData.transactions && transactionData.transactions.map(transaction => (
            <div key={transaction.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid #e0e0e0',
              background: 'white'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>
                    {transaction.merchantName || transaction.name}
                  </p>
                  <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>
                    {transaction.category} • {transaction.accountName} ••••{transaction.accountMask}
                  </p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  margin: '0 0 4px 0',
                  fontWeight: '500',
                  color: transaction.amount > 0 ? '#e53935' : '#43a047'
                }}>
                  {transaction.amount > 0 ? '-' : '+'}
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Math.abs(transaction.amount))}
                </p>
                <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>{transaction.date}</p>
              </div>
            </div>
          ))}
        </div>

        {transactionData && transactionData.hasMore && (
          <button
            onClick={loadMore}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              width: '100%',
              background: '#f5f5f5',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
            Load More
          </button>
        )}
      </div>

    </div>
  )
}

export default Dashboard