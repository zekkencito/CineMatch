/**
 * 🎬 Servicio de Películas - Integración TMDB + Laravel
 * 
 * Este servicio maneja:
 * 1. Datos de películas desde TMDB (The Movie Database)
 * 2. Preferencias de usuario en Laravel
 */

import api from '../config/api';
import axios from 'axios';
import {
  TMDB_BASE_URL,
  TMDB_API_KEY,
  TMDB_DEFAULT_PARAMS,
  getImageUrl,
  IMAGE_SIZES,
} from '../config/tmdb';

// ============================================
// 🌐 TMDB API - Obtener datos de películas
// ============================================

export const tmdbService = {
  /**
   * Obtener lista de géneros desde TMDB
   */
  async getGenres() {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
        params: TMDB_DEFAULT_PARAMS,
      });
      return response.data.genres;
    } catch (error) {
      console.error('Error fetching genres from TMDB:', error);
      throw error;
    }
  },

  /**
   * Buscar películas en TMDB
   * @param {string} query - Término de búsqueda
   * @param {number} page - Página de resultados
   */
  async searchMovies(query, page = 1) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/movie`, {
        params: {
          ...TMDB_DEFAULT_PARAMS,
          query,
          page,
        },
      });
      
      // Agregar URLs de imágenes completas
      const movies = response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path, IMAGE_SIZES.poster.medium),
        backdrop_url: getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.medium),
      }));
      
      return {
        movies,
        total_pages: response.data.total_pages,
        total_results: response.data.total_results,
      };
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  /**
   * Obtener películas populares
   * @param {number} page - Página de resultados
   */
  async getPopularMovies(page = 1) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/popular`, {
        params: {
          ...TMDB_DEFAULT_PARAMS,
          page,
        },
      });
      
      const movies = response.data.results.map(movie => ({
        ...movie,
        poster_url: getImageUrl(movie.poster_path, IMAGE_SIZES.poster.medium),
        backdrop_url: getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.medium),
      }));
      
      return {
        movies,
        total_pages: response.data.total_pages,
      };
    } catch (error) {
      console.error('Error fetching popular movies:', error);
      throw error;
    }
  },

  /**
   * Buscar directores/actores en TMDB
   * @param {string} query - Nombre del director/actor
   */
  async searchPeople(query) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/search/person`, {
        params: {
          ...TMDB_DEFAULT_PARAMS,
          query,
        },
      });
      
      const people = response.data.results.map(person => ({
        ...person,
        profile_url: getImageUrl(person.profile_path, IMAGE_SIZES.profile.medium),
        // Filtrar para obtener solo directores conocidos
        known_for_department: person.known_for_department,
      }));
      
      // Priorizar directores
      return people.filter(p => 
        p.known_for_department === 'Directing' || 
        p.known_for?.some(movie => movie.media_type === 'movie')
      );
    } catch (error) {
      console.error('Error searching people:', error);
      throw error;
    }
  },

  /**
   * Obtener detalles de película con créditos (directores)
   * @param {number} movieId - ID de la película en TMDB
   */
  async getMovieDetails(movieId) {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
        params: {
          ...TMDB_DEFAULT_PARAMS,
          append_to_response: 'credits', // Incluir directores/actores
        },
      });
      
      const movie = response.data;
      
      // Extraer directores del crew
      const directors = movie.credits?.crew
        .filter(person => person.job === 'Director')
        .map(director => ({
          id: director.id,
          name: director.name,
          profile_url: getImageUrl(director.profile_path, IMAGE_SIZES.profile.small),
        }));
      
      return {
        ...movie,
        poster_url: getImageUrl(movie.poster_path, IMAGE_SIZES.poster.large),
        backdrop_url: getImageUrl(movie.backdrop_path, IMAGE_SIZES.backdrop.large),
        directors,
      };
    } catch (error) {
      console.error('Error fetching movie details:', error);
      throw error;
    }
  },
};

// ============================================
// 🗄️ Laravel API - Guardar preferencias
// ============================================

export const movieService = {
  /**
   * Obtener géneros guardados en Laravel
   */
  async getGenres() {
    try {
      const response = await api.get('/genres');
      return response.data.genres || response.data;
    } catch (error) {
      // Si falla Laravel, usar TMDB directamente
      console.log('Fetching genres from TMDB instead');
      return await tmdbService.getGenres();
    }
  },

  /**
   * Obtener directores guardados en Laravel
   */
  async getDirectors() {
    try {
      const response = await api.get('/directors');
      return response.data.directors || response.data;
    } catch (error) {
      console.error('Error fetching directors:', error);
      throw error;
    }
  },

  /**
   * Buscar películas (usa TMDB)
   */
  async searchMovies(query) {
    return await tmdbService.searchMovies(query);
  },

  /**
   * Obtener películas populares (usa TMDB)
   */
  async getPopularMovies(page = 1) {
    return await tmdbService.getPopularMovies(page);
  },

  /**
   * Buscar directores (usa TMDB)
   */
  async searchDirectors(query) {
    return await tmdbService.searchPeople(query);
  },

  /**
   * Obtener detalles de película (usa TMDB)
   */
  async getMovieDetails(movieId) {
    return await tmdbService.getMovieDetails(movieId);
  },
};

export default movieService;
