import api from '../config/api';

export const preferenceService = {
  // Obtener géneros disponibles
  async getGenres() {
    try {
      const response = await api.get('/genres');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener directores
  async getDirectors() {
    try {
      const response = await api.get('/directors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Guardar géneros favoritos del usuario
  async saveFavoriteGenres(genreIds) {
    try {
      const response = await api.post('/user/favorite-genres', {
        genre_ids: genreIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Guardar directores favoritos del usuario
  async saveFavoriteDirectors(directorIds) {
    try {
      const response = await api.post('/user/favorite-directors', {
        director_ids: directorIds
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener preferencias del usuario
  async getUserPreferences() {
    try {
      const response = await api.get('/user/preferences');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
