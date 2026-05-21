import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Modal,
  Animated,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl, IMAGE_SIZES } from '../config/tmdb';
import { userRatingService } from '../services/userRatingService';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.6;

const FlipCardReveal = ({ 
  movie, 
  isVisible, 
  onClose, 
  onShare,
  remainingRecommendations,
  onWatchedMovie,
  onReviews
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchCount, setScratchCount] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [ratingSource, setRatingSource] = useState('loading');
  
  // Animaciones
  const scratchOpacity = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Animación de giro
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  // Mapeo de moods a colores gradientes
  const moodGradients = {
    comedy: ['#FFD93D', '#FFB344'],
    horror: ['#2C1810', '#8B0000'],
    drama: ['#4A90E2', '#7B68EE'],
    action: ['#FF6B6B', '#FF8E53'],
    romance: ['#FF69B4', '#FFB6C1'],
    thriller: ['#434343', '#000000'],
    'sci-fi': ['#00D4FF', '#090979'],
    animation: ['#FF6B9D', '#FEC860'],
    default: ['#667eea', '#764ba2']
  };

  const gradientColors = moodGradients[movie?.mood] || moodGradients.default;

  // Debug logs
  useEffect(() => {
    console.log('FlipCardReveal renderizado:', {
      movie: movie?.title,
      isVisible,
      isRevealed,
      isFlipped,
      scratchCount
    });
  }, [movie, isVisible, isRevealed, isFlipped, scratchCount]);

  // Cargar calificación de usuarios cuando cambia la película
  useEffect(() => {
    if (movie && movie.id) {
      loadUserRating();
    }
  }, [movie]);

  const loadUserRating = async () => {
    try {
      setRatingSource('loading');
      console.log(`Cargando calificación de usuarios para película ID: ${movie.id}`);
      
      const rating = await userRatingService.getMovieRating(movie.id);
      
      if (rating !== null) {
        setUserRating(rating);
        setRatingSource('users');
        console.log(`Calificación de usuarios cargada: ${rating}`);
      } else {
        // Usar calificación de TMDB como fallback
        setUserRating(movie?.vote_average);
        setRatingSource('tmdb');
        console.log('Usando calificación TMDB como fallback');
      }
    } catch (error) {
      console.error('Error cargando calificación:', error);
      setUserRating(movie?.vote_average);
      setRatingSource('tmdb');
    }
  };

  const handleScratch = () => {
    if (isRevealed) return;
    
    const newCount = scratchCount + 1;
    setScratchCount(newCount);
    setIsScratching(true);
    
    console.log('Presionando - Count:', newCount);
    
    // Animación de presion
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true
      })
    ]).start(() => {
      setIsScratching(false);
    });
    
    // Revelar después de 5 presiones
    if (newCount >= 5) {
      console.log('Revelando película - 5 presiones completadas');
      handleReveal();
    }
  };

  const handleReveal = () => {
    console.log('Iniciando revelación de película');
    setIsRevealed(true);
    
    // Animación de revelado con giro
    Animated.timing(animatedValue, {
      toValue: 180,
      duration: 800,
      useNativeDriver: true
    }).start(() => {
      setIsFlipped(true);
    });
  };

  const handleFlip = () => {
    console.log('Girando tarjeta');
    Animated.spring(animatedValue, {
      toValue: isFlipped ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start(() => {
      setIsFlipped(!isFlipped);
    });
  };

  const handleShare = async () => {
    try {
      console.log('Compartiendo película:', movie?.title);
      if (onShare) onShare(movie);
    } catch (error) {
      console.log('Error al compartir:', error);
    }
  };

  const handleWatched = () => {
    console.log('Marcando como vista:', movie?.title);
    if (onWatchedMovie) {
      onWatchedMovie(movie);
    }
    onClose();
  };

  const handleReviews = () => {
    console.log('Navegando a reseñas de:', movie?.title);
    if (onReviews) {
      onReviews(movie);
    }
  };

  if (!movie) {
    console.log('FlipCardReveal: No hay película para mostrar');
    return null;
  }

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Recomendación Diaria</Text>
            <View style={styles.counterContainer}>
              <Ionicons name="ticket" size={16} color="#FFD700" />
              <Text style={styles.counter}>
                {remainingRecommendations}/10 restantes
              </Text>
            </View>
          </View>

          {/* Tarjeta con animación de giro */}
          <View style={styles.cardContainer}>
            <Animated.View style={[styles.card, { transform: [{ rotateY: frontInterpolate }] }]}>
              {/* Frente de la tarjeta - Solo el póster */}
              <View style={styles.cardFront}>
                <Image
                  source={{ 
                    uri: movie?.poster_path 
                      ? getImageUrl(movie.poster_path, IMAGE_SIZES.poster.large)
                      : 'https://via.placeholder.com/300x450/cccccc/666666?text=No+Poster'
                  }}
                  style={styles.poster}
                  resizeMode="cover"
                />
                
                {/* Overlay con información básica */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.frontOverlay}
                >
                  <Text style={styles.frontTitle}>{movie?.title}</Text>
                  <Text style={styles.frontYear}>
                    {movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </Text>
                  <Text style={styles.frontRating}>
                    {ratingSource === 'loading' ? '  Cargando...' : 
                     userRating ? `  ${userRating.toFixed(1)}` : '  N/A'}
                  </Text>
                  <Text style={styles.ratingSource}>
                    {ratingSource === 'users' && ' (usuarios)'}
                    {ratingSource === 'tmdb' && ' (TMDB)'}
                  </Text>
                </LinearGradient>
              </View>
            </Animated.View>

            {/* Reverso de la tarjeta - Información completa */}
            <Animated.View style={[styles.card, styles.cardBack, { transform: [{ rotateY: backInterpolate }] }]}>
              <LinearGradient
                colors={gradientColors}
                style={styles.cardBack}
              >
                <View style={styles.backContent}>
                  <Text style={styles.backTitle}>{movie?.title}</Text>
                  <Text style={styles.backOverview}>
                    {movie?.overview || 'Sin descripción disponible.'}
                  </Text>
                  
                  <View style={styles.backMeta}>
                    <View style={styles.backMetaItem}>
                      <Text style={styles.backMetaLabel}>Año:</Text>
                      <Text style={styles.backMetaValue}>
                        {movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                      </Text>
                    </View>
                    
                    <View style={styles.backMetaItem}>
                      <Text style={styles.backMetaLabel}>Calificación:</Text>
                      <Text style={styles.backMetaValue}>
                        {ratingSource === 'loading' ? 'Cargando...' : 
                         userRating ? `${userRating.toFixed(1)}` : 'N/A'}
                      </Text>
                      <Text style={styles.backMetaSource}>
                        {ratingSource === 'users' && '(usuarios)'}
                        {ratingSource === 'tmdb' && '(TMDB)'}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Géneros */}
                  {movie?.genre_ids && movie.genre_ids.length > 0 && (
                    <View style={styles.genreContainer}>
                      <Text style={styles.genreLabel}>Géneros:</Text>
                      <Text style={styles.genreText}>
                        {getGenreNames(movie.genre_ids).join(', ')}
                      </Text>
                    </View>
                  )}
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Capa de "scratch" */}
            {!isRevealed && (
              <Animated.View
                style={[
                  styles.scratchLayer,
                  {
                    opacity: scratchOpacity,
                    transform: [{ scale: scaleAnim }]
                  }
                ]}
              >
                <LinearGradient
                  colors={gradientColors}
                  style={styles.scratchGradient}
                >
                  <TouchableOpacity 
                    style={styles.scratchTouchable}
                    onPress={handleScratch}
                    activeOpacity={0.8}
                  >
                    <View style={styles.scratchContent}>
                      <Ionicons 
                        name={isScratching ? "gift" : "gift-outline"} 
                        size={60} 
                        color={colors.text} 
                      />
                      <Text style={styles.scratchText}>
                        {isScratching ? '¡Sigue presionando!' : 'Presiona para revelar'}
                      </Text>
                      <Text style={styles.scratchSubtext}>
                        Toca {5 - scratchCount} veces más para descubrir
                      </Text>
                      
                      {/* Indicador de progreso */}
                      <View style={styles.scratchDots}>
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <View
                            key={dot}
                            style={[
                              styles.scratchDot,
                              dot <= scratchCount && styles.scratchDotActive
                            ]}
                          />
                        ))}
                      </View>
                      
                      <TouchableOpacity 
                        style={styles.revealButton}
                        onPress={handleReveal}
                      >
                        <Ionicons name="eye-outline" size={20} color={colors.text} />
                        <Text style={styles.revealButtonText}>Revelar ahora</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            )}
          </View>

          {/* Botón de flip para ver información completa */}
          {isRevealed && (
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={handleFlip}
            >
              <Ionicons name="sync-outline" size={20} color={colors.text} />
              <Text style={styles.flipButtonText}>Ver información completa</Text>
            </TouchableOpacity>
          )}

          {/* Botones de acción */}
          {isRevealed && isFlipped && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.reviewsButton]} 
                onPress={handleReviews}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.text} />
                <Text style={styles.buttonText}>Reseñas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.watchedButton]} 
                onPress={handleWatched}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.text} />
                <Text style={styles.buttonText}>Ya la vi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botón de cerrar */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Mapeo de IDs de género a nombres
