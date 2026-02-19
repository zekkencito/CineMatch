
import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  genres: '@preferences_genres',
  directors: '@preferences_directors',
  movies: '@preferences_movies',
  radius: '@preferences_radius',
};


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


export const preferenceService = {

  async getFavoriteGenres() {
    try {
      const response = await api.get('/preferences/genres');
      return response.data.genres || [];
    } catch (error) {
      // Fallback a local storage
      return await loadFromLocal(STORAGE_KEYS.genres, []);
    }
  },


  async addFavoriteGenre(genreId) {
    try {
      const response = await api.post('/preferences/genres', {
        genre_id: genreId,
      });
      return response.data;
    } catch (error) {
      const current = await loadFromLocal(STORAGE_KEYS.genres, []);
      const updated = [...current, genreId];
      await saveToLocal(STORAGE_KEYS.genres, updated);
      return { success: true, saved_locally: true };
    }
  },


  async removeFavoriteGenre(genreId) {
    try {
      const response = await api.delete(`/preferences/genres/${genreId}`);
      return response.data;
    } catch (error) {
      const current = await loadFromLocal(STORAGE_KEYS.genres, []);
      const updated = current.filter(id => id !== genreId);
      await saveToLocal(STORAGE_KEYS.genres, updated);
      return { success: true, saved_locally: true };
    }
  },


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
      await saveToLocal(STORAGE_KEYS.genres, genreIds);
      return { success: true, saved_locally: true };
    }
  },


  async getFavoriteDirectors() {
    try {
      const response = await api.get('/preferences/directors');
      return response.data.directors || [];
    } catch (error) {
      // Fallback a local storage
      return await loadFromLocal(STORAGE_KEYS.directors, []);
    }
  },


  async addFavoriteDirector(directorId, name) {
    try {
      const response = await api.post('/preferences/directors', {
        director_id: directorId,
        name: name,
      });
      return response.data;
    } catch (error) {
      // Fallback a local storage
      const current = await loadFromLocal(STORAGE_KEYS.directors, []);
      const updated = [...current, { id: directorId, name }];
      await saveToLocal(STORAGE_KEYS.directors, updated);
      return { success: true, saved_locally: true };
    }
  },


  async removeFavoriteDirector(directorId) {
    try {
      const response = await api.delete(`/preferences/directors/${directorId}`);
      return response.data;
    } catch (error) {
      // Fallback a local storage
      const current = await loadFromLocal(STORAGE_KEYS.directors, []);
      const updated = current.filter(d => d.id !== directorId);
      await saveToLocal(STORAGE_KEYS.directors, updated);
      return { success: true, saved_locally: true };
    }
  },


  async syncFavoriteDirectors(directors) {
    try {
      const response = await api.post('/preferences/directors/sync', {
        directors: directors,
      });
      await saveToLocal(STORAGE_KEYS.directors, directors);
      return response.data;
    } catch (error) {
      // Fallback a local storage
      await saveToLocal(STORAGE_KEYS.directors, directors);
      return { success: true, saved_locally: true };
    }
  },

  async getWatchedMovies() {
    try {
      const response = await api.get('/preferences/movies/watched');
      return response.data.movies || [];
    } catch (error) {
      // Fallback a local storage
      return await loadFromLocal(STORAGE_KEYS.movies, []);
    }
  },


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
      const current = await loadFromLocal(STORAGE_KEYS.movies, []);
      const updated = [...current, { id: movieId, title, rating }];
      await saveToLocal(STORAGE_KEYS.movies, updated);
      return { success: true, saved_locally: true };
    }
  },


  async removeWatchedMovie(movieId) {
    try {
      const response = await api.delete(`/preferences/movies/watched/${movieId}`);
      return response.data;
    } catch (error) {
      // Fallback a local storage
      const current = await loadFromLocal(STORAGE_KEYS.movies, []);
      const updated = current.filter(m => m.id !== movieId);
      await saveToLocal(STORAGE_KEYS.movies, updated);
      return { success: true, saved_locally: true };
    }
  },


  async syncWatchedMovies(movies) {
    try {
      const response = await api.post('/preferences/movies/sync', {
        movies: movies,
      });
      await saveToLocal(STORAGE_KEYS.movies, movies);
      return response.data;
    } catch (error) {
      console.error('❌ Error sincronizando películas:', error.response?.data || error.message);
      
      // Si es error de red (no hay backend), guardar localmente
      if (!error.response || error.response.status >= 500) {
        await saveToLocal(STORAGE_KEYS.movies, movies);
        return { success: true, saved_locally: true };
      }
      
      // Para otros errores (como 422), lanzar el error
      throw error;
    }
  },


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
      await saveToLocal(STORAGE_KEYS.radius, searchRadius);
      return { success: true, saved_locally: true };
    }
  },


  async getLocation() {
    try {
      const response = await api.get('/me');
      return response.data.user?.location || null;
    } catch (error) {
      // Intentar obtener solo el radio desde local storage
      const radius = await loadFromLocal(STORAGE_KEYS.radius, 50);
      return { radius };
    }
  },
};

export default preferenceService;
