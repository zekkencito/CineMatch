import { useState, useEffect, useCallback } from 'react'
import { Trash2, Edit2, Plus, Search, X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import './Users.css'
import Sidebar from './Sidebar'
import Header from './Header'
import api from '../services/api'

export default function Users() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    age: '',
    bio: ''
  })
  const [loading, setLoading] = useState(true)

  // Toast notification state
  const [toast, setToast] = useState(null)
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmModal({ message, onConfirm })
  }, [])

  const menuItems = [
    { id: 1, label: 'Dashboard', icon: 'Film', path: '/' },
    { id: 3, label: 'Usuarios', icon: 'Heart', path: '/users', active: true },
    { id: 4, label: 'Suscripciones', icon: 'CreditCard', path: '/subscriptions' },
  ]

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers()
  }, [])

  // Buscar usuarios cuando cambia el término de búsqueda (con debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers()
    }, 300) // Esperar 300ms después de que se deje de escribir

    return () => clearTimeout(timer)
  }, [searchTerm])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers(1, 100, searchTerm)
      // Extraer usuarios del objeto data.data si viene con paginación
      const usersList = Array.isArray(data) ? data : (data.data || [])
      setUsers(usersList)
    } catch (error) {
      console.error('Error fetching users:', error)
      showToast('Error al cargar usuarios. Verifica la conexión con la base de datos.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Ya no necesitamos filtrar en cliente porque viene filtrado del servidor
  const filteredUsers = users

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({ name: '', email: '', age: '', bio: '' })
    setIsModalOpen(true)
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      age: user.age || '',
      bio: user.bio || ''
    })
    setIsModalOpen(true)
  }

  const handleDeleteUser = async (id) => {
    showConfirm('¿Estás seguro de que deseas eliminar este usuario?', async () => {
      try {
        await api.deleteUser(id)
        showToast('Usuario eliminado correctamente', 'success')
        fetchUsers()
      } catch (error) {
        console.error('Error deleting user:', error)
        showToast('Error al eliminar el usuario', 'error')
      }
    })
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email) {
      showToast('Por favor completa todos los campos requeridos', 'warning')
      return
    }

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, formData)
        showToast('Usuario actualizado correctamente', 'success')
      } else {
        await api.createUser(formData)
        showToast('Usuario creado correctamente', 'success')
      }
      
      setIsModalOpen(false)
      setFormData({ name: '', email: '', age: '', bio: '' })
      fetchUsers()
    } catch (error) {
      console.error('Error saving user:', error)
      showToast('Error al guardar el usuario', 'error')
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({ name: '', email: '', age: '', bio: '' })
  }

  const handleLogout = () => {
    window.location.href = '/login'
  }

  return (
    <div className="users-wrapper">
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        menuItems={menuItems}
      />

      {/* Main Content */}
      <div className="main-content">
        <Header 
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleLogout} 
        />

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h2>Gestión de Usuarios</h2>
            <p>Administra todos los usuarios de la plataforma</p>
          </div>
          <button className="action-btn" onClick={handleAddUser}>
            <Plus size={18} />
            Nuevo Usuario
          </button>
        </div>

      {/* Search */}
      <div className="users-search">
        <Search size={20} className="search-icon" />
        <input
          type="text"
          placeholder="Buscar por nombre o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="loading">Cargando usuarios...</div>
      ) : filteredUsers.length === 0 ? (
        <div className="empty-state">
          <p>No hay usuarios disponibles</p>
        </div>
      ) : (
        <div className="users-table">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Edad</th>
                <th>Suscripción</th>
                <th>Matches</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.age || '-'}</td>
                  <td>
                    <span className={`badge ${user.subscription === 'premium' ? 'badge-premium' : 'badge-free'}`}>
                      {user.subscription === 'premium' ? '⭐ Premium' : 'Free'}
                    </span>
                  </td>
                  <td>{user.matches || 0}</td>
                  <td>{user.createdAt}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn-edit"
                        onClick={() => handleEditUser(user)}
                        title="Editar usuario"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id)}
                        title="Eliminar usuario"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para editar/agregar usuario */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button className="btn-close" onClick={closeModal}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                  placeholder="Nombre completo"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                  placeholder="correo@ejemplo.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="age">Edad</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleFormChange}
                  placeholder="25"
                  min="13"
                  max="120"
                />
              </div>

              <div className="form-group">
                <label htmlFor="bio">Biografía</label>
                <input
                  type="text"
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleFormChange}
                  placeholder="Me encanta el cine..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save">
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'warning' && <AlertTriangle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
          </div>
          <span className="toast-message">{toast.message}</span>
          <button className="toast-close" onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <div className="confirm-overlay" onClick={() => setConfirmModal(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertTriangle size={48} />
            </div>
            <h3 className="confirm-title">Confirmar acción</h3>
            <p className="confirm-message">{confirmModal.message}</p>
            <div className="confirm-actions">
              <button className="confirm-btn-cancel" onClick={() => setConfirmModal(null)}>
                Cancelar
              </button>
              <button className="confirm-btn-ok" onClick={() => {
                confirmModal.onConfirm()
                setConfirmModal(null)
              }}>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}