const genreNames = {
  28: 'Acción',
  12: 'Aventura',
  16: 'Animación',
  35: 'Comedia',
  80: 'Crimen',
  99: 'Documental',
  18: 'Drama',
  10751: 'Familia',
  14: 'Fantasía',
  36: 'Historia',
  27: 'Terror',
  10402: 'Música',
  9648: 'Misterio',
  10749: 'Romance',
  878: 'Ciencia Ficción',
  10770: 'Película TV',
  53: 'Suspense',
  10752: 'Guerra',
  37: 'Western'
};

const getGenreNames = (genreIds) => {
  if (!genreIds || !Array.isArray(genreIds)) return [];
  return genreIds.map(id => genreNames[id] || `ID:${id}`).slice(0, 3);
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center'
  },
  container: {
    width: '90%',
    maxHeight: height * 0.85,
    alignItems: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl
  },
  title: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `rgba(${255}, ${215}, ${0}, 0.15)`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary
  },
  counter: {
    color: colors.primary,
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.sm
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 10,
    shadowColor: colors.shadow.lg,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20
  },
  card: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    backfaceVisibility: 'hidden'
  },
  cardFront: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1
  },
  cardBack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    transform: [{ rotateY: '180deg' }]
  },
  poster: {
    width: '100%',
    height: '100%'
  },
  frontOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    backgroundColor: 'rgba(0,0,0,0.8)'
  },
  frontTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  frontYear: {
    ...typography.body,
    color: colors.textMuted
  },
  frontRating: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  ratingSource: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic'
  },
  backContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center'
  },
  backTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'center'
  },
  backOverview: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20,
    textAlign: 'center'
  },
  backMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  backMetaItem: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  backMetaLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600'
  },
  backMetaValue: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500'
  },
  backMetaSource: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic'
  },
  genreContainer: {
    marginTop: spacing.lg
  },
  genreLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600'
  },
  genreText: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: spacing.sm
  },
  scratchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10
  },
  scratchTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scratchGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scratchContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    justifyContent: 'center'
  },
  scratchText: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.lg,
    textAlign: 'center'
  },
  scratchSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center'
  },
  scratchDots: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    gap: spacing.md
  },
  scratchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.overlayLight
  },
  scratchDotActive: {
    backgroundColor: colors.primary
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlayLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  revealButtonText: {
    color: colors.text,
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.md
  },
  flipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.overlayLight,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 20,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight
  },
  flipButtonText: {
    color: colors.text,
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.md
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.md
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center'
  },
  reviewsButton: {
    backgroundColor: colors.success
  },
  watchedButton: {
    backgroundColor: colors.error
  },
  buttonText: {
    color: colors.text,
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.md
  },
  closeButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg
  }
});

export default FlipCardReveal;
