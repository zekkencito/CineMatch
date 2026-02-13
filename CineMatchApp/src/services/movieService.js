import api from '../config/api';

export const movieService = {
  // Obtener todas las películas
  async getMovies(params = {}) {
    try {
      const response = await api.get('/movies', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener película por ID
  async getMovie(movieId) {
    try {
      const response = await api.get(`/movies/${movieId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener géneros
  async getGenres() {
    try {
      const response = await api.get('/genres');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Obtener directores
  async getDirectors() {
    try {
      const response = await api.get('/directors');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Buscar películas
  async searchMovies(query) {
    try {
      const response = await api.get('/movies/search', { 
        params: { q: query } 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
