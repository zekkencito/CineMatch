import api from '../config/api';
import { tmdbRandomService } from './tmdbRandomService';
import { subscriptionService } from './subscriptionService';

// Estado local para tracking del reset y contador
let localResetData = {
  dailyCount: 0,
  limit: 3,
  remaining: 3,
  resetTime: new Date().toISOString(),
  recommendationTimestamps: [] // Guardar timestamps de cada recomendación
};

export const dailyRecommendationService = {
  // Obtener recomendación diaria
  async getDailyRecommendation(mood = 'all') {
    try {
      console.log('🎬 dailyRecommendationService - Recibiendo mood:', mood);
      
      // Verificar si el usuario tiene suscripción premium
      let isPremium = false;
      try {
        const plan = await subscriptionService.getCurrentPlan();
        isPremium = plan && (plan.is_premium || plan.plan_type === 'premium');
        console.log('🌟 Usuario premium:', isPremium);
      } catch (error) {
        console.log('No se pudo verificar suscripción, asumiendo usuario gratuito:', error.message);
      }
      
      // Si es premium, no aplicar límite
      if (isPremium) {
        console.log('� Usuario premium - recomendaciones ilimitadas');
        const movie = await tmdbRandomService.getRandomMovieByMood(mood);
        console.log('Película obtenida de TMDB:', movie.title);
        
        return {
          success: true,
          movie: {
            id: movie.id,
            tmdb_movie_id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            overview: movie.overview,
            release_date: movie.release_date,
            vote_average: movie.vote_average,
            mood: mood
          },
          remainingRecommendations: Infinity,
          dailyCount: localResetData ? localResetData.dailyCount + 1 : 1,
          isPremium: true
        };
      }
      
      // Usuario gratuito - verificar recomendaciones activas (últimas 24 horas)
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Filtrar timestamps de recomendaciones que aún están activas (menos de 24 horas)
      const activeRecommendations = (localResetData.recommendationTimestamps || [])
        .filter(timestamp => new Date(timestamp) > twentyFourHoursAgo);
      
      console.log('📊 Recomendaciones activas (últimas 24h):', activeRecommendations.length);
      
      if (activeRecommendations.length >= 3) {
        console.log('🚫 Límite alcanzado - 3 recomendaciones en las últimas 24h');
        return {
          success: false,
          error: 'DAILY_LIMIT_EXCEEDED',
          message: 'Has alcanzado tu límite de 3 recomendaciones. Espera 24 horas para obtener más.',
          count: activeRecommendations.length,
          limit: 3
        };
      }
      
      // Forzar uso de TMDB directamente para mayor variedad
      console.log('🎥 Forzando uso de TMDB para máxima variedad:', mood);
      const movie = await tmdbRandomService.getRandomMovieByMood(mood);
      console.log('Película obtenida de TMDB:', movie.title);
      
      // Agregar timestamp de esta recomendación
      const newTimestamp = now.toISOString();
      const updatedTimestamps = [...activeRecommendations, newTimestamp];
      
      // Actualizar datos locales
      if (localResetData) {
        localResetData.recommendationTimestamps = updatedTimestamps;
        localResetData.dailyCount = updatedTimestamps.length;
        localResetData.remaining = Math.max(0, 3 - updatedTimestamps.length);
      }

      return {
        success: true,
        movie: {
          id: movie.id,
          tmdb_movie_id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          overview: movie.overview,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          mood: mood
        },
        remainingRecommendations: Math.max(0, 3 - updatedTimestamps.length),
        dailyCount: updatedTimestamps.length,
        isPremium: false,
        recommendationTimestamps: updatedTimestamps
      };
      
    } catch (error) {
      console.log('Error en getDailyRecommendation:', error);
      
      if (error.response?.status === 429) {
        // Límite diario excedido
        return {
          success: false,
          error: 'DAILY_LIMIT_EXCEEDED',
          message: error.response.data.message,
          count: error.response.data.count,
          limit: error.response.data.limit
        };
      }
      
      // Último recurso: datos de prueba
      console.log('Usando datos de prueba como último recurso');
      return {
        success: true,
        movie: {
          id: 1,
          title: 'Inception (Prueba)',
          poster_path: '/xgPGDEKkBrXhPaNmwIlf8e2RCMk.jpg',
          overview: 'Una película de prueba mientras se configura el backend.',
          release_date: '2010',
          vote_average: 8.8,
          mood: mood
        },
        remainingRecommendations: 5,
        dailyCount: 1
      };
    }
  },

  // Obtener estado actual de recomendaciones
  async getDailyStatus() {
    try {
      console.log('Solicitando estado diario...');
      
      // Si hay un reset local activo, usar esos datos
      if (localResetData) {
        console.log('Usando datos de reset local:', localResetData);
        
        // Calcular recomendaciones activas en las últimas 24 horas
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const activeRecommendations = (localResetData.recommendationTimestamps || [])
          .filter(timestamp => new Date(timestamp) > twentyFourHoursAgo);
        
        const remaining = Math.max(0, 3 - activeRecommendations.length);
        
        return {
          dailyCount: activeRecommendations.length,
          limit: 3,
          remaining: remaining,
          resetTime: localResetData.resetTime || new Date().toISOString(),
          recommendationTimestamps: localResetData.recommendationTimestamps || []
        };
      }
      
      // Primero intentar con el backend
      try {
        const response = await api.get('/daily-recommendation/status');
        console.log('Respuesta de estado del backend:', response.data);
        
        return {
          dailyCount: response.data.daily_count || 0,
          limit: response.data.limit || 3,
          remaining: response.data.remaining ?? 3,
          resetTime: response.data.reset_time || new Date().toISOString(),
          recommendationTimestamps: []
        };
      } catch (backendError) {
        console.log('Backend no disponible para estado, usando simulación:', backendError.message);
      }
      
      // Si el backend falla, devolver estado simulado
      return {
        dailyCount: 0,
        limit: 3,
        remaining: 3,
        resetTime: new Date().toISOString(),
        recommendationTimestamps: []
      };
      
    } catch (error) {
      console.log('Error en getDailyStatus:', error);
      throw new Error('Error al obtener estado de recomendaciones');
    }
  },

  // Obtener moods con nombres reales de TMDB
  async getMoods() {
    try {
      console.log('Obteniendo moods desde TMDB...');
      const moods = await tmdbRandomService.getMoodsWithNames();
      console.log('Moods obtenidos:', moods);
      return moods;
    } catch (error) {
      console.log('Error obteniendo moods, usando defaults:', error);
      // Retornar moods por defecto
      return [
        { id: 'all', name: '?? Sorpréndeme', tmdb_name: 'Todos los géneros' },
        { id: 'comedy', name: '?? Comedia', tmdb_name: 'Comedia' },
        { id: 'horror', name: '?? Terror', tmdb_name: 'Terror' },
        { id: 'drama', name: '?? Drama', tmdb_name: 'Drama' },
        { id: 'action', name: '?? Acción', tmdb_name: 'Acción' },
        { id: 'romance', name: '?? Romance', tmdb_name: 'Romance' },
        { id: 'thriller', name: '?? Thriller', tmdb_name: 'Thriller' },
        { id: 'sci-fi', name: '?? Sci-Fi', tmdb_name: 'Ciencia Ficción' },
        { id: 'animation', name: '?? Animación', tmdb_name: 'Animación' }
      ];
    }
  },

  // Resetear contador diario (para testing)
  async resetDailyRecommendations() {
    try {
      const response = await api.post('/daily-recommendation/reset');
      // Limpiar datos locales pero mantener estructura para el sistema de 24h
      localResetData = {
        dailyCount: 0,
        limit: 3,
        remaining: 3,
        resetTime: new Date().toISOString(),
        recommendationTimestamps: [] // Limpiar timestamps
      };
      return response.data;
    } catch (error) {
      console.error('Error reseteando recomendaciones:', error);
      
      // Si el endpoint no existe (404), simular reset local para pruebas
      if (error.response?.status === 404) {
        console.log('Endpoint no encontrado, simulando reset local para pruebas');
        
        // Limpiar datos del reset local
        localResetData = {
          dailyCount: 0,
          limit: 3,
          remaining: 3,
          resetTime: new Date().toISOString(),
          recommendationTimestamps: [] // Limpiar timestamps
        };
        
        return {
          success: true,
          message: 'Contador reiniciado localmente para pruebas',
          daily_count: 0,
          remaining: 3,
          limit: 3
        };
      }
      
      throw error;
    }
  }
};
