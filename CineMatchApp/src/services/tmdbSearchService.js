import api from '../config/api';
import axios from 'axios';
import { TMDB_BASE_URL, TMDB_DEFAULT_PARAMS } from '../config/tmdb';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 10000,
});

const isNotFoundError = (error) => error?.response?.status === 404;

const mapTmdbMovie = (movie) => ({
  id: movie.id,
  title: movie.title,
  poster_path: movie.poster_path,
  backdrop_path: movie.backdrop_path,
  release_date: movie.release_date,
  vote_average: movie.vote_average,
  vote_count: movie.vote_count,
  overview: movie.overview,
  genre_ids: movie.genre_ids || [],
  popularity: movie.popularity,
  original_title: movie.original_title || null,
  original_language: movie.original_language || 'en',
});

const formatMovieListResponse = (data) => ({
  movies: (data.results || []).map(mapTmdbMovie),
  meta: {
    page: data.page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  },
});

const withTmdbDefaults = (params = {}) => ({
  ...TMDB_DEFAULT_PARAMS,
  ...params,
});

// Just pass filters directly to backend
const buildParams = (filters = {}) => {
  const params = {};
  
  // No enviar min_vote_average - las calificaciones se filtran client-side
  // porque TMDB usa escala decimal y el foro usa enteros 1-10
  
  if (filters.genres && filters.genres.length > 0) {
    params['with_genres'] = filters.genres.join(',');
  }
  
  // Años - usar rango de fechas para cubrir todos los seleccionados
  if (filters.years?.length) {
    if (filters.years.length === 1) {
      params['primary_release_year'] = filters.years[0];
    } else {
      // Múltiples años: usar rango desde el más antiguo hasta el más reciente
      const minYear = Math.min(...filters.years);
      const maxYear = Math.max(...filters.years);
      params['primary_release_date.gte'] = `${minYear}-01-01`;
      params['primary_release_date.lte'] = `${maxYear}-12-31`;
    }
  }
  
  if (filters.sortBy) {
    params['sort_by'] = filters.sortBy;
  }
  
  console.log('📤 Final params to send:', params);
  return params;
};

export const tmdbSearchService = {
  // Buscar películas por texto
  async searchMovies(query, page = 1, filters = {}) {
    try {
      const filterParams = buildParams(filters);
      const params = {
        query,
        page,
        language: 'es-MX',
        include_adult: false,
        ...filterParams
      };

      const response = await api.get('/tmdb/search/movies', { params });
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        const filterParams = buildParams(filters);
        const fallbackResponse = await tmdbApi.get('/search/movie', {
          params: withTmdbDefaults({
            query,
            page,
            language: 'es-MX',
            include_adult: false,
            ...filterParams,
          }),
        });
        return formatMovieListResponse(fallbackResponse.data);
      }

      console.error('Error searching TMDB movies:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener películas populares
  async getPopularMovies(page = 1, filters = {}) {
    try {
      const filterParams = buildParams(filters);
      const params = {
        page,
        language: 'es-MX',
        ...filterParams
      };

      const response = await api.get('/tmdb/movies/popular', { params });
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        const filterParams = buildParams(filters);
        const fallbackResponse = await tmdbApi.get('/discover/movie', {
          params: withTmdbDefaults({
            page,
            language: 'es-MX',
            sort_by: filterParams.sort_by || 'popularity.desc',
            ...filterParams,
          }),
        });
        return formatMovieListResponse(fallbackResponse.data);
      }

      console.error('Error fetching popular TMDB movies:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener películas por género
  async getMoviesByGenre(genreId, page = 1, filters = {}) {
    try {
      const filterParams = buildParams(filters);
      const params = {
        page,
        language: 'es-MX',
        with_genres: genreId,
        ...filterParams
      };

      const response = await api.get('/tmdb/movies/discover', { params });
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        const filterParams = buildParams(filters);
        const fallbackResponse = await tmdbApi.get('/discover/movie', {
          params: withTmdbDefaults({
            page,
            language: 'es-MX',
            with_genres: genreId,
            ...filterParams,
          }),
        });
        return formatMovieListResponse(fallbackResponse.data);
      }

      console.error('Error fetching movies by genre:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener películas mejor calificadas
  async getTopRatedMovies(page = 1, filters = {}) {
    try {
      const filterParams = buildParams(filters);
      const params = {
        page,
        language: 'es-MX',
        ...filterParams
      };

      const response = await api.get('/tmdb/movies/top-rated', { params });
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        const filterParams = buildParams(filters);
        const fallbackResponse = await tmdbApi.get('/movie/top_rated', {
          params: withTmdbDefaults({
            page,
            language: 'es-MX',
            ...filterParams,
          }),
        });
        return formatMovieListResponse(fallbackResponse.data);
      }

      console.error('Error fetching top rated TMDB movies:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener películas por año de lanzamiento
  async getMoviesByYear(year, page = 1, filters = {}) {
    try {
      const filterParams = buildParams(filters);
      const params = {
        page,
        language: 'es-MX',
        primary_release_year: year,
        ...filterParams
      };

      const response = await api.get('/tmdb/movies/discover', { params });
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        const filterParams = buildParams(filters);
        const fallbackResponse = await tmdbApi.get('/discover/movie', {
          params: withTmdbDefaults({
            page,
            language: 'es-MX',
            primary_release_year: year,
            ...filterParams,
          }),
        });
        return formatMovieListResponse(fallbackResponse.data);
      }

      console.error('Error fetching movies by year:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener detalles de una película específica
  async getMovieDetails(movieId) {
    try {
      const response = await api.get(`/tmdb/movies/${movieId}`, {
        params: {
          language: 'es-MX',
          append_to_response: 'credits,videos,reviews'
        }
      });
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        const fallbackResponse = await tmdbApi.get(`/movie/${movieId}`, {
          params: withTmdbDefaults({
            language: 'es-MX',
            append_to_response: 'credits,videos,reviews',
          }),
        });
        return fallbackResponse.data;
      }

      console.error('Error fetching TMDB movie details:', error);
      throw error.response?.data || error;
    }
  },

  // Obtener lista de géneros
  async getGenres() {
    try {
      const response = await api.get('/tmdb/genres', {
        params: {
          language: 'es-MX'
        }
      });
      return response.data;
    } catch (error) {
      if (isNotFoundError(error)) {
        const fallbackResponse = await tmdbApi.get('/genre/movie/list', {
          params: withTmdbDefaults({ language: 'es-MX' }),
        });
        return {
          genres: fallbackResponse.data?.genres || [],
        };
      }

      console.error('Error fetching TMDB genres:', error);
      throw error.response?.data || error;
    }
  }
};
