import api from '../config/api';

export const subscriptionService = {
  // Obtener planes de suscripción
  async getPlans() {
    try {
      const response = await api.get('/subscription-plans');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Suscribirse a un plan
  async subscribe(planId, paymentData) {
    try {
      const response = await api.post('/subscriptions', {
        plan_id: planId,
        payment_data: paymentData
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener suscripción actual
  async getCurrentSubscription() {
    try {
      const response = await api.get('/subscriptions/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Cancelar suscripción
  async cancelSubscription() {
    try {
      const response = await api.delete('/subscriptions/current');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
