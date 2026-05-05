import { useState, useEffect, useCallback } from 'react'
import { Send, Users, Heart, AlertCircle, CheckCircle, X } from 'lucide-react'
import './Email.css'
import Sidebar from './Sidebar'
import Header from './Header'
import api from '../services/api'

export default function Email() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)

  // Estado del formulario
  const [emailType, setEmailType] = useState('single') // 'single', 'bulk', 'premium', 'all'
  const [selectedUsers, setSelectedUsers] = useState([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedUserId, setSelectedUserId] = useState('')

  const menuItems = [
    { id: 1, label: 'Dashboard', icon: 'Film', path: '/dashboard' },
    { id: 3, label: 'Usuarios', icon: 'Heart', path: '/users' },
    { id: 4, label: 'Suscripciones', icon: 'CreditCard', path: '/subscriptions' },
    { id: 5, label: 'Correos', icon: 'Mail', path: '/emails', active: true },
  ];

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }, [])

  // Cargar usuarios
  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers(1, 1000)
      setUsers(data.data || data.users || [])
    } catch (error) {
      console.error('Error cargando usuarios:', error)
      showToast('Error al cargar usuarios', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSendEmail = async (e) => {
    e.preventDefault()

    if (!subject.trim()) {
      showToast('Por favor ingresa un asunto', 'error')
      return
    }

    if (!message.trim()) {
      showToast('Por favor ingresa un mensaje', 'error')
      return
    }

    if (emailType === 'single' && !selectedUserId) {
      showToast('Por favor selecciona un usuario', 'error')
      return
    }

    if (emailType === 'bulk' && selectedUsers.length === 0) {
      showToast('Por favor selecciona al menos un usuario', 'error')
      return
    }

    try {
      setSending(true)

      let result

      switch (emailType) {
        case 'single':
          result = await api.sendEmailToUser(
            parseInt(selectedUserId),
            subject,
            message
          )
          break

        case 'bulk':
          result = await api.sendBulkEmail(selectedUsers, subject, message)
          break

        case 'premium':
          result = await api.sendEmailToPremiumUsers(subject, message)
          break

        case 'all':
          result = await api.sendEmailToAllUsers(subject, message)
          break

        default:
          showToast('Tipo de correo inválido', 'error')
          return
      }

      showToast(
        `✅ ${result.message || 'Correo(s) enviado(s) exitosamente'}`,
        'success'
      )

      // Limpiar formulario
      setSubject('')
      setMessage('')
      setSelectedUsers([])
      setSelectedUserId('')
    } catch (error) {
      console.error('Error enviando correo:', error)
      showToast(error.message || 'Error al enviar correo', 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="email-container">
      <Sidebar sidebarOpen={sidebarOpen} menuItems={menuItems} />
      <div className="email-main">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Toast Notifications */}
        {toast && (
          <div className={`toast toast-${toast.type}`}>
            <div className="toast-content">
              {toast.type === 'success' ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="toast-close"
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div className="email-content">
          <h1>📧 Enviar Correos</h1>
          <p className="subtitle">Gestiona la comunicación con tus usuarios</p>

          <div className="email-section">
            <form onSubmit={handleSendEmail} className="email-form">
              {/* Tipo de correo */}
              <div className="form-group">
                <label>Tipo de Correo</label>
                <div className="email-type-options">
                  <button
                    type="button"
                    className={`option-btn ${emailType === 'single' ? 'active' : ''}`}
                    onClick={() => setEmailType('single')}
                  >
                    👤 Usuario Individual
                  </button>
                  <button
                    type="button"
                    className={`option-btn ${emailType === 'bulk' ? 'active' : ''}`}
                    onClick={() => setEmailType('bulk')}
                  >
                    👥 Múltiples Usuarios
                  </button>
                  <button
                    type="button"
                    className={`option-btn ${emailType === 'premium' ? 'active' : ''}`}
                    onClick={() => setEmailType('premium')}
                  >
                    💎 Usuarios Premium
                  </button>
                  <button
                    type="button"
                    className={`option-btn ${emailType === 'all' ? 'active' : ''}`}
                    onClick={() => setEmailType('all')}
                  >
                    📣 Todos los Usuarios
                  </button>
                </div>
              </div>

              {/* Seleccionar usuario individual */}
              {emailType === 'single' && (
                <div className="form-group">
                  <label>Selecciona un Usuario</label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="form-input"
                  >
                    <option value="">-- Selecciona un usuario --</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Seleccionar múltiples usuarios */}
              {emailType === 'bulk' && (
                <div className="form-group">
                  <label>
                    Selecciona Usuarios ({selectedUsers.length} seleccionado(s))
                  </label>
                  <div className="users-list">
                    {users.map(user => (
                      <div key={user.id} className="user-checkbox">
                        <input
                          type="checkbox"
                          id={`user-${user.id}`}
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserToggle(user.id)}
                        />
                        <label htmlFor={`user-${user.id}`}>
                          <span className="user-name">{user.name}</span>
                          <span className="user-email">{user.email}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Información para envío masivo */}
              {(emailType === 'premium' || emailType === 'all') && (
                <div className="info-box">
                  <AlertCircle size={18} />
                  <p>
                    {emailType === 'premium'
                      ? 'Se enviará a todos los usuarios con suscripción premium activa'
                      : 'Se enviará a TODOS los usuarios registrados en CineMatch'}
                  </p>
                </div>
              )}

              {/* Asunto */}
              <div className="form-group">
                <label htmlFor="subject">Asunto del Correo *</label>
                <input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="ej: Nueva funcionalidad disponible"
                  className="form-input"
                />
              </div>

              {/* Mensaje */}
              <div className="form-group">
                <label htmlFor="message">Mensaje *</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  rows="8"
                  className="form-textarea"
                />
                <small className="char-count">{message.length} caracteres</small>
              </div>

              {/* Botones */}
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={sending || (emailType === 'single' && !selectedUserId) || (emailType === 'bulk' && selectedUsers.length === 0) || !subject || !message}
                  className="btn-send"
                >
                  {sending ? (
                    <>
                      <span className="spinner"></span>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Enviar Correo
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSubject('')
                    setMessage('')
                    setSelectedUsers([])
                    setSelectedUserId('')
                  }}
                  className="btn-cancel"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          {/* Vista previa del correo */}
          <div className="email-section">
            <h2>📝 Vista Previa del Correo</h2>
            <div className="email-preview">
              <div className="preview-header">
                <div className="preview-from">
                  <strong>De:</strong> CineMatch Admin
                </div>
                <div className="preview-subject">
                  <strong>Asunto:</strong> {subject || '(sin asunto)'}
                </div>
              </div>
              <div className="preview-body">
                <p>Hola Usuario,</p>
                <div className="message-content">
                  {message ? message.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  )) : <p style={{ color: '#999' }}>(tu mensaje aparecerá aquí)</p>}
                </div>
                <p>Gracias por ser parte de CineMatch.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
