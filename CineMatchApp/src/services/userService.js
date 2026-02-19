import api from '../config/api';

export const userService = {
  // Obtener usuarios para hacer swipe
  async getUsers(params = {}) {
    try {
      const response = await api.get('/users', { params });
      // Devolver el payload completo { users, meta }
      return response.data || { users: [], meta: {} };
    } catch (error) {
      console.error('❌ userService.getUsers error:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener perfil de usuario
  async getUserProfile(userId) {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar preferencias de géneros
  async updateGenrePreferences(genreIds) {
    try {
      const response = await api.post('/users/preferences/genres', { genre_ids: genreIds });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener géneros favoritos del usuario
  async getFavoriteGenres() {
    try {
      const response = await api.get('/users/preferences/genres');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar películas vistas
  async markMovieAsWatched(movieId, rating = null) {
    try {
      const response = await api.post('/users/watched-movies', { 
        movie_id: movieId,
        rating 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
