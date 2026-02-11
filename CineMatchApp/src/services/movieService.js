import api from '../config/api';

export const movieService = {
  // Obtener películas recomendadas para swipe
  async getRecommendedMovies() {
    try {
      const response = await api.get('/movies/recommendations');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Calificar una película (like/dislike)
  async rateMovie(movieId, rating) {
    try {
      const response = await api.post('/movies/rate', {
        movie_id: movieId,
        rating: rating // 1-5 o like/dislike según tu implementación
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Marcar película como vista
  async markAsWatched(movieId) {
    try {
      const response = await api.post('/movies/watched', {
        movie_id: movieId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener detalles de una película
  async getMovieDetails(movieId) {
    try {
      const response = await api.get(`/movies/${movieId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener películas vistas por el usuario
  async getWatchedMovies() {
    try {
      const response = await api.get('/movies/watched');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
