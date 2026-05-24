import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tmdbRandomService } from './tmdbRandomService';
import { subscriptionService } from './subscriptionService';
import { storage } from '../utils/storage';


const RECOMMENDATION_TIMESTAMPS_KEY = '@cinematch_recommendation_timestamps';

let localResetData = {
  dailyCount: 0,
  limit: 3,
  remaining: 3,
  resetTime: new Date().toISOString(),
  recommendationTimestamps: []
};

const loadTimestampsFromStorage = async () => {
  try {
    const stored = await AsyncStorage.getItem(RECOMMENDATION_TIMESTAMPS_KEY);
    if (stored) {
      const timestamps = JSON.parse(stored);
      return timestamps;
    }
  } catch (error) {
    console.error('Error cargando timestamps desde AsyncStorage:', error);
  }
  return [];
};

const saveTimestampsToStorage = async (timestamps) => {
  try {
    await AsyncStorage.setItem(RECOMMENDATION_TIMESTAMPS_KEY, JSON.stringify(timestamps));
  } catch (error) {
    console.error('Error guardando timestamps en AsyncStorage:', error);
  }
};

const getIsPremiumUser = async () => {
  try {
    // 1. Intentar verificar con el usuario almacenado localmente (rápido y offline)
    const userData = await storage.getUser();
    console.log('[DEBUG getIsPremiumUser] userData local:', userData);
    if (userData) {
      const isPremiumLocal = Boolean(
        userData.is_premium ||
        userData.subscription?.is_premium ||
        userData.plan === 'premium' ||
        userData.plan_type === 'premium' ||
        userData.subscription?.plan === 'premium'
      );
      console.log('[DEBUG getIsPremiumUser] isPremiumLocal result:', isPremiumLocal);
      if (isPremiumLocal) {
        return true;
      }
    }

    // 2. Fallback: Consultar al backend el plan actual
    const plan = await subscriptionService.getCurrentPlan();
    console.log('[DEBUG getIsPremiumUser] plan fetched from backend:', plan);
    const isPremiumBackend = Boolean(
      plan?.is_premium ||
      plan?.plan_type === 'premium' ||
      plan?.plan === 'premium' ||
      plan?.subscription?.is_premium
    );
    console.log('[DEBUG getIsPremiumUser] isPremiumBackend result:', isPremiumBackend);
    return isPremiumBackend;
  } catch (error) {
    console.log('[DEBUG getIsPremiumUser] Error verifying subscription:', error.message);
    return false;
  }
};

export const dailyRecommendationService = {
  async getDailyRecommendation(mood = 'all') {
    try {
      if (localResetData.recommendationTimestamps.length === 0) {
        localResetData.recommendationTimestamps = await loadTimestampsFromStorage();
      }

      const isPremium = await getIsPremiumUser();

      if (isPremium) {
        const movie = await tmdbRandomService.getRandomMovieByMood(mood);

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

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const activeRecommendations = (localResetData.recommendationTimestamps || [])
        .filter(timestamp => new Date(timestamp) > twentyFourHoursAgo);

      if (activeRecommendations.length >= 3) {
        return {
          success: false,
          error: 'DAILY_LIMIT_EXCEEDED',
          message: 'Has alcanzado tu límite de 3 recomendaciones. Espera 24 horas para obtener más.',
          count: activeRecommendations.length,
          limit: 3
        };
      }

      const movie = await tmdbRandomService.getRandomMovieByMood(mood);

      const newTimestamp = now.toISOString();
      const updatedTimestamps = [...activeRecommendations, newTimestamp];

      if (localResetData) {
        localResetData.recommendationTimestamps = updatedTimestamps;
        localResetData.dailyCount = updatedTimestamps.length;
        localResetData.remaining = Math.max(0, 3 - updatedTimestamps.length);
      }

      await saveTimestampsToStorage(updatedTimestamps);

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
        return {
          success: false,
          error: 'DAILY_LIMIT_EXCEEDED',
          message: error.response.data.message,
          count: error.response.data.count,
          limit: error.response.data.limit
        };
      }

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

  async getDailyStatus() {
    try {
      console.log('[DEBUG getDailyStatus] Starting check...');
      // 1. Intentar consultar el estado actual en el backend
      try {
        console.log('[DEBUG getDailyStatus] Requesting status from backend...');
        const response = await api.get('/daily-recommendation/status');
        console.log('[DEBUG getDailyStatus] Backend response.data:', response.data);
        const isPremium = await getIsPremiumUser();
        console.log('[DEBUG getDailyStatus] Calculated isPremium:', isPremium);
        
        const mappedStatus = {
          dailyCount: response.data.daily_count || 0,
          limit: response.data.limit || (isPremium ? 'unlimited' : 3),
          remaining: isPremium ? Infinity : (response.data.remaining ?? 3),
          resetTime: response.data.reset_time || new Date().toISOString(),
          recommendationTimestamps: [],
          isPremium: response.data.is_premium ?? isPremium
        };
        console.log('[DEBUG getDailyStatus] Mapped status object returning:', mappedStatus);
        return mappedStatus;
      } catch (backendError) {
        console.log('[DEBUG getDailyStatus] Backend error, using local simulation:', backendError.message);
      }

      // 2. Fallback: Usar simulación local si el backend no responde
      if (localResetData.recommendationTimestamps.length === 0) {
        localResetData.recommendationTimestamps = await loadTimestampsFromStorage();
      }

      const isPremium = await getIsPremiumUser();
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const activeRecommendations = (localResetData.recommendationTimestamps || [])
        .filter(timestamp => new Date(timestamp) > twentyFourHoursAgo);

      if (isPremium) {
        return {
          dailyCount: activeRecommendations.length,
          limit: 'unlimited',
          remaining: Infinity,
          resetTime: localResetData.resetTime || new Date().toISOString(),
          recommendationTimestamps: localResetData.recommendationTimestamps || [],
          isPremium: true
        };
      }

      const remaining = Math.max(0, 3 - activeRecommendations.length);

      return {
        dailyCount: activeRecommendations.length,
        limit: 3,
        remaining: remaining,
        resetTime: localResetData.resetTime || new Date().toISOString(),
        recommendationTimestamps: localResetData.recommendationTimestamps || [],
        isPremium: false
      };

    } catch (error) {
      console.log('Error en getDailyStatus:', error);
      throw new Error('Error al obtener estado de recomendaciones');
    }
  },

  async getMoods() {
    try {
      const moods = await tmdbRandomService.getMoodsWithNames();
      return moods;
    } catch (error) {
      console.log('Error obteniendo moods, usando defaults:', error);
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

  async resetDailyRecommendations() {
    try {
      const response = await api.post('/daily-recommendation/reset');
      localResetData = {
        dailyCount: 0,
        limit: 3,
        remaining: 3,
        resetTime: new Date().toISOString(),
        recommendationTimestamps: []
      };
      await saveTimestampsToStorage([]);
      return response.data;
    } catch (error) {
      console.error('Error reseteando recomendaciones:', error);

      if (error.response?.status === 404) {
        localResetData = {
          dailyCount: 0,
          limit: 3,
          remaining: 3,
          resetTime: new Date().toISOString(),
          recommendationTimestamps: []
        };

        await saveTimestampsToStorage([]);

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
