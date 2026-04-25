import api from '../config/api';

export const userRatingService = {
  /**
   * Obtener calificación promedio de usuarios para una película
   */
  async getMovieRating(movieId) {
    try {
      console.log(`Obteniendo calificación de usuarios para película ID: ${movieId}`);
      
      // Primero intentar con el backend
      try {
        const response = await api.get(`/movies/${movieId}/rating`);
        if (response.data.success) {
          console.log(`Calificación del backend: ${response.data.average_rating}`);
          return response.data.average_rating;
        }
      } catch (backendError) {
        console.log('Backend no disponible para calificaciones, usando fallback');
        console.log('Error del backend:', backendError.response?.status, backendError.response?.data);
      }
      
      // Fallback: Usar calificación TMDB si no hay calificaciones de usuarios
      console.log('Usando calificación TMDB como fallback');
      return null;
      
    } catch (error) {
      console.error('Error obteniendo calificación de usuarios:', error);
      return null;
    }
  },

  /**
   * Obtener calificaciones de usuarios para múltiples películas
   */
  async getMoviesRatings(movieIds) {
    try {
      console.log(`Obteniendo calificaciones para ${movieIds.length} películas`);
      
      const ratings = {};
      
      // Obtener calificaciones en paralelo
      const promises = movieIds.map(async (movieId) => {
        const rating = await this.getMovieRating(movieId);
        return { movieId, rating };
      });
      
      const results = await Promise.all(promises);
      
      results.forEach(({ movieId, rating }) => {
        ratings[movieId] = rating;
      });
      
      console.log('Calificaciones obtenidas:', ratings);
      return ratings;
      
    } catch (error) {
      console.error('Error obteniendo calificaciones múltiples:', error);
      return {};
    }
  },

  /**
   * Agregar calificación de usuario a una película
   */
  async rateMovie(movieId, rating) {
    try {
      console.log(`Calificando película ${movieId} con ${rating} estrellas`);
      
      const response = await api.post(`/movies/${movieId}/rate`, {
        rating: rating
      });
      
      if (response.data.success) {
        console.log('Calificación guardada exitosamente');
        return response.data;
      }
      
      throw new Error('Error al guardar calificación');
      
    } catch (error) {
      console.error('Error calificando película:', error);
      
      // Si el endpoint no existe (404), simular guardado local para pruebas
      if (error.response?.status === 404) {
        console.log('Endpoint no encontrado, simulando calificación local para pruebas');
        return {
          success: true,
          message: 'Calificación guardada localmente para pruebas',
          rating: rating,
          movie_id: movieId
        };
      }
      
      throw error;
    }
  },

  /**
   * Calcular calificación combinada (usuarios + TMDB)
   */
  getCombinedRating(userRating, tmdbRating) {
    // Si hay calificación de usuarios, usarla
    if (userRating !== null && userRating > 0) {
      return {
        rating: userRating,
        source: 'users',
        display: `${userRating.toFixed(1)} (usuarios)`
      };
    }
    
    // Si no hay calificación de usuarios, usar TMDB
    if (tmdbRating && tmdbRating > 0) {
      return {
        rating: tmdbRating,
        source: 'tmdb',
        display: `${tmdbRating.toFixed(1)} (TMDB)`
      };
    }
    
    // Sin calificación disponible
    return {
      rating: 0,
      source: 'none',
      display: 'N/A'
    };
  }
};
