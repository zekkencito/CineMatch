import api from '../config/api';

export const matchService = {
  // Enviar like o dislike
  async sendLike(toUserId, type = 'like') {
    try {
      const response = await api.post('/matches/like', {
        to_user_id: toUserId,
        type // 'like' o 'dislike'
      });
      return response.data;
    } catch (error) {
      console.error('Error sending like:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener matches
  async getMatches() {
    try {
      const response = await api.get('/matches');
      // La API devuelve { success: true, matches: [...] }
      return response.data.matches || [];
    } catch (error) {
      console.error('Error getting matches:', error);
      throw error.response?.data || error;
    }
  },

  // Verificar si hay match
  async checkMatch(userId) {
    try {
      const response = await api.get(`/matches/check/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error checking match:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener usuarios que me dieron like
  async getWhoLikedMe() {
    try {
      const response = await api.get('/likes');
      return response.data;
    } catch (error) {
      console.error('Error getting likes:', error);
      throw error.response?.data || error;
    }
  },
};
