/**
 * 📍 Servicio de Preferencias de Usuario
 * Maneja géneros, directores, películas vistas y ubicación
 * Con fallback a AsyncStorage cuando backend no disponible
 */

import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  genres: '@preferences_genres',
  directors: '@preferences_directors',
  movies: '@preferences_movies',
  radius: '@preferences_radius',
};

// ============================================
// 🔧 Funciones auxiliares de AsyncStorage
// ============================================

const saveToLocal = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to local:`, error);
  }
};

const loadFromLocal = async (key, defaultValue = []) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from local:`, error);
    return defaultValue;
  }
};

// ============================================
// 📦 Servicio de Preferencias
// ============================================

export const preferenceService = {
  // ============================================
  // 🎭 GÉNEROS
  // ============================================

  /**
   * Obtener géneros favoritos del usuario
   */
  async getFavoriteGenres() {
    try {
      const response = await api.get('/preferences/genres');
      return response.data.genres || [];
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, using local storage for genres');
      return await loadFromLocal(STORAGE_KEYS.genres, []);
    }
  },

  /**
   * Agregar género favorito
   * @param {number} genreId - ID del género
   */
  async addFavoriteGenre(genreId) {
    try {
      const response = await api.post('/preferences/genres', {
        genre_id: genreId,
      });
      return response.data;
    } catch (error) {
      console.log('⚠️ Backend unavailable, adding genre locally');
      const current = await loadFromLocal(STORAGE_KEYS.genres, []);
      const updated = [...current, genreId];
      await saveToLocal(STORAGE_KEYS.genres, updated);
      return { success: true, saved_locally: true };
    }
  },

  /**
   * Eliminar género favorito
   * @param {number} genreId - ID del género
   */
  async removeFavoriteGenre(genreId) {
    try {
      const response = await api.delete(`/preferences/genres/${genreId}`);
      return response.data;
    } catch (error) {
      console.log('⚠️ Backend unavailable, removing genre locally');
      const current = await loadFromLocal(STORAGE_KEYS.genres, []);
      const updated = current.filter(id => id !== genreId);
      await saveToLocal(STORAGE_KEYS.genres, updated);
      return { success: true, saved_locally: true };
    }
  },

  /**
   * Actualizar todos los géneros favoritos (sync)
   * @param {Array<number>} genreIds - Array de IDs de géneros
   */
  async syncFavoriteGenres(genreIds) {
    try {
      const response = await api.post('/preferences/genres/sync', {
        genre_ids: genreIds,
      });
      // Guardar también en local
      await saveToLocal(STORAGE_KEYS.genres, genreIds);
      return response.data;
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, saving genres locally');
      await saveToLocal(STORAGE_KEYS.genres, genreIds);
      return { success: true, saved_locally: true };
    }
  },

  // ============================================
  // 🎬 DIRECTORES
  // ============================================

  /**
   * Obtener directores favoritos del usuario
   */
  async getFavoriteDirectors() {
    try {
      const response = await api.get('/preferences/directors');
      return response.data.directors || [];
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, using local storage for directors');
      return await loadFromLocal(STORAGE_KEYS.directors, []);
    }
  },

  /**
   * Agregar director favorito
   * @param {number} directorId - ID del director (TMDB)
   * @param {string} name - Nombre del director
   */
  async addFavoriteDirector(directorId, name) {
    try {
      const response = await api.post('/preferences/directors', {
        director_id: directorId,
        name: name,
      });
      return response.data;
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, saving director locally');
      const current = await loadFromLocal(STORAGE_KEYS.directors, []);
      const updated = [...current, { id: directorId, name }];
      await saveToLocal(STORAGE_KEYS.directors, updated);
      return { success: true, saved_locally: true };
    }
  },

  /**
   * Eliminar director favorito
   * @param {number} directorId - ID del director
   */
  async removeFavoriteDirector(directorId) {
    try {
      const response = await api.delete(`/preferences/directors/${directorId}`);
      return response.data;
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, removing director locally');
      const current = await loadFromLocal(STORAGE_KEYS.directors, []);
      const updated = current.filter(d => d.id !== directorId);
      await saveToLocal(STORAGE_KEYS.directors, updated);
      return { success: true, saved_locally: true };
    }
  },

  /**
   * Sincronizar todos los directores favoritos (reemplaza todos)
   * @param {Array} directors - Array de {id, name}
   */
  async syncFavoriteDirectors(directors) {
    try {
      const response = await api.post('/preferences/directors/sync', {
        directors: directors,
      });
      await saveToLocal(STORAGE_KEYS.directors, directors);
      return response.data;
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, syncing directors locally');
      await saveToLocal(STORAGE_KEYS.directors, directors);
      return { success: true, saved_locally: true };
    }
  },

  // ============================================
  // 🎥 PELÍCULAS VISTAS
  // ============================================

  /**
   * Obtener películas vistas por el usuario
   */
  async getWatchedMovies() {
    try {
      const response = await api.get('/preferences/movies/watched');
      return response.data.movies || [];
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, using local storage for movies');
      return await loadFromLocal(STORAGE_KEYS.movies, []);
    }
  },

  /**
   * Marcar película como vista
   * @param {number} movieId - ID de la película (TMDB)
   * @param {string} title - Título de la película
   * @param {number} rating - Rating opcional (1-10)
   */
  async addWatchedMovie(movieId, title, rating = null) {
    try {
      const response = await api.post('/preferences/movies/watched', {
        movie_id: movieId,
        title: title,
        rating: rating,
      });
      return response.data;
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, saving movie locally');
      const current = await loadFromLocal(STORAGE_KEYS.movies, []);
      const updated = [...current, { id: movieId, title, rating }];
      await saveToLocal(STORAGE_KEYS.movies, updated);
      return { success: true, saved_locally: true };
    }
  },

  /**
   * Eliminar película de vistas
   * @param {number} movieId - ID de la película
   */
  async removeWatchedMovie(movieId) {
    try {
      const response = await api.delete(`/preferences/movies/watched/${movieId}`);
      return response.data;
    } catch (error) {
      // Fallback a local storage
      console.log('⚠️ Backend unavailable, removing movie locally');
      const current = await loadFromLocal(STORAGE_KEYS.movies, []);
      const updated = current.filter(m => m.id !== movieId);
      await saveToLocal(STORAGE_KEYS.movies, updated);
      return { success: true, saved_locally: true };
    }
  },

  /**
   * Sincronizar todas las películas vistas (reemplaza todas)
   * @param {Array} movies - Array de {id, title}
   */
  async syncWatchedMovies(movies) {
    try {
      console.log('📤 Enviando películas al backend:', movies);
      const response = await api.post('/preferences/movies/sync', {
        movies: movies,
      });
      await saveToLocal(STORAGE_KEYS.movies, movies);
      return response.data;
    } catch (error) {
      console.error('❌ Error sincronizando películas:', error.response?.data || error.message);
      
      // Si es error de red (no hay backend), guardar localmente
      if (!error.response || error.response.status >= 500) {
        console.log('⚠️ Backend unavailable, syncing movies locally');
        await saveToLocal(STORAGE_KEYS.movies, movies);
        return { success: true, saved_locally: true };
      }
      
      // Para otros errores (como 422), lanzar el error
      throw error;
    }
  },

  // ============================================
  // 📍 UBICACIÓN
  // ============================================

  /**
   * Actualizar ubicación y radio de búsqueda
   * @param {number} latitude - Latitud
   * @param {number} longitude - Longitud
   * @param {number} searchRadius - Radio en km (5-500)
   * @param {string} city - Ciudad (opcional)
   * @param {string} country - País (opcional)
   */
  async updateLocation({ latitude, longitude, searchRadius, city, country }) {
    try {
      const response = await api.put('/location', {
        latitude,
        longitude,
        search_radius: searchRadius,
        city,
        country,
      });
      return response.data;
    } catch (error) {
      // Fallback a local storage solo para el radio
      console.log('⚠️ Backend unavailable, saving radius locally');
      await saveToLocal(STORAGE_KEYS.radius, searchRadius);
      return { success: true, saved_locally: true };
    }
  },

  /**
   * Obtener ubicación actual del usuario
   */
  async getLocation() {
    try {
      const response = await api.get('/me');
      return response.data.user?.location || null;
    } catch (error) {
      // Intentar obtener solo el radio desde local storage
      console.log('⚠️ Backend unavailable, loading radius from local storage');
      const radius = await loadFromLocal(STORAGE_KEYS.radius, 50);
      return { radius };
    }
  },
};

export default preferenceService;
