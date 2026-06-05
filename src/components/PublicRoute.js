import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

function PublicRoute({ children }) {
  const { token } = useAuth()
  if (token) return <Navigate to="/dashboard" />
  return <>{children}</>
}

export default PublicRoute