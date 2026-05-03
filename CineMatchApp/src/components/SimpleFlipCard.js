import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.6;

const SimpleFlipCard = ({ 
  movie, 
  isVisible, 
  onClose, 
  onShare,
  remainingRecommendations,
  onWatchedMovie,
  onReviews
}) => {
  const { colors } = useTheme();
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchCount, setScratchCount] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [ratingSource, setRatingSource] = useState('loading');
  
  // Animación de giro
  const flipAnimation = useRef(new Animated.Value(0)).current;
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Animación de presión
  const scratchPressAnimation = useRef(new Animated.Value(1)).current;
  
  // Animación para el último punto activado
  const lastDotAnimation = useRef(new Animated.Value(1)).current;
  
  // Animación de celebración
  const celebrateAnimation = useRef(new Animated.Value(0)).current;

  const appGradientColors = [colors.card, colors.surface];
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Reiniciar estado de rascado cuando cambia la película
  useEffect(() => {
    if (movie && movie.id) {
      console.log('Nueva película detectada, reiniciando estado de rascado:', movie.title);
      setIsRevealed(false);
      setScratchCount(0);
      setIsScratching(false);
      setIsFlipped(false);
      
      // Reiniciar animaciones
      flipAnimation.setValue(0);
      scratchPressAnimation.setValue(1);
      lastDotAnimation.setValue(1);
      celebrateAnimation.setValue(0);
      
      loadUserRating();
    } else if (!movie) {
      // Cuando movie es null, reiniciar todo el estado
      console.log('Película limpiada, reiniciando estado completo');
      setIsRevealed(false);
      setScratchCount(0);
      setIsScratching(false);
      setIsFlipped(false);
      setUserRating(null);
      setRatingSource('loading');
      
      // Reiniciar animaciones
      flipAnimation.setValue(0);
      scratchPressAnimation.setValue(1);
      lastDotAnimation.setValue(1);
      celebrateAnimation.setValue(0);
    }
  }, [movie]);

  // Reiniciar estado cuando cambia la visibilidad del modal
  useEffect(() => {
    if (!isVisible) {
      // Cuando se cierra el modal, reiniciar estado para la próxima vez
      console.log('Modal cerrado, reiniciando estado para próxima película');
      setIsRevealed(false);
      setScratchCount(0);
      setIsScratching(false);
      setIsFlipped(false);
      
      // Reiniciar animaciones
      flipAnimation.setValue(0);
      scratchPressAnimation.setValue(1);
      lastDotAnimation.setValue(1);
      celebrateAnimation.setValue(0);
    }
  }, [isVisible]);

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
    
    // Animación de presión
    Animated.sequence([
      Animated.timing(scratchPressAnimation, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scratchPressAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();
    
    const newCount = scratchCount + 1;
    setScratchCount(newCount);
    setIsScratching(true);
    
    // Animar el último punto activado
    Animated.sequence([
      Animated.timing(lastDotAnimation, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(lastDotAnimation, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    console.log('Rascando - Count:', newCount);
    
    setTimeout(() => {
      setIsScratching(false);
    }, 200);
    
    // Revelar después de 5 "rascados"
    if (newCount >= 5) {
      console.log('Revelando película - 5 rascados completados');
      handleReveal();
    }
  };

  const handleReveal = () => {
    console.log('Iniciando revelación de película');
    
    // Animación de celebración
    Animated.sequence([
      Animated.timing(celebrateAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(celebrateAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
    
    setIsRevealed(true);
    
    // Solo quitar la capa de scratch, no girar todavía
    // El giro se hará con el botón de flip o segundo clic
  };

  const handleFlip = () => {
    console.log('Girando tarjeta');
    const toValue = isFlipped ? 0 : 1;
    
    Animated.timing(flipAnimation, {
      toValue: toValue,
      duration: 600,
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
    console.log('SimpleFlipCard: No hay película para mostrar');
    return null;
  }

  const frontRotate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const backRotate = flipAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['180deg', '360deg'],
  });

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
              <Ionicons name="ticket" size={16} color={colors.primary} />
              <Text style={styles.counter}>
                {remainingRecommendations}/3 restantes
              </Text>
            </View>
          </View>

          {/* Tarjeta con animación de giro */}
          <View style={styles.cardContainer}>
            {/* Frente de la tarjeta */}
            <Animated.View 
              style={[
                styles.card,
                {
                  transform: [{ rotateY: frontRotate }],
                  opacity: isFlipped ? 0 : 1
                }
              ]}
            >
              <TouchableOpacity 
                style={styles.cardFront}
                onPress={isRevealed ? handleFlip : null}
                activeOpacity={0.9}
              >
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
                  colors={['transparent', 'rgba(0,0,0,0.9)']}
                  style={styles.frontOverlay}
                >
                  <Text style={styles.frontTitle}>{movie?.title}</Text>
                  <Text style={styles.frontYear}>
                    {movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </Text>
                  <Text style={styles.frontRating}>
                    {ratingSource === 'loading' ? '  Cargando...' : 
                     userRating ? `  ${userRating.toFixed(1)}` : '  0'}
                  </Text>
                  <Text style={styles.ratingSource}>
                    {ratingSource === 'users' && ' (usuarios)'}
                    {ratingSource === 'tmdb' && ' (TMDB)'}
                  </Text>
                  
                                  </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            {/* Reverso de la tarjeta */}
            <Animated.View 
              style={[
                styles.card,
                {
                  transform: [{ rotateY: backRotate }],
                  opacity: isFlipped ? 1 : 0
                }
              ]}
            >
              <LinearGradient
                colors={appGradientColors}
                style={styles.cardBack}
              >
                <View style={styles.backContent}>
                  <Text style={styles.backTitle}>{movie?.title}</Text>
                  <Text style={styles.backOverview} numberOfLines={6}>
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
                      <Text style={styles.backMetaRating}>
                        {ratingSource === 'loading' ? 'Cargando...' : 
                         userRating ? `${userRating.toFixed(1)}` : '0'}
                      </Text>
                      <Text style={styles.backMetaSource}>
                        {ratingSource === 'users' && '(usuarios)'}
                        {ratingSource === 'tmdb' && '(TMDB)'}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Capa de "scratch" */}
            {!isRevealed && (
              <View style={styles.scratchLayer}>
                <LinearGradient
                  colors={appGradientColors}
                  style={styles.scratchGradient}
                >
                  <TouchableOpacity 
                    style={styles.scratchTouchable}
                    onPress={handleScratch}
                    activeOpacity={0.8}
                  >
                    <Animated.View style={[
                        styles.scratchContent,
                        {
                          transform: [{ scale: scratchPressAnimation }]
                        }
                      ]}>
                      <Ionicons 
                        name={isScratching ? "gift" : "gift-outline"} 
                        size={60} 
                        color={colors.text} 
                      />
                      <Text style={styles.scratchText}>
                        {isScratching ? '¡Sigue raspando!' : 'Rasca para revelar'}
                      </Text>
                      <Text style={styles.scratchSubtext}>
                        Toca {5 - scratchCount} veces más para descubrir
                      </Text>
                      
                      {/* Indicador de progreso */}
                      <View style={styles.scratchDots}>
                        {[1, 2, 3, 4, 5].map((dot) => (
                          <Animated.View
                            key={dot}
                            style={[
                              styles.scratchDot,
                              dot <= scratchCount && styles.scratchDotActive,
                              dot === scratchCount && {
                                transform: [{ scale: lastDotAnimation }]
                              }
                            ]}
                          />
                        ))}
                      </View>
                      
                      {/* Efecto de celebración */}
                      {scratchCount >= 5 && (
                        <Animated.View
                          style={[
                            styles.celebrationEffect,
                            {
                              opacity: celebrateAnimation,
                              transform: [{ scale: celebrateAnimation }]
                            }
                          ]}
                        >
                          <Ionicons name="star" size={40} color={colors.primary} />
                          <Text style={styles.celebrationText}>¡Descubierto!</Text>
                        </Animated.View>
                      )}
                      
                                          </Animated.View>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            )}
          </View>

          {/* Botón de flip */}
          {isRevealed && (
            <TouchableOpacity 
              style={styles.flipButton}
              onPress={handleFlip}
            >
              <Ionicons name="sync-outline" size={20} color={colors.text} />
              <Text style={styles.flipButtonText}>
                {isFlipped ? 'Ver póster' : 'Ver información completa'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Botones de acción */}
          {isRevealed && isFlipped && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.reviewsButton]} 
                onPress={handleReviews}
              >
                <Ionicons name="chatbubble-outline" size={20} color={colors.textDark || '#000000'} />
                <Text style={styles.buttonText}>Reseñas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.watchedButton]} 
                onPress={handleWatched}
              >
                <Ionicons name="checkmark-circle" size={20} color={colors.textDark || '#000000'} />
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

const createStyles = (colors) => StyleSheet.create({
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
    backgroundColor: colors.gradient.accentGlow,
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
    width: '100%',
    height: '100%'
  },
  cardBack: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
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
    padding: spacing.lg
  },
  frontTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.md
  },
  frontYear: {
    ...typography.body,
    color: colors.textMuted
  },
  frontRating: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '600'
  },
  ratingSource: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic'
  },
  flipIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    backgroundColor: colors.overlayLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12
  },
  flipIndicatorText: {
    color: colors.text,
    fontSize: 10,
    marginLeft: spacing.md,
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
    marginBottom: spacing.xl,
    textAlign: 'center'
  },
  backOverview: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 20,
    textAlign: 'center'
  },
  backMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: spacing.lg
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
  backMetaRating: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '500'
  },
  backMetaSource: {
    fontSize: 10,
    color: colors.textMuted,
    fontStyle: 'italic'
  },
  scratchLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10
  },
  scratchGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  scratchTouchable: {
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
  celebrationEffect: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.overlayLight,
    borderRadius: 20,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 2,
    borderColor: colors.primary
  },
  celebrationText: {
    ...typography.h4,
    color: colors.primary,
    fontWeight: '800',
    marginTop: spacing.sm
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
    backgroundColor: colors.primary
  },
  watchedButton: {
    backgroundColor: colors.accent || colors.secondary
  },
  buttonText: {
    color: colors.textDark || '#000000',
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

export default SimpleFlipCard;
