import React, { useState, useEffect, useCallback } from 'react';
import './SubscriptionPlans.css';
import {
  Edit2,
  Trash2,
  Plus,
  X,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Info,
} from 'lucide-react';
import Sidebar from './Sidebar';
import Header from './Header';
import api from '../services/api';

const SubscriptionPlans = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    daily_likes: '',
    see_who_liked: false,
    advanced_filters: false,
    duration_days: 30,
  });

  // Toast notification state
  const [toast, setToast] = useState(null);
  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const showConfirm = useCallback((message, onConfirm) => {
    setConfirmModal({ message, onConfirm });
  }, []);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await api.getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      showToast('Error al cargar los planes. Verifica que el servidor Laravel esté corriendo.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      daily_likes: '',
      see_who_liked: false,
      advanced_filters: false,
      duration_days: 30,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (plan) => {
    setFormData(plan);
    setEditingId(plan.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    showConfirm('¿Estás seguro de que deseas eliminar este plan?', async () => {
      try {
        await api.deleteSubscriptionPlan(id);
        showToast('Plan eliminado correctamente', 'success');
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        showToast('Error al eliminar el plan', 'error');
      }
    });
  };

  const handleSave = async () => {
    if (!formData.name || formData.daily_likes === '') {
      showToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    try {
      if (editingId) {
        await api.updateSubscriptionPlan(editingId, formData);
        showToast('Plan actualizado correctamente', 'success');
      } else {
        await api.createSubscriptionPlan(formData);
        showToast('Plan creado correctamente', 'success');
      }
      
      resetForm();
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      showToast('Error al guardar el plan', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const menuItems = [
    { id: 1, label: 'Dashboard', path: '/' },
    { id: 3, label: 'Usuarios', path: '/users' },
    { id: 4, label: 'Suscripciones', path: '/subscriptions' },
  ];

  const handleLogout = () => {
    window.location.href = '/login'
  };

  return (
    <div className="subscription-container">
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
            <h2>Gestión de Planes de Suscripción</h2>
            <p>Administra y personaliza los planes disponibles para los usuarios</p>
          </div>
          <button
            className="action-btn"
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
          >
            <Plus size={18} />
            Nuevo Plan
          </button>
        </div>

        {/* Modal para editar/agregar plan */}
        {showForm && (
          <div className="modal-overlay" onClick={resetForm}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? 'Editar Plan' : 'Nuevo Plan'}</h2>
                <button className="btn-close" onClick={resetForm}>
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                <div className="form-group">
                  <label htmlFor="name">Nombre del Plan</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="ej: Premium"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Precio (MXN)</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="99.99"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="daily_likes">Likes Diarios</label>
                  <input
                    type="number"
                    id="daily_likes"
                    name="daily_likes"
                    value={formData.daily_likes}
                    onChange={handleChange}
                    required
                    placeholder="50"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration_days">Duración (días)</label>
                  <input
                    type="number"
                    id="duration_days"
                    name="duration_days"
                    value={formData.duration_days}
                    onChange={handleChange}
                    placeholder="30"
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="see_who_liked"
                      checked={formData.see_who_liked}
                      onChange={handleChange}
                    />
                    Ver quién te dio like
                  </label>
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      name="advanced_filters"
                      checked={formData.advanced_filters}
                      onChange={handleChange}
                    />
                    Filtros avanzados
                  </label>
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={resetForm}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-save">
                    {editingId ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Plans Table */}
        <div className="plans-section">
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              Cargando planes...
            </div>
          ) : plans.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No hay planes disponibles. Crea uno nuevo.
            </div>
          ) : (
            <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.name}</h3>
                  <div className="plan-price">
                    ${plan.price}
                    <span className="plan-period">MXN/mes</span>
                  </div>
                </div>

                <div className="plan-features">
                  <div className="feature">
                    <span className="feature-label">Likes diarios:</span>
                    <span className="feature-value">{plan.daily_likes}</span>
                  </div>
                  <div className="feature">
                    <span className="feature-label">Duración:</span>
                    <span className="feature-value">{plan.duration_days} días</span>
                  </div>

                  <div className="feature-check">
                    {plan.see_who_liked ? (
                      <span className="feature-enabled">✓ Ver likes</span>
                    ) : (
                      <span className="feature-disabled">✗ Ver likes</span>
                    )}
                  </div>

                  <div className="feature-check">
                    {plan.advanced_filters ? (
                      <span className="feature-enabled">✓ Filtros avanzados</span>
                    ) : (
                      <span className="feature-disabled">✗ Filtros avanzados</span>
                    )}
                  </div>
                </div>

                <div className="plan-actions">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit2 size={16} />
                    Editar
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 size={16} />
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

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
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SubscriptionPlans;
