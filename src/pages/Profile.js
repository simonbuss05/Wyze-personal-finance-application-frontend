import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConnectBankButton from '../components/ConnectBankButton'
import api from '../services/api'

const font = `@import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');`

export default function Profile() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search)
    return params.get('tab') || 'profile'
  })
  const [user, setUser] = useState(null)
  const [plaidItems, setPlaidItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [profileMessage, setProfileMessage] = useState(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordMessage, setPasswordMessage] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [disconnectItemId, setDisconnectItemId] = useState(null)
  const [disconnectItemName, setDisconnectItemName] = useState('')
  const [disconnectAccountCount, setDisconnectAccountCount] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, itemsRes] = await Promise.all([api.get('/api/user/me'), api.get('/api/plaid/items')])
        setUser(userRes.data)
        setEditFirstName(userRes.data.firstName)
        setEditLastName(userRes.data.lastName)
        setEditEmail(userRes.data.email)
        setPlaidItems(itemsRes.data)
      } catch (err) { console.error(err) }
      finally { setLoading(false) }
    }
    fetchData()
  }, [])

  async function handleProfileUpdate() {
    try {
      await api.patch('/api/user/profile', { firstName: editFirstName, lastName: editLastName, email: editEmail })
      setUser(prev => ({ ...prev, firstName: editFirstName, lastName: editLastName, email: editEmail }))
      setProfileMessage({ type: 'success', text: 'Profile updated successfully' })
      setTimeout(() => { setShowEditModal(false); setProfileMessage(null) }, 1500)
    } catch (err) { setProfileMessage({ type: 'error', text: err.response?.data || 'Failed to update profile' }) }
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) { setPasswordMessage({ type: 'error', text: 'New passwords do not match' }); return }
    if (newPassword.length < 6) { setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' }); return }
    try {
      await api.patch('/api/user/password', { currentPassword, newPassword })
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    } catch (err) { setPasswordMessage({ type: 'error', text: err.response?.data || 'Failed to change password' }) }
  }

  async function handleDisconnect(itemId) {
    try { await api.delete(`/api/plaid/items/${itemId}`); setPlaidItems(prev => prev.filter(item => item.id !== itemId)) }
    catch (err) { console.error(err) }
  }

  async function handleDeleteAccount() {
    try { await api.delete('/api/user'); logout(); navigate('/login') }
    catch (err) { console.error(err) }
  }

  const baseStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#0d1b2a', fontFamily: "'DM Sans', sans-serif", color: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden' }

  if (loading) return <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '15px' }}><style>{font}</style>Loading...</div>

  const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: '300', outline: 'none', marginBottom: '14px', boxSizing: 'border-box' }
  const labelStyle = { display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '500' }
  const sectionStyle = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', marginBottom: '14px' }
  const primaryBtn = { padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2e86ab', color: 'white', fontSize: '14px', fontFamily: "'DM Sans', sans-serif", fontWeight: '500', cursor: 'pointer' }
  const ghostBtn = { padding: '9px 18px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '14px', fontFamily: "'DM Sans', sans-serif" }

  const Modal = ({ children, borderColor = 'rgba(255,255,255,0.1)' }) => (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#0f2030', border: `1px solid ${borderColor}`, borderRadius: '16px', padding: '28px', width: '440px', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
        {children}
      </div>
    </div>
  )

  return (
    <>
      <style>{font}</style>
      <style>{`
        .profile-input::placeholder { color: rgba(255,255,255,0.2); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
      `}</style>

      {showEditModal && (
        <Modal>
          <h3 style={{ margin: '0 0 6px 0', fontSize: '22px', fontFamily: "'DM Serif Display', serif", fontWeight: '400' }}>Edit Profile</h3>
          <p style={{ margin: '0 0 24px 0', color: 'rgba(255,255,255,0.35)', fontSize: '14px', fontWeight: '300' }}>Update your personal information</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div><label style={labelStyle}>First Name</label><input className="profile-input" value={editFirstName} onChange={e => setEditFirstName(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Last Name</label><input className="profile-input" value={editLastName} onChange={e => setEditLastName(e.target.value)} style={inputStyle} /></div>
          </div>
          <label style={labelStyle}>Email</label>
          <input className="profile-input" type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inputStyle} />
          {profileMessage && <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: profileMessage.type === 'success' ? '#5bbf8a' : '#ff6b6b' }}>{profileMessage.text}</p>}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => { setShowEditModal(false); setProfileMessage(null) }} style={ghostBtn}>Cancel</button>
            <button onClick={handleProfileUpdate} style={primaryBtn}>Save Changes</button>
          </div>
        </Modal>
      )}

      {showDeleteModal && (
        <Modal borderColor="rgba(229,57,53,0.2)">
          <h3 style={{ margin: '0 0 8px 0', color: '#ff6b6b', fontFamily: "'DM Serif Display', serif", fontWeight: '400', fontSize: '22px' }}>Delete Account</h3>
          <p style={{ margin: '0 0 24px 0', color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: '1.6', fontWeight: '300' }}>This will permanently delete your Wyze account and all associated data including connected bank accounts and transaction history. This cannot be undone.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowDeleteModal(false)} style={ghostBtn}>Cancel</button>
            <button onClick={handleDeleteAccount} style={{ ...primaryBtn, background: '#e53935' }}>Delete My Account</button>
          </div>
        </Modal>
      )}

      {disconnectItemId && (
        <Modal borderColor="rgba(229,57,53,0.2)">
          <h3 style={{ margin: '0 0 8px 0', color: '#ff6b6b', fontFamily: "'DM Serif Display', serif", fontWeight: '400', fontSize: '22px' }}>Disconnect {disconnectItemName}</h3>
          <p style={{ margin: '0 0 24px 0', color: 'rgba(255,255,255,0.4)', fontSize: '14px', lineHeight: '1.6', fontWeight: '300' }}>
            This will remove <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{disconnectItemName}</strong> and all <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{disconnectAccountCount} account{disconnectAccountCount !== 1 ? 's' : ''}</strong> and their transaction history from Wyze. This cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setDisconnectItemId(null)} style={ghostBtn}>Cancel</button>
            <button onClick={async () => { await handleDisconnect(disconnectItemId); setDisconnectItemId(null) }} style={{ ...primaryBtn, background: '#e53935' }}>Disconnect</button>
          </div>
        </Modal>
      )}

      <div style={baseStyle}>
        {/* Top bar */}
        <div style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
          <button onClick={() => navigate('/dashboard')} style={ghostBtn}>← Back</button>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', letterSpacing: '-0.3px' }}>Profile</span>
        </div>

        {/* Main layout */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Sidebar */}
          <div style={{ width: '220px', background: 'rgba(255,255,255,0.01)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '20px 0', flexShrink: 0 }}>
            {[{ key: 'profile', label: 'Account Settings' }, { key: 'banks', label: 'Connected Banks' }].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{ display: 'block', width: '100%', padding: '12px 24px', border: 'none', background: activeTab === tab.key ? 'rgba(46,134,171,0.1)' : 'transparent', cursor: 'pointer', fontSize: '14px', textAlign: 'left', color: activeTab === tab.key ? '#7ecae3' : 'rgba(255,255,255,0.4)', fontWeight: activeTab === tab.key ? '500' : '300', borderLeft: activeTab === tab.key ? '2px solid #2e86ab' : '2px solid transparent', fontFamily: "'DM Sans', sans-serif" }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px' }}>
            <div style={{ maxWidth: '560px' }}>

              {activeTab === 'profile' && (
                <>
                  <div style={sectionStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div>
                        <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Personal Information</h2>
                        <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '300' }}>Your Wyze account details</p>
                      </div>
                      <button onClick={() => setShowEditModal(true)} style={ghostBtn}>✏️ Edit</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>First Name</p>
                        <p style={{ margin: 0, fontSize: '16px' }}>{user?.firstName}</p>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Last Name</p>
                        <p style={{ margin: 0, fontSize: '16px' }}>{user?.lastName}</p>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Email</p>
                        <p style={{ margin: 0, fontSize: '16px' }}>{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div style={sectionStyle}>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Change Password</h2>
                    <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '300' }}>Update your account password</p>
                    <label style={labelStyle}>Current Password</label>
                    <input className="profile-input" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="Enter current password" />
                    <label style={labelStyle}>New Password</label>
                    <input className="profile-input" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="Enter new password" />
                    <label style={labelStyle}>Confirm New Password</label>
                    <input className="profile-input" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="Confirm new password" />
                    {passwordMessage && <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: passwordMessage.type === 'success' ? '#5bbf8a' : '#ff6b6b' }}>{passwordMessage.text}</p>}
                    <button onClick={handlePasswordChange} style={primaryBtn}>Change Password</button>
                  </div>

                  <div style={{ ...sectionStyle, border: '1px solid rgba(229,57,53,0.15)', background: 'rgba(229,57,53,0.04)' }}>
                    <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500', color: '#ff6b6b' }}>Danger Zone</h2>
                    <p style={{ margin: '0 0 18px 0', fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '300', lineHeight: '1.6' }}>Permanently delete your account and all associated data. This action cannot be undone.</p>
                    <button onClick={() => setShowDeleteModal(true)} style={{ ...ghostBtn, border: '1px solid rgba(229,57,53,0.3)', color: '#ff6b6b' }}>Delete Account</button>
                  </div>
                </>
              )}

              {activeTab === 'banks' && (
                <>
                  <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '500' }}>Connected Banks</h2>
                      <p style={{ margin: 0, fontSize: '13px', color: 'rgba(255,255,255,0.3)', fontWeight: '300' }}>{plaidItems.length} institution{plaidItems.length !== 1 ? 's' : ''} connected</p>
                    </div>
                    <ConnectBankButton />
                  </div>

                  {plaidItems.length === 0 && (
                    <div style={{ ...sectionStyle, textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.25)', fontSize: '15px', fontWeight: '300' }}>No banks connected yet</div>
                  )}

                  {plaidItems.map(item => (
                    <div key={item.id} style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontWeight: '500', fontSize: '16px' }}>{item.institutionName}</p>
                        <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: 'rgba(255,255,255,0.35)', fontWeight: '300' }}>{item.accountCount} account{item.accountCount !== 1 ? 's' : ''} connected</p>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.2)' }}>Connected {new Date(item.createdAt).toLocaleDateString()}</p>
                      </div>
                      <button onClick={() => { setDisconnectItemId(item.id); setDisconnectItemName(item.institutionName); setDisconnectAccountCount(item.accountCount) }}
                        style={{ ...ghostBtn, border: '1px solid rgba(229,57,53,0.3)', color: '#ff8a7a', fontSize: '13px' }}>Disconnect</button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}