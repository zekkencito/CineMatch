import api from '../config/api';

export const matchService = {
  // Obtener usuarios con gustos similares (matches potenciales)
  async getPotentialMatches() {
    try {
      const response = await api.get('/matches/suggestions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener matches confirmados
  async getMatches() {
    try {
      const response = await api.get('/matches');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Dar like a un usuario
  async likeUser(userId) {
    try {
      const response = await api.post('/matches/like', {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Dar pass a un usuario
  async passUser(userId) {
    try {
      const response = await api.post('/matches/pass', {
        user_id: userId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener detalles de compatibilidad con un usuario
  async getCompatibility(userId) {
    try {
      const response = await api.get(`/matches/compatibility/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
