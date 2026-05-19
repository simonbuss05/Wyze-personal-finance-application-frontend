import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import useDashboard from '../hooks/useDashboard'
import EmptyState from '../components/EmptyState'
import api from '../services/api'

const font = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

function formatCategory(category) {
  if (!category) return ''
  return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

const fmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)

function SummaryCard({ label, value, accent }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 18px' }}>
      <p style={{ margin: '0 0 6px 0', fontSize: '12px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>{label}</p>
      <p style={{ margin: 0, fontSize: '22px', fontWeight: '400', color: accent || 'white', fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.5px' }}>{fmt(value)}</p>
    </div>
  )
}

export default function Dashboard() {
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

  useEffect(() => { if (initialAccounts) setLocalAccounts(initialAccounts) }, [initialAccounts])

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
        setTransactionData(prev => ({ ...prev, transactions: [...prev.transactions, ...response.data.transactions], hasMore: response.data.hasMore, currentPage: response.data.currentPage }))
      }
    } catch (err) { console.error(err) }
    finally { setTransactionLoading(false) }
  }

  useEffect(() => {
    fetchTransactions('', '', '', '', '', 0)
    api.get('/api/transactions/categories').then(res => setCategories(res.data))
  }, [])

  function handleFilterChange(s, c, a, f, t) {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => { setPage(0); fetchTransactions(s, c, a, f, t, 0) }, 500)
  }

  function handleSearchChange(val) { setSearch(val); handleFilterChange(val, categoryFilter, accountFilter, fromDate, toDate) }
  function handleCategoryChange(val) { setCategoryFilter(val); handleFilterChange(search, val, accountFilter, fromDate, toDate) }
  function handleAccountChange(val) { setAccountFilter(val); handleFilterChange(search, categoryFilter, val, fromDate, toDate) }
  function handleFromDateChange(val) { setFromDate(val); handleFilterChange(search, categoryFilter, accountFilter, val, toDate) }
  function handleToDateChange(val) { setToDate(val); handleFilterChange(search, categoryFilter, accountFilter, fromDate, val) }

  async function loadMore() { const n = page + 1; setPage(n); fetchTransactions(search, categoryFilter, accountFilter, fromDate, toDate, n) }

  async function saveNickname(accountId) {
    try {
      await api.patch(`/api/accounts/${accountId}/nickname`, { nickname: editingNickname })
      const updatedName = editingNickname.trim() === '' ? localAccounts.find(a => a.id === accountId)?.name : editingNickname.trim()
      const targetMask = localAccounts.find(a => a.id === accountId)?.mask
      setLocalAccounts(prev => prev.map(a => a.id === accountId ? { ...a, nickname: editingNickname.trim() === '' ? null : editingNickname.trim() } : a))
      if (transactionData?.transactions && targetMask) {
        setTransactionData(prev => ({ ...prev, transactions: prev.transactions.map(t => t.accountMask === targetMask ? { ...t, accountName: updatedName } : t) }))
      }
      setEditingAccountId(null); setEditingNickname('')
    } catch (err) { console.error(err) }
  }

  function handleLogout() { logout(); navigate('/login') }
  function clearFilters() { setSearch(''); setCategoryFilter(''); setAccountFilter(''); setFromDate(''); setToDate(''); setPage(0); fetchTransactions('', '', '', '', '', 0) }

  const baseStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0d1b2a', fontFamily: "'DM Sans', sans-serif", color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }

  if (loading) return <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '15px' }}><style>{font}</style>Loading...</div>
  if (error) return <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', color: '#ff6b6b', fontSize: '15px' }}><style>{font}</style>Error: {error}</div>

  if (!loading && (!localAccounts || localAccounts.length === 0)) {
    return (
      <div style={baseStyle}>
        <style>{font}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', letterSpacing: '-0.3px' }}>Wyze</span>
          <div style={{ display: 'flex', gap: '10px' }}>
  <button onClick={() => navigate('/analytics')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Analytics</button>
  <button onClick={() => navigate('/profile')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Profile</button>
  <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Logout</button>
</div>
        </div>
        <EmptyState />
      </div>
    )
  }

  const inputStyle = { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '13px', fontFamily: "'DM Sans', sans-serif", outline: 'none' }

  return (
    <>
      <style>{font}</style>
      <style>{`
        option { background: #0d1b2a; color: white; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
        .tx-row:hover { background: rgba(255,255,255,0.03) !important; }
      `}</style>

      {/* Nickname Modal */}
      {editingAccountId && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}
          onMouseDown={() => { modalDragRef.current = false }}
          onMouseMove={() => { modalDragRef.current = true }}
          onMouseUp={() => { if (!modalDragRef.current) setEditingAccountId(null) }}
        >
          <div style={{ background: '#0f2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', width: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
            onMouseDown={e => e.stopPropagation()} onMouseMove={e => e.stopPropagation()} onMouseUp={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', color: 'white', fontFamily: "'DM Serif Display', serif", fontWeight: '400' }}>Edit Nickname</h3>
            <p style={{ margin: '0 0 20px 0', color: 'rgba(255,255,255,0.4)', fontSize: '14px', fontWeight: '300' }}>Give this account a custom display name</p>
            <input value={editingNickname} onChange={e => setEditingNickname(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveNickname(editingAccountId)} autoFocus placeholder="Enter nickname..."
              style={{ ...inputStyle, width: '100%', marginBottom: '16px', padding: '12px 14px', fontSize: '14px', boxSizing: 'border-box' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setEditingAccountId(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
              <button onClick={() => saveNickname(editingAccountId)} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', background: '#2e86ab', color: 'white', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div style={baseStyle}>
        {/* Top bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0, background: 'rgba(255,255,255,0.02)' }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', letterSpacing: '-0.3px' }}>Wyze</span>
          <div style={{ display: 'flex', gap: '10px' }}>
  <button onClick={() => navigate('/analytics')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Analytics</button>
  <button onClick={() => navigate('/profile')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Profile</button>
  <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>Logout</button>
</div>
        </div>

        {/* Main layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* LEFT COLUMN */}
          <div style={{ width: '40%', flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', flexShrink: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <SummaryCard label="Net Worth" value={summary?.netWorth} accent={summary?.netWorth >= 0 ? '#7ecae3' : '#ff6b6b'} />
                <SummaryCard label="Total Assets" value={summary?.totalAssets} accent="#5bbf8a" />
                <SummaryCard label="Total Liabilities" value={summary?.totalLiabilities} accent="#ff8a7a" />
                <SummaryCard label="Monthly Spending" value={summary?.monthlySpending} />
              </div>
            </div>

            <div style={{ padding: '0 20px 10px 20px', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }}>Accounts</p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {localAccounts && localAccounts.map(account => (
                  <div key={account.id}
                    onClick={() => handleAccountChange(accountFilter === String(account.id) ? '' : String(account.id))}
                    style={{ background: accountFilter === String(account.id) ? 'rgba(46,134,171,0.12)' : 'rgba(255,255,255,0.03)', padding: '14px 16px', borderRadius: '10px', cursor: 'pointer', border: accountFilter === String(account.id) ? '1px solid rgba(46,134,171,0.4)' : '1px solid rgba(255,255,255,0.06)', transition: 'all 0.15s' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <p style={{ margin: '0 0 2px 0', fontWeight: '500', fontSize: '14px', color: 'white' }}>{account.nickname || account.name}</p>
                          <span onClick={e => { e.stopPropagation(); setEditingAccountId(account.id); setEditingNickname(account.nickname || account.name) }}
                            style={{ cursor: 'pointer', fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>✏️</span>
                        </div>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.35)', fontSize: '12px' }}>{account.institutionName}</p>
                      </div>
                      <span style={{ background: 'rgba(46,134,171,0.15)', border: '1px solid rgba(46,134,171,0.2)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', color: '#7ecae3', letterSpacing: '0.3px' }}>{account.subtype}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 2px 0', fontSize: '20px', fontWeight: '400', color: 'white', fontFamily: "'DM Serif Display', serif" }}>{fmt(account.currentBalance)}</p>
                        {account.availableBalance && <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{fmt(account.availableBalance)} available</p>}
                      </div>
                      <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>••••{account.mask}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <input type="text" placeholder="Search transactions..." value={search} onChange={e => handleSearchChange(e.target.value)}
                style={{ ...inputStyle, width: '100%', marginBottom: '10px', boxSizing: 'border-box', padding: '9px 14px', fontSize: '14px' }} />
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <select value={categoryFilter} onChange={e => handleCategoryChange(e.target.value)} style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}>
                  <option value="">All Categories</option>
                  {categories.map(cat => <option key={cat} value={cat}>{formatCategory(cat)}</option>)}
                </select>
                <select value={accountFilter} onChange={e => handleAccountChange(e.target.value)} style={{ ...inputStyle, flex: 1, cursor: 'pointer' }}>
                  <option value="">All Accounts</option>
                  {localAccounts && localAccounts.map(a => <option key={a.id} value={a.id}>{a.nickname || a.name} ••••{a.mask}</option>)}
                </select>
                <input type="date" value={fromDate} onChange={e => handleFromDateChange(e.target.value)} style={inputStyle} />
                <input type="date" value={toDate} onChange={e => handleToDateChange(e.target.value)} style={inputStyle} />
                <button onClick={clearFilters} style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap' }}>Clear</button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {transactionLoading && <div style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>Loading transactions...</div>}
              {!transactionLoading && transactionData?.transactions?.map(transaction => (
                <div key={transaction.id} className="tx-row"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                >
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '500', fontSize: '14px', color: 'white' }}>{transaction.merchantName || transaction.name}</p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>{formatCategory(transaction.category)} · {transaction.accountName} ••••{transaction.accountMask}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                    <p style={{ margin: '0 0 4px 0', fontWeight: '500', fontSize: '15px', color: transaction.amount > 0 ? '#ff8a7a' : '#5bbf8a', fontFamily: "'DM Serif Display', serif" }}>
                      {transaction.amount > 0 ? '-' : '+'}{fmt(Math.abs(transaction.amount))}
                    </p>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>{transaction.date}</p>
                  </div>
                </div>
              ))}
              {!transactionLoading && transactionData?.transactions?.length === 0 && (
                <div style={{ padding: '60px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No transactions found</div>
              )}
              {transactionData?.hasMore && (
                <div style={{ padding: '16px 20px' }}>
                  <button onClick={loadMore} style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>Load more</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}