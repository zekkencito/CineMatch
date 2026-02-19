import api from '../config/api';

export const subscriptionService = {
  // Obtener plan actual del usuario
  async getCurrentPlan() {
    try {
      const response = await api.get('/subscription/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener planes disponibles
  async getPlans() {
    try {
      const response = await api.get('/subscription/plans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar a premium
  async upgradeToPremium(duration = 30, payment = null) {
    try {
      const payload = { duration };
      if (payment) payload.payment = payment;
      const response = await api.post('/subscription/upgrade', payload);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancelar suscripción
  async cancelSubscription() {
    try {
      const response = await api.post('/subscription/cancel');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener conteo de likes diarios
  async getDailyLikesCount() {
    try {
      const response = await api.get('/subscription/likes-count');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
