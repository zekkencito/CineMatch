import { useState } from 'react'
import { Lock, Mail, AlertCircle } from 'lucide-react'
import './Login.css'
import api from '../services/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await api.login(email, password)
      if (data.token) {
        window.location.href = '/'
      }
    } catch (err) {
      setError('Credenciales inválidas o servidor no disponible')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="CineMatch" className="login-logo-img" />
        </div>

        {/* Título */}
        <div className="login-header">
          <h1>CineMatch</h1>
          <p>Panel de Administración</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form" autoComplete="off">
          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                type="email"
                name="login-email-cinematch"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                disabled={loading}
                autoComplete="off"
                data-form-type="other"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                type="password"
                name="login-pass-cinematch"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                autoComplete="new-password"
                data-form-type="other"
              />
            </div>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión →'}
          </button>
        </form>
      </div>
    </div>
  )
}
