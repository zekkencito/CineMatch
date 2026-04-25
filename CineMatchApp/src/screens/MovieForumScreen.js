import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { movieForumService } from '../services/movieForumService';
import { tmdbSearchService } from '../services/tmdbSearchService';
import api from '../config/api';
import MovieForumMovieCard from '../components/MovieForumMovieCard';
import MovieSearchFilters from '../components/MovieSearchFilters';
import CustomAlert from '../components/CustomAlert';
import useCustomAlert from '../hooks/useCustomAlert';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const MovieForumScreen = ({ navigation }) => {
  // Context and hooks
  const { colors } = useTheme();
  const { user } = useAuth();
  const { alertConfig, showSuccess, showError, showWarning, showInfo, showConfirm, hideAlert } = useCustomAlert();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // State management
  const [movies, setMovies] = useState([]);
  const [forumMovies, setForumMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [finished, setFinished] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [genres, setGenres] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMode, setSearchMode] = useState('forum'); // 'forum' | 'tmdb'
  const [tmdbPage, setTmdbPage] = useState(1);
  const [tmdbFinished, setTmdbFinished] = useState(false);
  const [debouncedSearchTrigger, setDebouncedSearchTrigger] = useState(0); // Counter to trigger search

  const hasActiveFilters = useCallback((filtersObj = {}) => {
    return Object.values(filtersObj).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      return value !== undefined && value !== null && value !== '';
    });
  }, []);

  const shouldUseTmdbSearch = useCallback((query = '', filtersObj = {}) => {
    const hasQuery = Boolean(query?.trim());
    const hasGenreFilters = Array.isArray(filtersObj?.genres) && filtersObj.genres.length > 0;
    const hasYearFilters = Array.isArray(filtersObj?.years) && filtersObj.years.length > 0;
    const hasSortBy = filtersObj.sortBy && filtersObj.sortBy !== 'popularity.desc';
    // Usar TMDB para búsqueda de texto, géneros, años o ordenamiento
    return hasQuery || hasGenreFilters || hasYearFilters || hasSortBy;
  }, []);

  const filtersRef = useRef(filters);

  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Debug function for search query changes with debounce
  const handleSearchQueryChange = useCallback((text) => {
    console.log('🔤 Search text changed:', text);
    setSearchQuery(text);
    
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // Execute immediately if clearing
    if (!text || text.trim() === '') {
      console.log('🔤 Search cleared - execute immediately');
      executeSearch(text, filtersRef.current);
      return;
    }
    
    // Debounce normal searches
    debounceTimerRef.current = setTimeout(() => {
      console.log('⏱️ Search debounce done');
      executeSearch(text, filtersRef.current);
    }, 1500);
  }, [executeSearch]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const listSlideAnim = useRef(new Animated.Value(20)).current;
  const prevFiltersRef = useRef(null);
  const prevQueryRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const isSearchExecutingRef = useRef(false);
  const isLoadingForumMoviesRef = useRef(false);
  const forumPageRef = useRef(1);

  const getMovieActivityTimestamp = useCallback((movie) => {
    const raw = movie?.latest_activity_at || movie?.latest_review_at || movie?.latest_rating_at;
    const timestamp = raw ? new Date(raw).getTime() : 0;
    return Number.isFinite(timestamp) ? timestamp : 0;
  }, []);

  const normalizeForumMovies = useCallback((list = []) => {
    const byKey = new Map();

    const buildMovieKey = (movie) => {
      if (movie?.tmdb_movie_id) {
        return `tmdb-${movie.tmdb_movie_id}`;
      }

      const safeTitle = (movie?.title || '').trim().toLowerCase();
      const safeYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : 'na';
      return `title-${safeTitle}-${safeYear}`;
    };

    list.forEach((movie) => {
      if (!movie?.id) return;
      const key = buildMovieKey(movie);
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, movie);
        return;
      }

      const existingReviews = Number(existing?.review_count ?? existing?.reviews_count ?? 0);
      const incomingReviews = Number(movie?.review_count ?? movie?.reviews_count ?? 0);
      const existingRatingCount = Number(existing?.ratings?.rating_count ?? 0);
      const incomingRatingCount = Number(movie?.ratings?.rating_count ?? 0);
      const existingAverage = Number(existing?.ratings?.average_rating ?? existing?.vote_average ?? 0);
      const incomingAverage = Number(movie?.ratings?.average_rating ?? movie?.vote_average ?? 0);

      const baseMovie = getMovieActivityTimestamp(movie) >= getMovieActivityTimestamp(existing) ? movie : existing;
      const reviewSource = incomingReviews >= existingReviews ? movie : existing;

      const incomingHasValidRating = incomingRatingCount > 0 || incomingAverage > 0;
      const existingHasValidRating = existingRatingCount > 0 || existingAverage > 0;
      const ratingSource = incomingHasValidRating && !existingHasValidRating
        ? movie
        : (!incomingHasValidRating && existingHasValidRating ? existing : (incomingRatingCount >= existingRatingCount ? movie : existing));

      byKey.set(key, {
        ...baseMovie,
        id: reviewSource.id,
        review_count: Math.max(existingReviews, incomingReviews),
        reviews_count: Math.max(existingReviews, incomingReviews),
        vote_average: Number(ratingSource?.ratings?.average_rating ?? ratingSource?.vote_average ?? 0) || null,
        ratings: {
          ...(baseMovie.ratings || {}),
          ...(ratingSource.ratings || {}),
          average_rating: Number(ratingSource?.ratings?.average_rating ?? ratingSource?.vote_average ?? 0) || null,
          rating_count: Number(ratingSource?.ratings?.rating_count ?? ratingSource?.vote_count ?? 0) || 0,
          user_rating: ratingSource?.ratings?.user_rating ?? baseMovie?.ratings?.user_rating ?? null,
        },
      });
    });

    return Array.from(byKey.values()).sort((a, b) => getMovieActivityTimestamp(b) - getMovieActivityTimestamp(a));
  }, [getMovieActivityTimestamp]);

  const applyForumFilters = useCallback((list = [], filtersObj = {}) => {
    const hasFilters = filtersObj.genres?.length || filtersObj.ratings?.length || filtersObj.years?.length;
    
    const filtered = list.filter((movie) => {
      const ratingValue = Number(movie?.ratings?.average_rating ?? movie?.vote_average ?? 0);
      const releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : null;
      const genreIds = movie?.genre_ids || [];

      // Filtro de géneros
      if (filtersObj.genres?.length) {
        const matchesGenre = filtersObj.genres.some((id) => genreIds.includes(id));
        if (!matchesGenre) return false;
      }

      // Filtro de calificaciones (múltiples ratings específicos, usar Math.round para decimales)
      if (filtersObj.ratings?.length) {
        const roundedRating = Math.round(ratingValue);
        const hasMatchingRating = filtersObj.ratings.some(rating => roundedRating === Number(rating));
        if (!hasMatchingRating) return false;
      }

      // Filtro de años (múltiples años)
      if (filtersObj.years?.length) {
        const hasMatchingYear = filtersObj.years.some(y => releaseYear === Number(y));
        if (!hasMatchingYear) return false;
      }

      return true;
    });

    const sortBy = filtersObj.sortBy || 'latest_activity.desc';
    const sorted = [...filtered].sort((a, b) => {
      const aRating = Number(a?.ratings?.average_rating ?? a?.vote_average ?? 0);
      const bRating = Number(b?.ratings?.average_rating ?? b?.vote_average ?? 0);
      const aYear = a?.release_date ? new Date(a.release_date).getFullYear() : 0;
      const bYear = b?.release_date ? new Date(b.release_date).getFullYear() : 0;
      const aTitle = (a?.title || '').toLowerCase();
      const bTitle = (b?.title || '').toLowerCase();
      const aActivity = getMovieActivityTimestamp(a);
      const bActivity = getMovieActivityTimestamp(b);

      switch (sortBy) {
        case 'popularity.desc':
          return bActivity - aActivity;
        case 'vote_average.desc':
          return bRating - aRating;
        case 'release_date.desc':
          return bYear - aYear;
        case 'release_date.asc':
          return aYear - bYear;
        case 'title.asc':
          return aTitle.localeCompare(bTitle);
        case 'title.desc':
          return bTitle.localeCompare(aTitle);
        default:
          return bActivity - aActivity;
      }
    });

    if (hasFilters) {
      console.log(`🔍 Filtered: ${sorted.length}/${list.length} movies`);
    }
    return sorted;
  }, [getMovieActivityTimestamp]);

  const refreshForumMovies = useCallback((sourceMovies, activeFilters = filters) => {
    const normalized = normalizeForumMovies(sourceMovies);
    setForumMovies(normalized);
    setMovies(applyForumFilters(normalized, activeFilters));
  }, [applyForumFilters, filters, normalizeForumMovies]);

  const checkTmdbMoviesRatings = useCallback(async (movies = []) => {
    console.log('🔍 Verificando calificaciones de películas TMDB...');
    
    // Verificar cada película individualmente usando el endpoint de reseñas
    const moviesWithRatings = await Promise.all(
      movies.map(async (movie) => {
        try {
          // Intentar cargar las reseñas para verificar si la película existe en la base de datos
          const response = await api.get(`/movie-forum/movies/${movie.id}/reviews`, {
            params: { page: 1, per_page: 1 } // Solo cargar 1 reseña para verificar
          });
          
          const reviews = response.data.reviews || [];
          
          if (reviews.length > 0 || response.data.total_count > 0) {
            // La película existe y tiene reseñas, intentar cargar sus datos completos
            try {
              const movieResponse = await api.get(`/movie-forum/movies/${movie.id}`);
              const movieData = movieResponse.data.movie;
              
              if (movieData && movieData.ratings) {
                console.log(`✅ Película ${movie.id} encontrada con calificaciones:`, movieData.ratings);
                return {
                  ...movie,
                  ratings: {
                    ...(movie.ratings || {}),
                    average_rating: movieData.ratings.average_rating,
                    rating_count: movieData.ratings.rating_count || 0,
                    user_rating: movieData.ratings.user_rating,
                  },
                  reviews_count: movieData.reviews_count || movieData.review_count || response.data.total_count || 0,
                  review_count: movieData.review_count || movieData.reviews_count || response.data.total_count || 0,
                };
              }
            } catch (movieError) {
              console.log(`Película ${movie.id} tiene reseñas pero no se pudieron cargar los datos completos`);
              // Al menos tiene reseñas, mostrar el conteo
              return {
                ...movie,
                ratings: {
                  ...(movie.ratings || {}),
                  rating_count: response.data.total_count || reviews.length,
                },
                reviews_count: response.data.total_count || reviews.length,
                review_count: response.data.total_count || reviews.length,
              };
            }
          }
        } catch (error) {
          // La película no existe en la base de datos o no tiene reseñas
          console.log(`Película ${movie.id} no encontrada en la base de datos (sin reseñas)`);
        }

        // Sin calificaciones de usuarios, mostrar solo calificación TMDB sin conteos
        const avg = Number(movie?.vote_average ?? 0);
        return {
          ...movie,
          ratings: {
            ...(movie.ratings || {}),
            average_rating: avg > 0 ? avg : null,
            rating_count: 0,
          },
          reviews_count: 0,
          review_count: 0,
        };
      })
    );

    return moviesWithRatings;
  }, []);

  const normalizeApiMovieRatings = useCallback((list = []) => {
    return list.map((movie) => {
      const avg = Number(movie?.ratings?.average_rating ?? movie?.vote_average ?? 0);
      const hasValidRating = Number.isFinite(avg) && avg > 0;
      
      // Verificar si ya tiene calificaciones de usuarios en la base de datos
      const hasUserRatings = movie?.ratings?.rating_count > 0 || movie?.reviews_count > 0 || movie?.review_count > 0;

      return {
        ...movie,
        ratings: {
          ...(movie.ratings || {}),
          average_rating: hasUserRatings ? movie?.ratings?.average_rating : (hasValidRating ? avg : null),
          rating_count: hasUserRatings ? movie?.ratings?.rating_count : 0,
        },
        reviews_count: hasUserRatings ? (movie?.reviews_count || movie?.review_count) : 0,
        review_count: hasUserRatings ? (movie?.review_count || movie?.reviews_count) : 0,
      };
    });
  }, []);

  // Effects and animations
  useEffect(() => {
    // Set status bar for dark theme
    StatusBar.setBarStyle('light-content');
    
    loadGenres();
    // Al entrar al tab, mostrar contenido real del foro
    setSearchMode('forum');
    loadMovies({ reset: true });
    
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(listSlideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
        delay: 200,
      }),
    ]).start();
    
    // Mark refs used by search guard logic
    prevFiltersRef.current = {};
    prevQueryRef.current = '';
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Solo recargar si no hay búsqueda activa ni filtros
      if (!searchQuery.trim() && !hasActiveFilters(filters)) {
        setSearchMode('forum');
        loadMovies({ reset: true });
      }
    }, [searchQuery, filters, hasActiveFilters, loadMovies])
  );

  // Debounced search function
  const performSearch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      console.log('⏱️ Executing debounced search');
      executeSearch(searchQuery, filters);
    }, 1500);
  }, [searchQuery, filters]);

  // Execute search immediately (no debounce)
  const executeSearch = useCallback(async (query = searchQuery, filtersObj = filters) => {
    console.log('🔍 SEARCH START - Query:', query, 'Filters:', filtersObj);

    // Sin query ni filtros de género: filtrar localmente el contenido del foro
    if (!shouldUseTmdbSearch(query, filtersObj)) {
      setSearchMode('forum');
      setTmdbPage(1);
      setTmdbFinished(false);

      // Si aún no hay cache local del foro, recargar desde backend.
      if (forumMovies.length === 0 && !isLoadingForumMoviesRef.current) {
        await loadMovies({ reset: true });
      } else {
        setMovies(applyForumFilters(forumMovies, filtersObj));
      }
      return;
    }
    
    try {
      setSearchMode('tmdb');
      setLoading(true);
      
      // Buscar en TMDB
      let response;
      if (query.trim()) {
        response = await tmdbSearchService.searchMovies(query, 1, filtersObj);
      } else {
        response = await tmdbSearchService.getPopularMovies(1, filtersObj);
      }
      
      let tmdbMovies = response.movies || [];
      console.log('✅ Got', tmdbMovies.length, 'movies from TMDB');
      
      // También buscar películas coincidentes en la base de datos local PRIMERO
      let localMovies = [];
      if (query.trim()) {
        console.log('🔍 Searching in forumMovies for:', query);
        console.log('🔍 Total forumMovies available:', forumMovies.length);
        
        // Mostrar algunas películas de ejemplo para depuración
        console.log('🔍 Sample forumMovies:', forumMovies.slice(0, 3).map(m => ({ id: m.id, title: m.title })));
        
        // Filtrar películas del foro que coincidan con la búsqueda
        localMovies = forumMovies.filter(movie => {
          const matches = movie.title && movie.title.toLowerCase().includes(query.toLowerCase());
          if (matches) {
            console.log('✅ Found local movie:', { id: movie.id, title: movie.title, ratings: movie.ratings });
          }
          return matches;
        });
        console.log('✅ Found', localMovies.length, 'movies from local database');
      }
      
      // Verificar si las películas TMDB ya tienen calificaciones SOLO para las que no están en local
      const localTmdbIds = new Set(localMovies.map(m => m.id));
      let tmdbOnlyMovies = tmdbMovies.filter(m => !localTmdbIds.has(m.id));
      
      if (tmdbOnlyMovies.length > 0) {
        console.log('🔍 Checking TMDB-only movies for existing ratings:', tmdbOnlyMovies.length);
        const processedTmdbMovies = await checkTmdbMoviesRatings([...tmdbOnlyMovies]);
        const normalizedTmdbMovies = normalizeApiMovieRatings(processedTmdbMovies);
        
        // Reemplazar tmdbOnlyMovies con los resultados procesados
        tmdbOnlyMovies = normalizedTmdbMovies;
      }
      
      // Eliminar películas TMDB que tengan títulos similares a películas locales
      const localTitles = localMovies.map(m => m.title.toLowerCase());
      
      const filteredTmdbMovies = tmdbOnlyMovies.filter(tmdbMovie => {
        const tmdbTitleLower = tmdbMovie.title.toLowerCase();
        
        // Si el título de TMDB es similar a algún título local, eliminarlo
        const isDuplicate = localTitles.some(localTitle => {
          const cleanedLocalTitle = localTitle.replace(/[^a-z0-9]/g, '');
          const cleanedTmdbTitle = tmdbTitleLower.replace(/[^a-z0-9]/g, '');
          
          const match = localTitle.includes(tmdbTitleLower) || 
                        tmdbTitleLower.includes(localTitle) ||
                        cleanedLocalTitle === cleanedTmdbTitle ||
                        // Detectar traducciones comunes y similitud fonética
                        (localTitle === 'interstellar' && tmdbTitleLower === 'interestelar') ||
                        (localTitle === 'interestelar' && tmdbTitleLower === 'interstellar') ||
                        (localTitle === 'inception' && (tmdbTitleLower === 'origen' || tmdbTitleLower === 'el origen')) ||
                        (localTitle === 'origen' && (tmdbTitleLower === 'inception' || tmdbTitleLower === 'el inception')) ||
                        (localTitle === 'el origen' && tmdbTitleLower === 'inception') ||
                        (localTitle === 'inception' && tmdbTitleLower === 'el origen') ||
                        (localTitle === 'titanic' && tmdbTitleLower === 'titanic') ||
                        (localTitle === 'the conjuring' && (tmdbTitleLower === 'the conjuring' || tmdbTitleLower === 'actividad paranormal')) ||
                        // Comparación de similitud (quitar vocales para comparación más flexible)
                        cleanedLocalTitle.replace(/[aeiou]/g, '') === cleanedTmdbTitle.replace(/[aeiou]/g, '');
          
          if (match) {
            console.log('🗑️ Removing TMDB duplicate:', tmdbMovie.title);
          }
          return match;
        });
        
        return !isDuplicate;
      });
      
      // Combinar resultados: películas locales (con sus calificaciones) + películas TMDB filtradas
      let combinedMovies = [...localMovies, ...filteredTmdbMovies];
      
      console.log('🔍 Before filtering - Combined movies:', combinedMovies.map(m => ({
        id: m.id,
        title: m.title,
        source: localMovies.find(l => l.id === m.id) ? 'local' : 'tmdb',
        average_rating: m.ratings?.average_rating,
        rating_count: m.ratings?.rating_count
      })));
      
      // Always filter out movies with no valid rating
      combinedMovies = combinedMovies.filter((movie) => Number(movie?.ratings?.average_rating) > 0);
      
      console.log('🔍 After filtering - Combined movies:', combinedMovies.map(m => ({
        id: m.id,
        title: m.title,
        source: localMovies.find(l => l.id === m.id) ? 'local' : 'tmdb',
        average_rating: m.ratings?.average_rating,
        rating_count: m.ratings?.rating_count
      })));

      // Aplicar filtro de calificaciones client-side (usar Math.round para comparar decimales con enteros)
      if (filtersObj.ratings?.length) {
        combinedMovies = combinedMovies.filter((movie) => 
          filtersObj.ratings.some(r => Math.round(Number(movie?.ratings?.average_rating)) === Number(r))
        );
      }

      // Aplicar filtro de años client-side
      if (filtersObj.years?.length) {
        combinedMovies = combinedMovies.filter((movie) => {
          const movieYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : null;
          return filtersObj.years.some(y => movieYear === Number(y));
        });
      }

      // Aplicar ordenamiento client-side
      const sortBy = filtersObj.sortBy || 'popularity.desc';
      combinedMovies = [...combinedMovies].sort((a, b) => {
        const aRating = Number(a?.ratings?.average_rating ?? a?.vote_average ?? 0);
        const bRating = Number(b?.ratings?.average_rating ?? b?.vote_average ?? 0);
        const aYear = a?.release_date ? new Date(a.release_date).getFullYear() : 0;
        const bYear = b?.release_date ? new Date(b.release_date).getFullYear() : 0;
        const aTitle = (a?.title || '').toLowerCase();
        const bTitle = (b?.title || '').toLowerCase();
        const aActivity = getMovieActivityTimestamp(a);
        const bActivity = getMovieActivityTimestamp(b);

        switch (sortBy) {
          case 'popularity.desc':
            return bActivity - aActivity;
          case 'vote_average.desc':
            return bRating - aRating;
          case 'release_date.desc':
            return bYear - aYear;
          case 'release_date.asc':
            return aYear - bYear;
          case 'title.asc':
            return aTitle.localeCompare(bTitle);
          case 'title.desc':
            return bTitle.localeCompare(aTitle);
          default:
            return bActivity - aActivity;
        }
      });

      console.log('✅ After filtering and combining:', combinedMovies.length, 'movies');
      
      setMovies(combinedMovies);
      setTmdbPage(2);
      setTmdbFinished(tmdbMovies.length < 20);
    } catch (error) {
      console.error('❌ Search error:', error);
      showError('Error', 'No se pudieron buscar las películas');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, showError, hasActiveFilters, forumMovies, applyForumFilters, shouldUseTmdbSearch, normalizeApiMovieRatings, checkTmdbMoviesRatings, loadMovies]);

  // Load genres on mount
  const loadGenres = useCallback(async () => {
    try {
      const response = await tmdbSearchService.getGenres();
      setGenres(response.genres || []);
    } catch (error) {
      // Silently fail - genres loading error
    }
  }, []);

  
  
  const loadReviewCounts = useCallback(async (movies) => {
    // El backend ya devuelve review_count/rating_count y latest_activity_at.
    // Evitar requests por película para no disparar límites de TMDB/API.
    return movies.map((movie) => ({
      ...movie,
      reviews_count: movie.review_count ?? movie.reviews_count ?? movie.ratings?.rating_count ?? 0,
    }));
  }, []);

  // Data loading functions
  const loadMovies = useCallback(async ({ reset = false } = {}) => {
    if (isLoadingForumMoviesRef.current) {
      return;
    }

    try {
      isLoadingForumMoviesRef.current = true;
      if (reset) {
        setLoading(true);
        setPage(1);
        setFinished(false);
        forumPageRef.current = 1;
      } else {
        setIsFetchingMore(true);
      }

      const p = reset ? 1 : forumPageRef.current;
      const response = await movieForumService.getMovies(p, 20);
      const fetched = response.movies || [];

      // Cargar conteos reales de reseñas
      const moviesWithCounts = await loadReviewCounts(fetched);
      const normalizedMovies = normalizeForumMovies(moviesWithCounts);

      if (reset) {
        refreshForumMovies(normalizedMovies, filters);
      } else {
        const merged = normalizeForumMovies([...forumMovies, ...moviesWithCounts]);
        refreshForumMovies(merged, filters);
      }

      if (fetched.length < 20) {
        setFinished(true);
      }

      if (fetched.length > 0) {
        setPage(p + 1);
        forumPageRef.current = p + 1;
      }
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
      isLoadingForumMoviesRef.current = false;
    }
  }, [loadReviewCounts, normalizeForumMovies, refreshForumMovies, forumMovies, filters]);

  const handleRefresh = useCallback(async () => {
    if (isLoadingForumMoviesRef.current) {
      return;
    }

    setRefreshing(true);
    try {
      if (searchMode === 'forum' && !shouldUseTmdbSearch(searchQuery, filters)) {
        await loadMovies({ reset: true });
      } else {
        await executeSearch(searchQuery, filters);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      showError('Error', 'No se pudo recargar la lista');
    } finally {
      setRefreshing(false);
    }
  }, [searchMode, searchQuery, filters, executeSearch, shouldUseTmdbSearch, loadMovies, showError]);

  const handleLoadMore = useCallback(async () => {
    if (searchMode === 'forum' && !shouldUseTmdbSearch(searchQuery, filters)) {
      if (!finished && !isFetchingMore && !isLoadingForumMoviesRef.current) {
        await loadMovies({ reset: false });
      }
      return;
    }

    if (!tmdbFinished && !isFetchingMore) {
      console.log('Loading more - page:', tmdbPage);
      setIsFetchingMore(true);
      
      try {
        let response;
        if (searchQuery.trim()) {
          response = await tmdbSearchService.searchMovies(searchQuery, tmdbPage, filters);
        } else {
          response = await tmdbSearchService.getPopularMovies(tmdbPage, filters);
        }
        
        const fetched = response.movies || [];
        console.log('TMDB returned more:', fetched.length, 'movies');

        // Verificar si las películas TMDB ya tienen calificaciones en la base de datos
        let normalizedFetched = await checkTmdbMoviesRatings(fetched);
        normalizedFetched = normalizeApiMovieRatings(normalizedFetched)
          .filter((movie) => Number(movie?.ratings?.average_rating) > 0);

        if (filters.ratings?.length) {
          normalizedFetched = normalizedFetched.filter((movie) => 
            filters.ratings.some(r => Math.round(Number(movie?.ratings?.average_rating)) === Number(r))
          );
        }

        if (filters.years?.length) {
          normalizedFetched = normalizedFetched.filter((movie) => {
            const movieYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : null;
            return filters.years.some(y => movieYear === Number(y));
          });
        }

        // Aplicar ordenamiento client-side
        const sortBy = filters.sortBy || 'popularity.desc';
        normalizedFetched = [...normalizedFetched].sort((a, b) => {
          const aRating = Number(a?.ratings?.average_rating ?? a?.vote_average ?? 0);
          const bRating = Number(b?.ratings?.average_rating ?? b?.vote_average ?? 0);
          const aYear = a?.release_date ? new Date(a.release_date).getFullYear() : 0;
          const bYear = b?.release_date ? new Date(b.release_date).getFullYear() : 0;
          const aTitle = (a?.title || '').toLowerCase();
          const bTitle = (b?.title || '').toLowerCase();
          const aActivity = getMovieActivityTimestamp(a);
          const bActivity = getMovieActivityTimestamp(b);

          switch (sortBy) {
            case 'popularity.desc':
              return bActivity - aActivity;
            case 'vote_average.desc':
              return bRating - aRating;
            case 'release_date.desc':
              return bYear - aYear;
            case 'release_date.asc':
              return aYear - bYear;
            case 'title.asc':
              return aTitle.localeCompare(bTitle);
            case 'title.desc':
              return bTitle.localeCompare(aTitle);
            default:
              return bActivity - aActivity;
          }
        });

        setMovies((prev) => [...prev, ...normalizedFetched]);
        
        if (normalizedFetched.length < 20) {
          setTmdbFinished(true);
        } else {
          setTmdbPage(prev => prev + 1);
        }
      } catch (error) {
        console.error('Load more error:', error);
        showError('Error', 'No se pudieron cargar más películas');
      } finally {
        setIsFetchingMore(false);
      }
    }
  }, [searchMode, searchQuery, filters, hasActiveFilters, finished, isFetchingMore, loadMovies, tmdbFinished, tmdbPage, showError, shouldUseTmdbSearch, normalizeApiMovieRatings, checkTmdbMoviesRatings]);

  // Search functionality - simplified
  const handleSearch = useCallback(async () => {
    console.log('handleSearch called');
    executeSearch(searchQuery, filters);
  }, [searchQuery, filters, executeSearch]);

  const handleFiltersChange = useCallback((newFilters) => {
    filtersRef.current = newFilters;
    setFilters(newFilters);
    
    if (!shouldUseTmdbSearch(searchQuery, newFilters)) {
      setSearchMode('forum');
      setTmdbPage(1);
      setTmdbFinished(false);
      
      if (forumMovies.length > 0) {
        setMovies(applyForumFilters(forumMovies, newFilters));
      } else {
        loadMovies({ reset: true });
      }
      return;
    }

    executeSearch(searchQuery, newFilters);
  }, [searchQuery, executeSearch, forumMovies, applyForumFilters, shouldUseTmdbSearch, loadMovies]);

  const handleClearSearch = useCallback(async () => {
    setSearchQuery('');
    filtersRef.current = {};
    setFilters({});
    setSearchMode('forum');
    setTmdbPage(1);
    setTmdbFinished(false);
    await loadMovies({ reset: true });
  }, [loadMovies]);

  const handleRefreshWithFilters = useCallback(async () => {
    console.log('🔄 Refreshing - clearing all filters and starting fresh');
    setSearchQuery('');
    filtersRef.current = {};
    setFilters({});
    setSearchMode('forum');
    setTmdbPage(1);
    setTmdbFinished(false);
    await loadMovies({ reset: true });
  }, [loadMovies]);

  const searchTmdbMovies = useCallback(async ({ reset = false } = {}) => {
    try {
      const pageNum = reset ? 1 : tmdbPage;
      let response;

      console.log('Searching TMDB - query:', searchQuery, 'filters:', filters, 'page:', pageNum, 'reset:', reset);

      if (searchQuery.trim()) {
        // Search by query
        response = await tmdbSearchService.searchMovies(searchQuery, pageNum, filters);
      } else {
        // Get popular movies with filters
        response = await tmdbSearchService.getPopularMovies(pageNum, filters);
      }

      const fetched = response.movies || [];
      console.log('TMDB returned:', fetched.length, 'movies');

      // Verificar si las películas TMDB ya tienen calificaciones en la base de datos
      let normalizedFetched = await checkTmdbMoviesRatings(fetched);
      normalizedFetched = normalizeApiMovieRatings(normalizedFetched)
        .filter((movie) => Number(movie?.ratings?.average_rating) > 0);

      if (filters.ratings?.length) {
        normalizedFetched = normalizedFetched.filter((movie) => 
          filters.ratings.some(r => Math.round(Number(movie?.ratings?.average_rating)) === Number(r))
        );
      }

      if (filters.years?.length) {
        normalizedFetched = normalizedFetched.filter((movie) => {
          const movieYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : null;
          return filters.years.some(y => movieYear === Number(y));
        });
      }

      // Aplicar ordenamiento client-side
      const sortBy = filters.sortBy || 'popularity.desc';
      normalizedFetched = [...normalizedFetched].sort((a, b) => {
        const aRating = Number(a?.ratings?.average_rating ?? a?.vote_average ?? 0);
        const bRating = Number(b?.ratings?.average_rating ?? b?.vote_average ?? 0);
        const aYear = a?.release_date ? new Date(a.release_date).getFullYear() : 0;
        const bYear = b?.release_date ? new Date(b.release_date).getFullYear() : 0;
        const aTitle = (a?.title || '').toLowerCase();
        const bTitle = (b?.title || '').toLowerCase();
        const aActivity = getMovieActivityTimestamp(a);
        const bActivity = getMovieActivityTimestamp(b);

        switch (sortBy) {
          case 'popularity.desc':
            return bActivity - aActivity;
          case 'vote_average.desc':
            return bRating - aRating;
          case 'release_date.desc':
            return bYear - aYear;
          case 'release_date.asc':
            return aYear - bYear;
          case 'title.asc':
            return aTitle.localeCompare(bTitle);
          case 'title.desc':
            return bTitle.localeCompare(aTitle);
          default:
            return bActivity - aActivity;
        }
      });

      if (reset) {
        setMovies(normalizedFetched);
      } else {
        setMovies((prev) => [...prev, ...normalizedFetched]);
      }

      if (normalizedFetched.length < 20 || pageNum >= (response.meta?.total_pages || 1)) {
        setTmdbFinished(true);
      }

      if (normalizedFetched.length > 0 && !reset) {
        setTmdbPage(prev => prev + 1);
      }
    } catch (error) {
      console.error('TMDB search error:', error);
      showError('Error', 'No se pudieron buscar las películas');
      if (reset) setMovies([]);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  }, [searchQuery, filters, tmdbPage, showError, normalizeApiMovieRatings, checkTmdbMoviesRatings]);

  const handleMoviePress = useCallback((movie) => {
    if (searchMode === 'forum') {
      // En modo foro usar el ID local real para cargar reseñas correctas.
      navigation.navigate('MovieReviews', {
        movieId: movie.id,
        movieTitle: movie.title,
      });
      return;
    }

    // En resultados de API/TMDB navegar con datos TMDB.
    navigation.navigate('MovieReviews', {
      movieId: null,
      movieTitle: movie.title,
      tmdbId: movie.id,
      movieData: movie,
    });
  }, [navigation, searchMode]);

  // Render functions
  const renderMovieItem = useCallback(({ item }) => (
    <MovieForumMovieCard
      movie={item}
      onPress={() => handleMoviePress(item)}
      onWriteReview={() => {
        if (searchMode === 'forum') {
          navigation.navigate('MovieReviews', {
            movieId: item.id,
            movieTitle: item.title,
          });
          return;
        }

        navigation.navigate('MovieReviews', {
          movieId: null,
          movieTitle: item.title,
          tmdbId: item.id,
          movieData: item,
        });
      }}
    />
  ), [handleMoviePress, navigation, searchMode]);

  // Loading states
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <LinearGradient
          colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
          style={styles.gradient}
        >
          <View style={styles.loadingContainer}>
            <View style={styles.loadingIcon}>
              <Icon name="film" size={48} color="#FFD700" />
            </View>
            <Text style={styles.loadingTitle}>Cargando películas...</Text>
            <Text style={styles.loadingSubtitle}>Prepárate para descubrir reseñas de cine</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Empty state
  if (movies.length === 0 && !loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
        <LinearGradient
          colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
          style={styles.gradient}
        >
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Icon name="film" size={64} color="#FFD700" />
            </View>
            <Text style={styles.emptyTitle}>No se encontraron películas</Text>
            <Text style={styles.emptySubtitle}>
              Intenta con otra búsqueda o recarga la página
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefreshWithFilters}
              disabled={refreshing}
            >
              <Text style={styles.refreshButtonText}>Recargar</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a0a" />
      <LinearGradient
        colors={['#0a0a0a', '#1a1a1a', '#0f0f0f']}
        style={styles.gradient}
      >
        {/* Search and Filters */}
        <MovieSearchFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          genres={genres}
          onSearch={handleSearch}
          searchQuery={searchQuery}
          onSearchQueryChange={handleSearchQueryChange}
        />
        {/* Background decorative elements */}
        <View style={styles.backgroundPattern} pointerEvents="none">
          <View style={[styles.patternDot, { top: '15%', left: '20%' }]} />
          <View style={[styles.patternDot, { top: '25%', right: '15%' }]} />
          <View style={[styles.patternDot, { top: '45%', left: '25%' }]} />
          <View style={[styles.patternDot, { top: '70%', right: '25%' }]} />
          <View style={[styles.patternDot, { top: '85%', left: '15%' }]} />
        </View>

        {/* Header */}
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          <View style={styles.headerContent}>
            <View style={styles.headerBadge}>
              <Icon name="film" size={16} color="#0a0a0a" />
              <Text style={styles.headerBadgeText}>FORO DE PELÍCULAS</Text>
            </View>
            <Text style={styles.headerTitle}>
            Explorar Películas
          </Text>
            <Text style={styles.headerSubtitle}>
              Descubre películas y comparte tus reseñas
            </Text>
          </View>
        </Animated.View>

        {/* Movies list */}
        <Animated.View
          style={[
            styles.listContainer,
            {
              transform: [{ translateY: listSlideAnim }]
            }
          ]}
        >
          <FlatList
            data={movies}
            renderItem={renderMovieItem}
            keyExtractor={(item) => `movie-${item.id}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListFooterComponent={
              isFetchingMore ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator size="small" color="#FFD700" />
                  <Text style={styles.listFooterText}>Cargando más...</Text>
                </View>
              ) : null
            }
          />
        </Animated.View>
      </LinearGradient>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
          </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  // Layout and container styles
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  gradient: {
    flex: 1,
  },

  // Background pattern
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },

  // Header styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
    gap: 16,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0a0a0a',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },

  // List container
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 120,
    gap: 16,
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  listFooterText: {
    fontSize: 14,
    color: '#999',
    fontWeight: '600',
  },

  // Loading state
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingIcon: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  refreshButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  refreshButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a0a',
    letterSpacing: 0.5,
  },

  // Review modal styles
  reviewModalContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
  },
  reviewModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    textAlign: 'center',
    flex: 1,
  },
  replyingToContainer: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  replyingToLabel: {
    fontSize: 11,
    color: '#999',
    fontWeight: '600',
    marginBottom: 4,
  },
  replyingToText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
    lineHeight: 16,
  },
  reviewTextInput: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 11,
    color: '#999',
    textAlign: 'right',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0a0a0a',
  },

  // Movie detail modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  movieDetailContainer: {
    backgroundColor: 'rgba(26, 26, 26, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 10,
    borderRadius: 12,
  },
  movieDetailHeader: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 50,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  movieDetailPoster: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  movieDetailPosterPlaceholder: {
    width: 80,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  posterPlaceholderText: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'center',
  },
  movieDetailInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieDetailTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 4,
    lineHeight: 22,
  },
  movieDetailYear: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 8,
  },
  movieDetailStats: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addReviewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  reviewsScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    minHeight: 200,
  },
  reviewsContainer: {
    paddingVertical: 12,
  },
  loadingReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  loadingReviewsText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '700',
    marginBottom: 4,
  },
  loadingReviewsSubtext: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
  noReviewsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 16,
  },
  noReviewsText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#999',
    marginBottom: 8,
  },
  noReviewsSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  firstReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  firstReviewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a0a0a',
  },
  reviewsHeader: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  reviewsHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
    marginBottom: 4,
  },
  reviewsHeaderSubtitle: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
  },
  loadMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadMoreText: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
});

export default MovieForumScreen;
