import api from '../config/api';

export const movieForumService = {
  // Obtener películas del foro con paginación
  async getMovies(page = 1, perPage = 20) {
    try {
      const response = await api.get('/movie-forum/movies', {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching forum movies:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener detalles de una película con sus reseñas
  async getMovieDetail(movieId) {
    try {
      const response = await api.get(`/movie-forum/movies/${movieId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching movie detail:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener reseñas de una película
  async getMovieReviews(movieId, page = 1, perPage = 20) {
    try {
      const response = await api.get(`/movie-forum/movies/${movieId}/reviews`, {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching movie reviews:', error);
      throw error.response?.data || error;
    }
  },

  // Crear una reseña
  async createReview(movieId, review) {
    console.log('🔥 USANDO RUTA TEMPORAL test-create-review para:', movieId);
    try {
      const response = await api.post(`/movie-forum/movies/${movieId}/reviews`, {
        review,
      });
      console.log('✅ RESPUESTA EXITOSA (review):', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      
      // Si el endpoint no existe (404), simular creación local para pruebas
      if (error.response?.status === 404) {
        console.log('Endpoint no encontrado, simulando reseña local para pruebas');
        return {
          success: true,
          message: 'Reseña creada localmente para pruebas',
          review: {
            id: Date.now(), // ID temporal
            movie_id: movieId,
            content: review,
            created_at: new Date().toISOString(),
            user: { name: 'Usuario de prueba' }
          }
        };
      }
      
      throw error.response?.data || error;
    }
  },

  // Eliminar una reseña propia
  async deleteReview(reviewId) {
    console.log('🔥 ELIMINANDO RESEña ID:', reviewId);
    try {
      const response = await api.delete(`/movie-forum/reviews/${reviewId}`);
      console.log('✅ RESEÑA ELIMINADA:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      console.error('❌ Error response:', error.response?.data);
      throw error.response?.data || error;
    }
  },

  // Calificar una película (1-10)
  async rateMovie(movieId, rating) {
    console.log('🔥 USANDO RUTA TEMPORAL test-rate-movie para:', movieId);
    try {
      const response = await api.post(`/test-rate-movie/${movieId}`, {
        rating: rating, // 1-10
      });
      console.log('✅ RESPUESTA EXITOSA:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error rating movie:', error);
      
      // Si el endpoint no existe (404), simular calificación local para pruebas
      if (error.response?.status === 404) {
        console.log('Endpoint no encontrado, simulando calificación local para pruebas');
        return {
          success: true,
          message: 'Calificación guardada localmente para pruebas',
          rating: rating,
          movie_id: movieId
        };
      }
      
      throw error.response?.data || error;
    }
  },

  // Reaccionar a una reseña (like/dislike)
  async reactToReview(reviewId, reactionType) {
    try {
      const response = await api.post(`/movie-forum/reviews/${reviewId}/react`, {
        reaction_type: reactionType, // 'like' | 'dislike'
      });
      return response.data;
    } catch (error) {
      console.error('Error reacting to review:', error);
      throw error.response?.data || error;
    }
  },

  // Responder a una reseña
  async replyToReview(reviewId, reply, parentReplyId = null) {
    try {
      const response = await api.post(`/movie-forum/reviews/${reviewId}/replies`, {
        reply,
        parent_reply_id: parentReplyId,
      });
      return response.data;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener respuestas de una reseña
  async getReviewReplies(reviewId, page = 1, perPage = 20) {
    try {
      const response = await api.get(`/movie-forum/reviews/${reviewId}/replies`, {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching review replies:', error);
      throw error.response?.data || error;
    }
  },
};
