import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
  ScrollView,
  Dimensions,
  Image,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Icon from 'react-native-vector-icons/FontAwesome5';

import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { movieForumService } from '../services/movieForumService';
import { tmdbSearchService } from '../services/tmdbSearchService';
import ReviewCard from '../components/ReviewCard';
import RatingSelector from '../components/RatingSelector';
import CustomAlert from '../components/CustomAlert';
import useCustomAlert from '../hooks/useCustomAlert';
import { API_URL } from '../config/api';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const MovieReviewsScreen = ({ route, navigation }) => {
  // Get movie info from route params
  const { movieId, movieTitle, tmdbId, movieData } = route.params;

  // Context and hooks
  const { colors, resolvedTheme } = useTheme();
  const authContext = useAuth();
  const { user } = authContext;
  
    const { alertConfig, showSuccess, showError, showWarning, showInfo, showConfirm, hideAlert } = useCustomAlert();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // State management
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [page, setPage] = useState(1);
  const [finished, setFinished] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Rating state
  const [userRating, setUserRating] = useState(null);
  const [averageRating, setAverageRating] = useState(null);
  const [ratingCount, setRatingCount] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [isTmdbMovie, setIsTmdbMovie] = useState(false);

  // Review states
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [resolvedMovieId, setResolvedMovieId] = useState(movieId || tmdbId || null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const isLoadingReviewsRef = useRef(false);
  const reviewsRequestIdRef = useRef(0);

  const mergeUniqueReviews = useCallback((currentReviews, incomingReviews) => {
    const seen = new Set();
    return [...currentReviews, ...incomingReviews].filter((review) => {
      const key = review?.id;
      if (key == null) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, []);

  // Effects and animations
  useEffect(() => {
    // Set status bar according to theme
    StatusBar.setBarStyle(resolvedTheme === 'light' ? 'dark-content' : 'light-content');
    
        
    if (tmdbId && movieData) {
      // Es una película de TMDB
      setIsTmdbMovie(true);
      loadTmdbMovieDetails();
    } else {
      // Es una película del foro
      setIsTmdbMovie(false);
      loadMovieDetails();
    }
    
    loadReviews({ reset: true });
    
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
    ]).start();
  }, []);

  // Data loading functions
  const loadMovieDetails = async () => {
    try {
      // Cargar detalles de película del foro
      const response = await fetch(`${API_URL}/movie-forum/movies/${movieId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const movieData = data.movie;
        setMovie(movieData);
        setResolvedMovieId(movieData.id);
        
        // Cargar calificaciones
        if (movieData.ratings) {
          setUserRating(movieData.ratings.user_rating);
          setAverageRating(movieData.ratings.average_rating);
          setRatingCount(movieData.ratings.rating_count);
        }
      }
    } catch (error) {
      console.error('Error loading movie details:', error);
    }
  };

  const loadTmdbMovieDetails = async () => {
    try {
      // Para películas de TMDB, usar los datos proporcionados
      setMovie({
        id: tmdbId,
        title: movieData.title,
        poster_path: movieData.poster_path,
        backdrop_path: movieData.backdrop_path,
        release_date: movieData.release_date,
        overview: movieData.overview,
        vote_average: movieData.vote_average,
        genre_ids: movieData.genre_ids || [],
      });
      
      // Verificar si ya está en el foro
      await checkIfInForum();
    } catch (error) {
      console.error('Error loading TMDB movie details:', error);
    }
  };

  const checkIfInForum = async () => {
    try {
      const response = await fetch(`${API_URL}/movie-forum/check-tmdb-movie/${tmdbId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.exists) {
          // Ya está en el foro, cargar calificaciones
          setResolvedMovieId(data.movie_id);
          setUserRating(data.ratings.user_rating);
          setAverageRating(data.ratings.average_rating);
          setRatingCount(data.ratings.rating_count);
        }
      }
    } catch (error) {
      console.error('Error checking if movie in forum:', error);
    }
  };

  const calculateNewAverage = (currentAverage, currentCount, newRating, oldRating = null) => {
    const count = currentCount || 0;
    
    if (oldRating !== null) {
      // Usuario está actualizando su calificación
      const totalSum = (currentAverage * count) - oldRating + newRating;
      return totalSum / count;
    } else {
      // Nueva calificación
      const totalSum = (currentAverage * count) + newRating;
      return totalSum / (count + 1);
    }
  };

  const formatReleaseDate = (releaseDate) => {
    if (!releaseDate) return null;
    
    // Si ya está en formato YYYY-MM-DD, verificar que sea válido
    if (typeof releaseDate === 'string' && releaseDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(releaseDate);
      // Verificar que la fecha sea válida (no "Invalid Date")
      return isNaN(date.getTime()) ? null : releaseDate;
    }
    
    // Si es un año (ej: "2016"), convertir a YYYY-01-01
    if (typeof releaseDate === 'string' && releaseDate.match(/^\d{4}$/)) {
      return `${releaseDate}-01-01`;
    }
    
    // Intentar crear fecha a partir del string
    try {
      const date = new Date(releaseDate);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      }
    } catch (error) {
      console.warn('Invalid date format:', releaseDate);
    }
    
    return null;
  };

  const loadMovieRatings = async () => {
    try {
      let targetMovieId = resolvedMovieId || movieId || tmdbId;
      
      // Si es película TMDB, verificar si ya está en el foro
      if (isTmdbMovie) {
        const checkResponse = await fetch(`${API_URL}/movie-forum/check-tmdb-movie/${tmdbId}`, {
          headers: {
            'Authorization': `Bearer ${user?.token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (checkResponse.ok) {
          const checkData = await checkResponse.json();
          if (checkData.exists) {
            targetMovieId = checkData.movie_id;
            setResolvedMovieId(checkData.movie_id);
          }
        }
      }
      
      // Cargar calificaciones actualizadas
      const response = await fetch(`${API_URL}/movie-forum/movies/${targetMovieId}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.movie && data.movie.ratings) {
          setUserRating(data.movie.ratings.user_rating);
          setAverageRating(data.movie.ratings.average_rating);
          setRatingCount(data.movie.ratings.rating_count);
          console.log('Calificaciones actualizadas:', {
            userRating: data.movie.ratings.user_rating,
            averageRating: data.movie.ratings.average_rating,
            ratingCount: data.movie.ratings.rating_count
          });
        }
      }
    } catch (error) {
      console.error('Error loading movie ratings:', error);
    }
  };

  const loadReviews = useCallback(async ({ reset = false } = {}) => {
    if (isLoadingReviewsRef.current && !reset) {
      return;
    }

    const requestId = ++reviewsRequestIdRef.current;

    try {
      if (reset) {
        isLoadingReviewsRef.current = true;
        setLoadingReviews(true);
        setPage(1);
        setFinished(false);
      } else {
        setIsFetchingMore(true);
      }

      const p = reset ? 1 : page;
      let targetMovieId = resolvedMovieId || movieId || tmdbId;
      console.log('Cargando reseñas para película:', targetMovieId, 'página:', p);
      
      const response = await movieForumService.getMovieReviews(targetMovieId, p, 20);
      console.log('Respuesta del servicio:', response);

      if (requestId !== reviewsRequestIdRef.current) {
        return;
      }
      
      const fetched = response.reviews || [];
      console.log('Reseñas obtenidas:', fetched.length, fetched);

      if (reset) {
        setReviews(mergeUniqueReviews([], fetched));
        setPage(2);
        console.log('Reseñas cargadas (reset):', fetched.length);
      } else {
        setReviews((prev) => {
          const newReviews = mergeUniqueReviews(prev, fetched);
          console.log('Reseñas actualizadas:', newReviews.length);
          return newReviews;
        });
        setPage(p + 1);
      }

      if (fetched.length < 20) {
        setFinished(true);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
      showError('Error', 'No se pudieron cargar las reseñas');
    } finally {
      setLoadingReviews(false);
      setIsFetchingMore(false);
      setLoading(false);
      isLoadingReviewsRef.current = false;
    }
  }, [movieId, tmdbId, resolvedMovieId, page, mergeUniqueReviews]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReviews({ reset: true });
    setRefreshing(false);
  }, [loadReviews]);

  const handleLoadMore = useCallback(() => {
    if (!finished && !isFetchingMore && !loadingReviews && !refreshing && !isLoadingReviewsRef.current) {
      loadReviews({ reset: false });
    }
  }, [finished, isFetchingMore, loadingReviews, refreshing, loadReviews]);

  const handleRatingChange = useCallback(async (rating) => {
    // Verificación usando el token del almacenamiento
    const token = await storage.getToken();
    if (!user || !token) {
      showWarning('Requiere autenticación', 'Debes iniciar sesión para calificar películas');
      return;
    }

    try {
      setIsSubmittingRating(true);
      
      let targetMovieId = resolvedMovieId || movieId || tmdbId;
      
      if (isTmdbMovie) {
        // Para películas de TMDB, usar directamente el tmdbId como targetMovieId
        // sin intentar agregarla al foro primero (evita error 404)
        targetMovieId = tmdbId;
        
        // Simulación local para pruebas (ya que el endpoint add-tmdb-movie da 404)
        console.log('Calificando película TMDB sin agregar al foro:', tmdbId);
      }
      
      // Calcular nuevo promedio inmediatamente para mejor UX
      const oldRating = userRating;
      const newAverage = calculateNewAverage(averageRating, ratingCount, rating, oldRating);
      const newCount = oldRating !== null ? ratingCount : (ratingCount + 1);
      
      // Actualizar UI inmediatamente
      setUserRating(rating);
      setAverageRating(newAverage);
      setRatingCount(newCount);
      
      // Para películas TMDB, intentar backend primero, luego simulación si da 404
      let backendWorked = true;
      try {
        await movieForumService.rateMovie(targetMovieId, rating);
        showSuccess('Éxito', 'Tu calificación ha sido guardada');
      } catch (error) {
        backendWorked = false;
        if (error.response?.status === 404 && isTmdbMovie) {
          console.log('Backend no actualizado, usando simulación temporal para película TMDB:', targetMovieId);
          showSuccess('Éxito', 'Tu calificación ha sido guardada (simulación temporal)');
        } else {
          throw error;
        }
      }
      
      // Recargar calificaciones solo si el backend funcionó
      if (backendWorked) {
        await loadMovieRatings();
      }
      
    } finally {
      setIsSubmittingRating(false);
    }
  }, [user, isTmdbMovie, movie, tmdbId, resolvedMovieId, showSuccess, showError]);

  const handleSubmitReview = useCallback(async () => {
    // Verificación usando el token del almacenamiento
    const token = await storage.getToken();
    if (!user || !token) {
      showWarning('Requiere autenticación', 'Debes iniciar sesión para publicar reseñas');
      return;
    }

    if (!reviewText.trim()) {
      showWarning('Aviso', 'Por favor escribe una reseña');
      return;
    }

    // Validación adicional para evitar errores 422
    if (reviewText.trim().length < 10) {
      showWarning('Aviso', 'La reseña debe tener al menos 10 caracteres');
      return;
    }

    if (reviewText.trim().length > 1000) {
      showWarning('Aviso', 'La reseña no puede exceder 1000 caracteres');
      return;
    }

    try {
      setSubmittingReview(true);
      
      // Limpiar el texto antes de enviar
      const cleanReviewText = reviewText.trim();
      const isReplySubmission = Boolean(replyingTo);
      const replyingToId = replyingTo?.id;
      let targetMovieId = resolvedMovieId || movieId || tmdbId;
      
      if (isTmdbMovie) {
        // Para películas de TMDB, usar directamente el tmdbId como targetMovieId
        // sin intentar agregarla al foro primero (evita error 404)
        targetMovieId = tmdbId;
        
        // Simulación local para pruebas (ya que el endpoint add-tmdb-movie da 404)
        console.log('Creando reseña para película TMDB sin agregar al foro:', tmdbId);
      }
      
      // Para películas TMDB, intentar backend primero, luego simulación si da 404
      let backendWorked = true;
      let createdReply = null;
      
      if (replyingTo) {
        try {
          const replyResponse = await movieForumService.replyToReview(replyingTo.id, cleanReviewText);
          createdReply = replyResponse?.reply || replyResponse;
          if (replyResponse?.movie_id) {
            setResolvedMovieId(replyResponse.movie_id);
          }
        } catch (error) {
          backendWorked = false;
          if (error.response?.status === 404 && isTmdbMovie) {
            console.log('Backend no actualizado, creando respuesta simulada temporal');
            // Crear respuesta simulada
            createdReply = {
              id: Date.now(),
              user: {
                id: user.id,
                name: user.name,
                profile_photo: user.profile_photo,
              },
              review: cleanReviewText,
              created_at: new Date().toISOString(),
              likes_count: 0,
              is_liked: false,
            };
          } else {
            throw error;
          }
        }
      } else {
        try {
          const createResponse = await movieForumService.createReview(targetMovieId, cleanReviewText);
          if (createResponse?.movie_id) {
            setResolvedMovieId(createResponse.movie_id);
          }
        } catch (error) {
          backendWorked = false;
          if (error.response?.status === 404 && isTmdbMovie) {
            console.log('Backend no actualizado, creando reseña simulada temporal:', targetMovieId);
            
            // Crear reseña simulada
            const simulatedReview = {
              id: Date.now(),
              user: {
                id: user.id,
                name: user.name,
                profile_photo: user.profile_photo,
              },
              review: cleanReviewText,
              rating: userRating || 0,
              created_at: new Date().toISOString(),
              likes_count: 0,
              is_liked: false,
              replies: [],
            };
            
            // Agregar al inicio de la lista de reseñas
            setReviews([simulatedReview, ...reviews]);
            showSuccess('Éxito', 'Tu reseña ha sido publicada (simulación temporal)');
          } else {
            throw error;
          }
        }
      }
      
      setReviewText('');
      setReplyingTo(null);
      
      if (isReplySubmission) {
        if (createdReply && replyingToId) {
          const normalizedReply = {
            id: createdReply.id || Date.now(),
            user: createdReply.user || {
              id: user.id,
              name: user.name,
              profile_photo: user.profile_photo,
            },
            review: createdReply.review || createdReply.reply || cleanReviewText,
            created_at: createdReply.created_at || new Date().toISOString(),
            likes_count: createdReply.likes_count || createdReply.reactions?.like_count || 0,
            is_liked: createdReply.is_liked || false,
            reactions: createdReply.reactions || {
              like_count: 0,
              dislike_count: 0,
              user_reaction: null,
            },
            reply_count: createdReply.reply_count || 0,
            replies: createdReply.replies || [],
          };

          setReviews((prevReviews) => prevReviews.map((review) => {
            if (review.id === replyingToId) {
              return {
                ...review,
                replies: [...(review.replies || []), normalizedReply],
                reply_count: (review.reply_count || 0) + 1,
              };
            }
            return review;
          }));
        }
      } else {
        // Forzar recarga de reseñas para mostrar la nueva reseña
        try {
          console.log('🔄 Recargando reseñas después de crear...');
          await loadReviews({ reset: true });
          await loadMovieRatings();
        } catch (e) {
          console.log('Error al recargar reseñas:', e);
        }
      }
      
      showSuccess(
        'Éxito', 
        replyingTo ? 
          (backendWorked ? 'Respuesta publicada correctamente' : 'Respuesta publicada (simulación temporal)') :
          (backendWorked ? 'Reseña publicada correctamente' : 'Reseña publicada (simulación temporal)')
      );
    } finally {
      setSubmittingReview(false);
    }
  }, [movieId, tmdbId, resolvedMovieId, isTmdbMovie, movie, replyingTo, reviewText, loadReviews, loadMovieRatings, showSuccess, showError, showWarning, user, userRating]);

  const handleReplyPress = useCallback((review) => {
    setReplyingTo(review);
    setReviewText('');
    // Scroll to top to show the inline input
    // Focus the input field
  }, []);

  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle={resolvedTheme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
        <LinearGradient
            colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
            style={styles.gradient}
          >
          <View style={styles.header}>
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Icon name="chevron-left" size={20} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{movieTitle}</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFD700" />
            <Text style={styles.loadingText}>Cargando reseñas...</Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={resolvedTheme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <LinearGradient
        colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
        style={styles.gradient}
      >
        {/* Header */}
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <FontAwesomeIcon icon={faArrowLeft} size={20} color="#FFD700" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{movieTitle}</Text>
          <View style={styles.placeholder} />
        </Animated.View>

        {/* Movie info and actions */}
        <Animated.View style={[
          styles.movieInfoContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          {movie && (
            <View style={styles.movieInfo}>
              {movie.poster_path ? (
                <Image
                  source={{ uri: movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w200${movie.poster_path}` }}
                  style={styles.moviePoster}
                />
              ) : (
                <View style={styles.moviePosterPlaceholder}>
                  <Icon name="film" size={32} color={colors.primary} />
                </View>
              )}
              <View style={styles.movieDetails}>
                <Text style={styles.movieTitle}>{movie?.title || movieTitle}</Text>
                <Text style={styles.reviewCount}>{reviews.length} reseñas</Text>
              </View>
            </View>
          )}
          
          {/* Always show rating and review actions */}
          <View style={styles.actionButtonsContainer}>
            {/* Rating Selector */}
            <RatingSelector
              userRating={userRating}
              averageRating={averageRating}
              ratingCount={ratingCount}
              onRatingChange={handleRatingChange}
              disabled={isSubmittingRating}
              size="medium"
            />
            
            {/* Reply indication */}
            {replyingTo && (
              <View style={styles.replyingToContainer}>
                <View style={styles.replyingToHeader}>
                  <Text style={styles.replyingToLabel}>Respondiendo a:</Text>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <Icon name="times" size={16} color="#FFD700" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.replyingToText} numberOfLines={2}>
                  {replyingTo.review}
                </Text>
              </View>
            )}

            {/* Inline Review Input */}
            <View style={styles.inlineReviewContainer}>
              <TextInput
                style={styles.inlineReviewInput}
                placeholder="Escribe tu reseña..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={reviewText}
                onChangeText={setReviewText}
                maxLength={1000}
                editable={!submittingReview}
              />
              <View>
                <Text style={styles.characterCount}>
                  {reviewText.length}/1000
                </Text>
                
                <TouchableOpacity
                  style={[
                    styles.submitInlineButton,
                    (!reviewText.trim() || reviewText.trim().length < 10 || submittingReview) && 
                    styles.submitInlineButtonDisabled
                  ]}
                  onPress={() => handleSubmitReview()}
                  disabled={!reviewText.trim() || reviewText.trim().length < 10 || submittingReview}
                >
                  {submittingReview ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon name="paper-plane" size={14} color={colors.textDark} />
                      <Text style={styles.submitInlineButtonText}>
                        {replyingTo ? 'Responder' : 'Publicar'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.submitInlineButtonText}>
                      {reviewText.trim().length < 10 ? 'Mínimo 10 caracteres' : 'Publicar'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Reviews list */}
        <Animated.View style={[
          styles.reviewsContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          <FlatList
            data={reviews}
            renderItem={({ item }) => (
              <ReviewCard
                review={item}
                onReactionChange={() => loadReviews({ reset: true })}
                onReplyPress={handleReplyPress}
                onDeleteSuccess={() => loadReviews({ reset: true })}
              />
            )}
            keyExtractor={(item, index) => `review-${item.id}-${index}`}
            contentContainerStyle={styles.reviewsList}
            showsVerticalScrollIndicator={false}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={
              !loadingReviews ? (
                <View style={styles.emptyContainer}>
                  <Icon name="comment" size={48} color="#999" />
                  <Text style={styles.emptyText}>No hay reseñas aún</Text>
                  <Text style={styles.emptySubtext}>
                    ¡Sé el primero en opinar sobre "{movieTitle}"!
                  </Text>
                </View>
              ) : null
            }
            ListFooterComponent={
              isFetchingMore ? (
                <View style={styles.loadingMoreContainer}>
                  <ActivityIndicator size="small" color="#FFD700" />
                  <Text style={styles.loadingMoreText}>Cargando más...</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '600',
  },
  movieInfoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButtonsContainer: {
    gap: 16,
  },
  replyingToContainer: {
    backgroundColor: `${colors.primary}18`,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  replyingToHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  replyingToLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  replyingToText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 16,
  },
  inlineReviewContainer: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  inlineReviewInput: {
    fontSize: 16,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  reviewInputActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submitInlineButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitInlineButtonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitInlineButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  movieInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.overlayLight,
  },
  moviePosterPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  movieDetails: {
    flex: 1,
  },
  movieTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  reviewCount: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  addReviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  addReviewButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  reviewsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewsList: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textMuted,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 20,
  },
  loadingMoreText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
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
    color: colors.primary,
    textAlign: 'center',
    flex: 1,
  },
  modalReplyingToContainer: {
    backgroundColor: `${colors.primary}18`,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  modalReplyingToLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 4,
  },
  replyingToText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '500',
    lineHeight: 16,
  },
  reviewTextInput: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  characterCount: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'right',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: colors.primary,
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
    color: colors.textDark,
  },
});

export default MovieReviewsScreen;
