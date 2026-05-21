import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../services/api'

const font = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

const COLORS = ['#2e86ab', '#5bbf8a', '#ff8a7a', '#f4a261', '#7ecae3', '#c77dff', '#ffb703', '#4cc9f0']

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

const fmt = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val || 0)

export default function Analytics() {
  const navigate = useNavigate()
  const [monthlySpending, setMonthlySpending] = useState([])
  const [categoryBreakdown, setCategoryBreakdown] = useState([])
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(false)
  const [error, setError] = useState(null)
  const [monthRange, setMonthRange] = useState(12)

  // Initial load — fetch everything
  useEffect(() => {
    async function fetchData() {
      try {
        const [monthlyRes, categoryRes, insightsRes] = await Promise.all([
          api.get(`/api/analytics/monthly-spending?months=${monthRange}`),
          api.get('/api/analytics/category-breakdown'),
          api.get('/api/analytics/insights')
        ])
        setMonthlySpending(monthlyRes.data)
        setCategoryBreakdown(categoryRes.data.map(item => ({
          ...item,
          name: formatCategory(item.category)
        })))
        setInsights(insightsRes.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch only monthly spending when range changes
  useEffect(() => {
    if (loading) return
    setChartLoading(true)
    api.get(`/api/analytics/monthly-spending?months=${monthRange}`)
      .then(res => setMonthlySpending(res.data))
      .catch(err => console.error(err))
      .finally(() => setChartLoading(false))
  }, [monthRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const baseStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0d1b2a', fontFamily: "'DM Sans', sans-serif", color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }

  if (loading) return <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '15px' }}><style>{font}</style>Loading...</div>
  if (error) return <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', color: '#ff6b6b', fontSize: '15px' }}><style>{font}</style>Error: {error}</div>

  // Figure out what label to show based on actual data vs requested range
  const actualMonths = monthlySpending.length
  const rangeLabel = () => {
    if (actualMonths === 0) return 'No data available'
    if (actualMonths < monthRange) return `Showing ${actualMonths} month${actualMonths !== 1 ? 's' : ''} of available data`
    if (monthRange === 1) return 'This month'
    return `Last ${actualMonths} month${actualMonths !== 1 ? 's' : ''}`
  }

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

  const sectionStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }

  const selectStyle = {
    padding: '7px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.05)',
    color: 'white',
    fontSize: '13px',
    fontFamily: "'DM Sans', sans-serif",
    outline: 'none',
    cursor: 'pointer'
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>

          {/* Charts row */}
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>

            {/* Bar chart — Monthly Spending */}
            <div style={{ ...sectionStyle, flex: 3 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Monthly Spending</h2>
                  <p style={{ margin: 0, fontSize: '13px', color: actualMonths < monthRange && actualMonths > 0 ? 'rgba(255,184,0,0.7)' : 'rgba(255,255,255,0.3)', fontWeight: '300' }}>
                    {rangeLabel()}
                  </p>
                </div>
                <select value={monthRange} onChange={e => setMonthRange(Number(e.target.value))} style={selectStyle}>
                  <option value={1}>This month</option>
                  <option value={3}>Last 3 months</option>
                  <option value={6}>Last 6 months</option>
                  <option value={12}>Last 12 months</option>
                </select>
              </div>

              {chartLoading ? (
                <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>Loading...</div>
              ) : monthlySpending.length === 0 ? (
                <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No data available for this period</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
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

            {/* Pie chart — Category Breakdown */}
            <div style={{ ...sectionStyle, flex: 2 }}>
              <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Spending by Category</h2>
              <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '300' }}>This month</p>
              {categoryBreakdown.length === 0 ? (
                <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No data available</div>
              ) : (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={categoryBreakdown} dataKey="total" nameKey="name" cx="50%" cy="45%" outerRadius={90} paddingAngle={2}>
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Insights panel */}
          <div style={sectionStyle}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Insights</h2>
            <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '300' }}>Auto-generated observations about your finances</p>
            {insights.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '14px' }}>No insights available yet — connect more accounts and transactions to generate insights.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {insights.map((insight, index) => (
                  <div key={index} style={{ background: 'rgba(46,134,171,0.08)', border: '1px solid rgba(46,134,171,0.15)', borderRadius: '10px', padding: '16px 18px' }}>
                    <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.5', fontWeight: '300' }}>{insight}</p>
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