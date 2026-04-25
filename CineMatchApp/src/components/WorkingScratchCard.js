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

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.6;

const WorkingScratchCard = ({ 
  movie, 
  isVisible, 
  onClose, 
  onShare,
  remainingRecommendations,
  onWatchedMovie 
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [scratchCount, setScratchCount] = useState(0);
  const [isScratching, setIsScratching] = useState(false);
  const [userRating, setUserRating] = useState(null);
  const [ratingSource, setRatingSource] = useState('loading');
  
  // Animaciones
  const scratchOpacity = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  // Debug logs
  useEffect(() => {
    console.log('WorkingScratchCard renderizado:', {
      movie: movie?.title,
      isVisible,
      isRevealed,
      scratchCount
    });
  }, [movie, isVisible, isRevealed, scratchCount]);

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
    
    console.log('Rascando - Count:', newCount);
    
    // Animación de scratch
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
    
    // Revelar después de 5 "rascados"
    if (newCount >= 5) {
      console.log('Revelando película - 5 rascados completados');
      handleReveal();
    }
  };

  const handleReveal = () => {
    console.log('Iniciando revelación de película');
    setIsRevealed(true);
    
    // Animación de revelado
    Animated.parallel([
      Animated.timing(scratchOpacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 400,
        useNativeDriver: true
      })
    ]).start(() => {
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true
      }).start();
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

  if (!movie) {
    console.log('WorkingScratchCard: No hay película para mostrar');
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

          {/* Tarjeta */}
          <View style={styles.cardContainer}>
            {/* Película */}
            <View style={styles.movieContainer}>
              <Image
                source={{ 
                  uri: movie?.poster_path 
                    ? getImageUrl(movie.poster_path, IMAGE_SIZES.poster.large)
                    : 'https://via.placeholder.com/300x450/cccccc/666666?text=No+Poster'
                }}
                style={styles.poster}
                resizeMode="cover"
              />
              
              {/* Overlay con información */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.95)']}
                style={styles.movieInfo}
              >
                <Text style={styles.movieTitle}>{movie?.title}</Text>
                <Text style={styles.movieOverview} numberOfLines={4}>
                  {movie?.overview || 'Sin descripción disponible.'}
                </Text>
                <View style={styles.movieMeta}>
                  <Text style={styles.movieYear}>
                    {movie?.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                  </Text>
                  <Text style={styles.movieRating}>
                    {ratingSource === 'loading' ? '  Cargando...' : 
                     userRating ? `  ${userRating.toFixed(1)}` : '  N/A'}
                  </Text>
                  <Text style={styles.ratingSource}>
                    {ratingSource === 'users' && ' (usuarios)'}
                    {ratingSource === 'tmdb' && ' (TMDB)'}
                  </Text>
                </View>
                {movie?.genre_ids && movie.genre_ids.length > 0 && (
                  <View style={styles.genreContainer}>
                    <Text style={styles.genreLabel}>Géneros:</Text>
                    <Text style={styles.genreText}>
                      {getGenreNames(movie.genre_ids).join(', ')}
                    </Text>
                  </View>
                )}
              </LinearGradient>
            </View>

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
                        color="white" 
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
                        <Ionicons name="eye-outline" size={20} color="white" />
                        <Text style={styles.revealButtonText}>Revelar ahora</Text>
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            )}
          </View>

          {/* Botones de acción */}
          {isRevealed && (
            <View style={styles.actions}>
              <TouchableOpacity 
                style={[styles.button, styles.shareButton]} 
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={20} color="white" />
                <Text style={styles.buttonText}>Compartir</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.watchedButton]} 
                onPress={handleWatched}
              >
                <Ionicons name="checkmark-circle" size={20} color="white" />
                <Text style={styles.buttonText}>Ya la vi</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Botón de cerrar */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close-circle" size={32} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
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
    marginBottom: 20
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 8
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFD700'
  },
  counter: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4
  },
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20
  },
  movieContainer: {
    flex: 1,
    position: 'relative'
  },
  poster: {
    width: '100%',
    height: '100%'
  },
  movieInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)'
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3
  },
  movieOverview: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 18,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  movieMeta: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  movieYear: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)'
  },
  movieRating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  ratingSource: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic'
  },
  genreContainer: {
    marginTop: 8
  },
  genreLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600'
  },
  genreText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2
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
    paddingHorizontal: 30,
    justifyContent: 'center'
  },
  scratchText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center'
  },
  scratchSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center'
  },
  scratchDots: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8
  },
  scratchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  scratchDotActive: {
    backgroundColor: '#FFD700'
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  revealButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    justifyContent: 'center'
  },
  shareButton: {
    backgroundColor: '#4CAF50'
  },
  watchedButton: {
    backgroundColor: '#FF6B6B'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  closeButton: {
    position: 'absolute',
    top: 20,
    right: 20
  }
});

export default WorkingScratchCard;
