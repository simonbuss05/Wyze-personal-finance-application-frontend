import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ConnectBankButton from '../components/ConnectBankButton'
import api from '../services/api'

function Profile() {
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
        const [userRes, itemsRes] = await Promise.all([
          api.get('/api/user/me'),
          api.get('/api/plaid/items')
        ])
        setUser(userRes.data)
        setEditFirstName(userRes.data.firstName)
        setEditLastName(userRes.data.lastName)
        setEditEmail(userRes.data.email)
        setPlaidItems(itemsRes.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  async function handleProfileUpdate() {
    try {
      await api.patch('/api/user/profile', { firstName: editFirstName, lastName: editLastName, email: editEmail })
      setUser(prev => ({ ...prev, firstName: editFirstName, lastName: editLastName, email: editEmail }))
      setProfileMessage({ type: 'success', text: 'Profile updated successfully' })
      setTimeout(() => {
        setShowEditModal(false)
        setProfileMessage(null)
      }, 1500)
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.response?.data || 'Failed to update profile' })
    }
  }

  async function handlePasswordChange() {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters' })
      return
    }
    try {
      await api.patch('/api/user/password', { currentPassword, newPassword })
      setPasswordMessage({ type: 'success', text: 'Password changed successfully' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.response?.data || 'Failed to change password' })
    }
  }

  async function handleDisconnect(itemId) {
    try {
      await api.delete(`/api/plaid/items/${itemId}`)
      setPlaidItems(prev => prev.filter(item => item.id !== itemId))
    } catch (err) {
      console.error(err)
    }
  }

  async function handleDeleteAccount() {
    try {
      await api.delete('/api/user')
      logout()
      navigate('/login')
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return <div style={{ padding: '20px' }}>Loading...</div>

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    marginBottom: '12px',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#666',
    marginBottom: '4px'
  }

  const sectionStyle = {
    background: 'white',
    borderRadius: '10px',
    padding: '24px',
    marginBottom: '16px',
    border: '1px solid #e0e0e0'
  }

  const primaryButton = {
    padding: '10px 20px',
    borderRadius: '6px',
    border: 'none',
    background: '#4a90d9',
    color: 'white',
    fontSize: '14px',
    cursor: 'pointer'
  }

  const tabs = [
    { key: 'profile', label: 'Profile' },
    { key: 'banks', label: 'Connected Banks' }
  ]

  return (
    <div style={{ minHeight: '100vh', fontFamily: 'Arial, sans-serif', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '420px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '18px' }}>Edit Profile</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input value={editFirstName} onChange={e => setEditFirstName(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input value={editLastName} onChange={e => setEditLastName(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <label style={labelStyle}>Email</label>
            <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} style={inputStyle} />
            {profileMessage && (
              <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: profileMessage.type === 'success' ? '#43a047' : '#e53935' }}>
                {profileMessage.text}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowEditModal(false); setProfileMessage(null) }}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button onClick={handleProfileUpdate} style={primaryButton}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '400px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#e53935' }}>Delete Account</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
              This will permanently delete your Wyze account and all associated data including all connected bank accounts and transaction history. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#e53935', color: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disconnect confirmation modal */}
      {disconnectItemId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '28px', width: '400px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#e53935' }}>Disconnect {disconnectItemName}</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
              This will disconnect <strong>{disconnectItemName}</strong> and remove all <strong>{disconnectAccountCount} account{disconnectAccountCount !== 1 ? 's' : ''}</strong> and their associated transaction history from Wyze. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDisconnectItemId(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDisconnect(disconnectItemId)
                  setDisconnectItemId(null)
                }}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#e53935', color: 'white', cursor: 'pointer', fontSize: '14px' }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: '1px solid #e0e0e0', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '14px' }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0, fontSize: '20px' }}>Profile</h1>
      </div>

      {/* Main layout — sidebar + content */}
      <div style={{ display: 'flex', flex: 1 }}>

        {/* Sidebar */}
        <div style={{ width: '220px', background: 'white', borderRight: '1px solid #e0e0e0', padding: '20px 0', flexShrink: 0 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 24px',
                border: 'none',
                background: activeTab === tab.key ? '#f0f7ff' : 'none',
                cursor: 'pointer',
                fontSize: '14px',
                textAlign: 'left',
                color: activeTab === tab.key ? '#4a90d9' : '#444',
                fontWeight: activeTab === tab.key ? 'bold' : 'normal',
                borderLeft: activeTab === tab.key ? '3px solid #4a90d9' : '3px solid transparent'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <div style={{ maxWidth: '580px' }}>

            {activeTab === 'profile' && (
              <>
                {/* Personal info display */}
                <div style={sectionStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ margin: 0, fontSize: '16px' }}>Personal Information</h2>
                    <button
                      onClick={() => setShowEditModal(true)}
                      style={{ padding: '7px 14px', borderRadius: '6px', border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: '13px' }}
                    >
                      ✏️ Edit
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>First Name</p>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>{user?.firstName}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>Last Name</p>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>{user?.lastName}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#999' }}>Email</p>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '500' }}>{user?.email}</p>
                    </div>
                  </div>
                </div>

                {/* Change password */}
                <div style={sectionStyle}>
                  <h2 style={{ margin: '0 0 20px 0', fontSize: '16px' }}>Change Password</h2>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} placeholder="Enter current password" />
                  <label style={labelStyle}>New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} placeholder="Enter new password" />
                  <label style={labelStyle}>Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} placeholder="Confirm new password" />
                  {passwordMessage && (
                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: passwordMessage.type === 'success' ? '#43a047' : '#e53935' }}>
                      {passwordMessage.text}
                    </p>
                  )}
                  <button onClick={handlePasswordChange} style={primaryButton}>Change Password</button>
                </div>

                {/* Danger zone */}
                <div style={{ ...sectionStyle, border: '1px solid #ffcdd2', background: '#fff8f8' }}>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#e53935' }}>Danger Zone</h2>
                  <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#666' }}>
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #e53935', background: 'white', color: '#e53935', fontSize: '14px', cursor: 'pointer' }}
                  >
                    Delete Account
                  </button>
                </div>
              </>
            )}

            {activeTab === 'banks' && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <ConnectBankButton />
                </div>
                {plaidItems.length === 0 && (
                  <div style={{ ...sectionStyle, textAlign: 'center', color: '#999', padding: '40px' }}>
                    No connected banks. Click the button above to connect your first account.
                  </div>
                )}
                {plaidItems.map(item => (
                  <div key={item.id} style={{ ...sectionStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0 0 4px 0', fontWeight: 'bold', fontSize: '15px' }}>{item.institutionName}</p>
                      <p style={{ margin: '0 0 2px 0', fontSize: '13px', color: '#666' }}>
                        {item.accountCount} account{item.accountCount !== 1 ? 's' : ''} connected
                      </p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                        Connected {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDisconnectItemId(item.id)
                        setDisconnectItemName(item.institutionName)
                        setDisconnectAccountCount(item.accountCount)
                      }}
                      style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e53935', background: 'white', color: '#e53935', fontSize: '13px', cursor: 'pointer' }}
                    >
                      Disconnect
                    </button>
                  </div>
                ))}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile