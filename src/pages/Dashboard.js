import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useDashboard from '../hooks/useDashboard'
import ConnectBankButton from '../components/ConnectBankButton'
import api from '../services/api'

function formatCategory(category) {
  if (!category) return ''
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
}

function Dashboard() {
  const { summary, accounts: initialAccounts, loading, error } = useDashboard()
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [localAccounts, setLocalAccounts] = useState(null)
  const [transactionData, setTransactionData] = useState(null)
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [accountFilter, setAccountFilter] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [transactionLoading, setTransactionLoading] = useState(true)
  const [categories, setCategories] = useState([])
  const [editingAccountId, setEditingAccountId] = useState(null)
  const [editingNickname, setEditingNickname] = useState('')

  const debounceTimer = useRef(null)
  const modalDragRef = useRef(false)

  useEffect(() => {
    if (initialAccounts) setLocalAccounts(initialAccounts)
  }, [initialAccounts])

  async function fetchTransactions(searchVal, category, account, from, to, pageNum) {
    try {
      let url = `/api/transactions?page=${pageNum}&size=20`
      if (searchVal) url += `&search=${searchVal}`
      if (category) url += `&category=${category}`
      if (account) url += `&accountId=${account}`
      if (from) url += `&from=${from}`
      if (to) url += `&to=${to}`
      const response = await api.get(url)
      if (pageNum === 0) {
        setTransactionData(response.data)
      } else {
        setTransactionData(prev => ({
          ...prev,
          transactions: [...prev.transactions, ...response.data.transactions],
          hasMore: response.data.hasMore,
          currentPage: response.data.currentPage
        }))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTransactionLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions('', '', '', '', '', 0)
    api.get('/api/transactions/categories').then(res => setCategories(res.data))
  }, [])

  function handleFilterChange(searchVal, category, account, from, to) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      setPage(0)
      fetchTransactions(searchVal, category, account, from, to, 0)
    }, 500)
  }

  function handleSearchChange(val) {
    setSearch(val)
    handleFilterChange(val, categoryFilter, accountFilter, fromDate, toDate)
  }

  function handleCategoryChange(val) {
    setCategoryFilter(val)
    handleFilterChange(search, val, accountFilter, fromDate, toDate)
  }

  function handleAccountChange(val) {
    setAccountFilter(val)
    handleFilterChange(search, categoryFilter, val, fromDate, toDate)
  }

  function handleFromDateChange(val) {
    setFromDate(val)
    handleFilterChange(search, categoryFilter, accountFilter, val, toDate)
  }

  function handleToDateChange(val) {
    setToDate(val)
    handleFilterChange(search, categoryFilter, accountFilter, fromDate, val)
  }

  async function loadMore() {
    const nextPage = page + 1
    setPage(nextPage)
    fetchTransactions(search, categoryFilter, accountFilter, fromDate, toDate, nextPage)
  }

  async function saveNickname(accountId) {
  try {
    await api.patch(`/api/accounts/${accountId}/nickname`, { nickname: editingNickname })
    
    const updatedName = editingNickname.trim() === ''
      ? localAccounts.find(a => a.id === accountId)?.name
      : editingNickname.trim()

    const targetMask = localAccounts.find(a => a.id === accountId)?.mask

    setLocalAccounts(prev => prev.map(account =>
      account.id === accountId
        ? { ...account, nickname: editingNickname.trim() === '' ? null : editingNickname.trim() }
        : account
    ))

    if (transactionData && transactionData.transactions && targetMask) {
      setTransactionData(prev => ({
        ...prev,
        transactions: prev.transactions.map(t =>
          t.accountMask === targetMask
            ? { ...t, accountName: updatedName }
            : t
        )
      }))
    }

    setEditingAccountId(null)
    setEditingNickname('')
  } catch (err) {
    console.error(err)
  }
}

  function handleLogout() {
    logout()
    navigate('/login')
  }

  function clearFilters() {
    setSearch('')
    setCategoryFilter('')
    setAccountFilter('')
    setFromDate('')
    setToDate('')
    setPage(0)
    fetchTransactions('', '', '', '', '', 0)
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>
  if (error) return <div style={{ padding: '20px' }}>Error: {error}</div>

  const fmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', overflow: 'hidden' }}>

      {/* Nickname Modal */}
      {editingAccountId && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onMouseDown={() => { modalDragRef.current = false }}
          onMouseMove={() => { modalDragRef.current = true }}
          onMouseUp={() => { if (!modalDragRef.current) setEditingAccountId(null) }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '28px',
              width: '360px',
              boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
            }}
            onMouseDown={e => e.stopPropagation()}
            onMouseMove={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px' }}>Edit Nickname</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '13px' }}>
              Give this account a custom display name
            </p>
            <input
              value={editingNickname}
              onChange={e => setEditingNickname(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveNickname(editingAccountId)}
              autoFocus
              placeholder="Enter nickname..."
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditingAccountId(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={() => saveNickname(editingAccountId)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#4a90d9', color: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>Wyze</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <ConnectBankButton />
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer', background: 'white', fontSize: '14px' }}>Logout</button>
        </div>
      </div>

      {/* Main two column layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* LEFT COLUMN */}
        <div style={{ width: '40%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e0e0e0', overflow: 'hidden' }}>

          {/* Summary cards 2x2 */}
          <div style={{ padding: '20px', flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f5f5f5', padding: '14px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px' }}>Net Worth</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{fmt(summary?.netWorth)}</p>
              </div>
              <div style={{ background: '#f5f5f5', padding: '14px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px' }}>Total Assets</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{fmt(summary?.totalAssets)}</p>
              </div>
              <div style={{ background: '#f5f5f5', padding: '14px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px' }}>Total Liabilities</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{fmt(summary?.totalLiabilities)}</p>
              </div>
              <div style={{ background: '#f5f5f5', padding: '14px', borderRadius: '8px' }}>
                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '12px' }}>Monthly Spending</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{fmt(summary?.monthlySpending)}</p>
              </div>
            </div>
          </div>

          {/* Accounts header */}
          <div style={{ padding: '0 20px 8px 20px', flexShrink: 0 }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', fontSize: '15px' }}>Accounts</p>
          </div>

          {/* Accounts scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {localAccounts && localAccounts.map(account => (
                <div
                  key={account.id}
                  onClick={() => handleAccountChange(accountFilter === String(account.id) ? '' : String(account.id))}
                  style={{
                    background: accountFilter === String(account.id) ? '#e8f0fe' : '#f5f5f5',
                    padding: '14px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: accountFilter === String(account.id) ? '1px solid #4a90d9' : '1px solid transparent',
                    transition: 'all 0.15s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <p style={{ margin: '0 0 2px 0', fontWeight: 'bold', fontSize: '14px' }}>
                          {account.nickname || account.name}
                        </p>
                        <span
                          onClick={e => {
                            e.stopPropagation()
                            setEditingAccountId(account.id)
                            setEditingNickname(account.nickname || account.name)
                          }}
                          style={{ cursor: 'pointer', fontSize: '12px', color: '#999' }}
                        >✏️</span>
                      </div>
                      <p style={{ margin: 0, color: '#666', fontSize: '12px' }}>{account.institutionName}</p>
                    </div>
                    <span style={{ background: '#e0e0e0', padding: '3px 7px', borderRadius: '4px', fontSize: '11px' }}>
                      {account.subtype}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: 'bold' }}>
                        {fmt(account.currentBalance)}
                      </p>
                      {account.availableBalance && (
                        <p style={{ margin: 0, color: '#666', fontSize: '11px' }}>
                          {fmt(account.availableBalance)} available
                        </p>
                      )}
                    </div>
                    <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>••••{account.mask}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — Transactions */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Filter bar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #e0e0e0', flexShrink: 0 }}>
            <input
              type="text"
              placeholder="Search transactions..."
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', marginBottom: '10px', boxSizing: 'border-box' }}
            />
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={categoryFilter}
                onChange={e => handleCategoryChange(e.target.value)}
                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', flex: 1 }}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{formatCategory(cat)}</option>
                ))}
              </select>
              <select
                value={accountFilter}
                onChange={e => handleAccountChange(e.target.value)}
                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', flex: 1 }}
              >
                <option value="">All Accounts</option>
                {localAccounts && localAccounts.map(account => (
                  <option key={account.id} value={account.id}>{account.nickname || account.name} ••••{account.mask}</option>
                ))}
              </select>
              <input
                type="date"
                value={fromDate}
                onChange={e => handleFromDateChange(e.target.value)}
                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }}
              />
              <input
                type="date"
                value={toDate}
                onChange={e => handleToDateChange(e.target.value)}
                style={{ padding: '7px 8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px' }}
              />
              <button
                onClick={clearFilters}
                style={{ padding: '7px 12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', cursor: 'pointer', background: 'white', whiteSpace: 'nowrap' }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Scrollable transaction list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {transactionLoading && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: '14px' }}>
                Loading transactions...
              </div>
            )}
            {!transactionLoading && transactionData && transactionData.transactions && transactionData.transactions.map(transaction => (
              <div key={transaction.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 20px',
                borderBottom: '1px solid #f0f0f0'
              }}>
                <div>
                  <p style={{ margin: '0 0 3px 0', fontWeight: '500', fontSize: '14px' }}>
                    {transaction.merchantName || transaction.name}
                  </p>
                  <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>
                    {formatCategory(transaction.category)} • {transaction.accountName} ••••{transaction.accountMask}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{
                    margin: '0 0 3px 0',
                    fontWeight: '500',
                    fontSize: '14px',
                    color: transaction.amount > 0 ? '#e53935' : '#43a047'
                  }}>
                    {transaction.amount > 0 ? '-' : '+'}{fmt(Math.abs(transaction.amount))}
                  </p>
                  <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>{transaction.date}</p>
                </div>
              </div>
            ))}
            {!transactionLoading && transactionData && transactionData.transactions && transactionData.transactions.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                No transactions found
              </div>
            )}
            {transactionData && transactionData.hasMore && (
              <div style={{ padding: '16px 20px' }}>
                <button
                  onClick={loadMore}
                  style={{
                    padding: '10px',
                    width: '100%',
                    background: '#f5f5f5',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '13px'
                  }}>
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard