import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)

    const { login } = useAuth()
    const navigate = useNavigate()

    async function handleLogin() {
        try {
            const response = await api.post('/api/auth/login', {
                email: email,
                password: password
            })
            login(response.data.token)
            navigate('/dashboard')
        } catch (error) {
            setError('Invalid email or password')
        }
    }
    return (
        <div>
            <h1>Welcome back</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button onClick={handleLogin}>
                Log In
            </button>

            <p>
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    )
}

export default Login