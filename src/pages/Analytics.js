import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../services/api'

const font = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

const COLORS = ['#2e86ab', '#5bbf8a', '#ff8a7a', '#f4a261', '#7ecae3', '#c77dff', '#ffb703', '#4cc9f0', '#e76f51', '#a8dadc']

function formatCategory(category) {
  if (!category) return ''
  const smallWords = ['and', 'or', 'the', 'of', 'in', 'at', 'for']
  return category
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map((word, i) => i === 0 || !smallWords.includes(word) ? word.charAt(0).toUpperCase() + word.slice(1) : word)
    .join(' ')
}

function groupCategories(data) {
  if (!data || data.length === 0) return []
  const total = data.reduce((sum, item) => sum + item.total, 0)
  const main = data.filter(item => (item.total / total) >= 0.03)
  const other = data.filter(item => (item.total / total) < 0.03)
  if (other.length === 0) return main
  const otherTotal = other.reduce((sum, item) => sum + item.total, 0)
  return [...main, { category: 'OTHER', name: 'Other', total: Math.round(otherTotal * 100) / 100 }]
}

const fmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)

function getRangeSubtitle(data) {
  if (!data || data.length === 0) return 'No data available'
  if (data.length === 1) return data[0].month
  return `${data[0].month} — ${data[data.length - 1].month}`
}

export default function Analytics() {
  const navigate = useNavigate()
  const [monthlySpending, setMonthlySpending] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [barLoading, setBarLoading] = useState(false)
  const [pieLoading, setPieLoading] = useState(false)
  const [error, setError] = useState(null)
  const [barRange, setBarRange] = useState(12)
  const [pieRange, setPieRange] = useState(1)

  useEffect(() => {
    async function fetchData() {
      try {
        const [monthlyRes, categoryRes, insightsRes] = await Promise.all([
          api.get(`/api/analytics/monthly-spending?months=${barRange}`),
          api.get(`/api/analytics/category-breakdown?months=${pieRange}`),
          api.get('/api/analytics/insights')
        ])
        setMonthlySpending(monthlyRes.data)
        setCategoryBreakdown(groupCategories(categoryRes.data.map(item => ({
          ...item,
          name: formatCategory(item.category)
        }))))
        setInsights(insightsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return
    setBarLoading(true)
    api.get(`/api/analytics/monthly-spending?months=${barRange}`)
      .then(res => setMonthlySpending(res.data))
      .catch(err => console.error(err))
      .finally(() => setBarLoading(false))
  }, [barRange]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (loading) return
    setPieLoading(true)
    api.get(`/api/analytics/category-breakdown?months=${pieRange}`)
      .then(res => setCategoryBreakdown(groupCategories(res.data.map(item => ({
        ...item,
        name: formatCategory(item.category)
      })))))
      .catch(err => console.error(err))
      .finally(() => setPieLoading(false))
  }, [pieRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const baseStyle = {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: '#0d1b2a', fontFamily: "'DM Sans', sans-serif",
    color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden'
  }

  if (loading) return <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '15px' }}><style>{font}</style>Loading...</div>
  if (error) return <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', color: '#ff6b6b', fontSize: '15px' }}><style>{font}</style>Error: {error}</div>

  const barSubtitle = barLoading ? 'Loading...' : getRangeSubtitle(monthlySpending)
  const barIsPartial = !barLoading && monthlySpending.length > 0 && monthlySpending.length < barRange

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0f2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{label}</p>
          <p style={{ margin: 0, fontSize: '15px', color: '#7ecae3', fontFamily: "'DM Serif Display', serif" }}>{fmt(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: '#0f2030', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '10px 14px' }}>
          <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{payload[0].name}</p>
          <p style={{ margin: 0, fontSize: '15px', color: '#7ecae3', fontFamily: "'DM Serif Display', serif" }}>{fmt(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  const sectionStyle = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column'
  }

  const selectStyle = {
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    cursor: 'pointer',
    flexShrink: 0
  }

  const renderLegend = (props) => {
    const { payload } = props
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: '12px' }}>
        {payload.map((entry, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <>
      <style>{font}</style>
      <style>{`
        option { background: #0d1b2a; color: white; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      <div style={baseStyle}>

        {/* Top bar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }}>← Back</button>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', letterSpacing: '-0.3px' }}>Analytics</span>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Charts row */}
          <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>

            {/* Bar chart */}
            <div style={{ ...sectionStyle, flex: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexShrink: 0 }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Monthly Spending</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: barIsPartial ? 'rgba(255,184,0,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: '300' }}>
                    {barSubtitle}
                  </p>
                </div>
                <select value={barRange} onChange={e => setBarRange(Number(e.target.value))} style={selectStyle}>
                  <option value={1}>This month</option>
                  <option value={3}>Last 3 months</option>
                  <option value={6}>Last 6 months</option>
                  <option value={12}>Last 12 months</option>
                </select>
              </div>

              <div style={{ flex: 1, minHeight: 0 }}>
                {barLoading ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>Loading...</div>
                ) : monthlySpending.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No data available for this period</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlySpending} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                      <Bar dataKey="total" fill="#2e86ab" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Pie chart */}
            <div style={{ ...sectionStyle, flex: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', flexShrink: 0 }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Spending by Category</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '300' }}>
                    {pieRange === 1 ? 'This month' : `Last ${pieRange} months`}
                  </p>
                </div>
                <select value={pieRange} onChange={e => setPieRange(Number(e.target.value))} style={selectStyle}>
                  <option value={1}>This month</option>
                  <option value={3}>Last 3 months</option>
                  <option value={6}>Last 6 months</option>
                  <option value={12}>Last 12 months</option>
                </select>
              </div>

              <div style={{ flex: 1, minHeight: 0 }}>
                {pieLoading ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>Loading...</div>
                ) : categoryBreakdown.length === 0 ? (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No data available</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        dataKey="total"
                        nameKey="name"
                        cx="50%"
                        cy="49%"
                        outerRadius="100%"
                        paddingAngle={2}
                      >
                        {categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                      <Legend content={renderLegend} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Insights panel */}
          <div style={{ ...sectionStyle, flexShrink: 0 }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Insights</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '300' }}>Auto-generated observations about your finances</p>
            {insights.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px', margin: 0 }}>No insights available yet — connect more accounts and transactions to generate insights.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {insights.map((insight, index) => (
                  <div key={index} style={{ background: 'rgba(46,134,171,0.08)', border: '1px solid rgba(46,134,171,0.15)', borderRadius: '10px', padding: '16px 18px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.6', fontWeight: '300' }}>{insight}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  )
}