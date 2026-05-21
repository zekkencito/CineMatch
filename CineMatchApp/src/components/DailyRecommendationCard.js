import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  PanResponder,
  Animated,
  Image,
  TouchableOpacity,
  Modal,
  Share,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import typography from '../constants/typography';

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.6;

const DailyRecommendationCard = ({ 
  movie, 
  isVisible, 
  onClose, 
  onShare,
  remainingRecommendations,
  onWatchedMovie 
}) => {
  const [isScratching, setIsScratching] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const scratchArea = useRef(new Animated.ValueXY()).current;

  // Debug logs
  console.log('DailyRecommendationCard renderizado:', {
    movie: movie?.title,
    isVisible,
    isRevealed,
    scratchProgress
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

  // PanResponder para el efecto de revelar
  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      console.log('onMoveShouldSetPanResponder:', !isRevealed, gestureState);
      return !isRevealed;
    },
    onPanResponderGrant: (evt, gestureState) => {
      console.log('onPanResponderGrant - Iniciando revelado');
      setIsScratching(true);
    },
    onPanResponderMove: (evt, gestureState) => {
      console.log('onPanResponderMove:', gestureState.dx, gestureState.dy);
      if (!isRevealed) {
        const progress = Math.min((Math.abs(gestureState.dx) + Math.abs(gestureState.dy)) / 200, 1);
        console.log('Progreso de revelado:', progress);
        setScratchProgress(Math.max(scratchProgress, progress));
        
        scratchArea.setValue({
          x: gestureState.dx,
          y: gestureState.dy
        });
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      console.log('onPanResponderRelease - Progreso final:', scratchProgress);
      setIsScratching(false);
      
      if (scratchProgress > 0.6) {
        console.log('Revelando película - Progreso suficiente');
        handleReveal();
      } else {
        console.log('Progreso insuficiente para revelar');
      }
    }
  });

  const handleReveal = () => {
    setIsRevealed(true);
    // Animación de revelado
    Animated.timing(scratchArea, {
      toValue: { x: 0, y: -CARD_HEIGHT },
      duration: 800,
      useNativeDriver: true
    }).start();
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `🎬 ¡Mi recomendación diaria de CineMatch es "${movie.title}"! ¿La has visto?`,
        url: `https://cinematch.app/movies/${movie.id}`
      });
      
      if (onShare) {
        onShare(movie);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la recomendación');
    }
  };

  const handleWatched = () => {
    if (onWatchedMovie) {
      onWatchedMovie(movie);
    }
    onClose();
  };

  const getScratchOpacity = () => {
    if (isRevealed) return 0;
    return Math.max(0.3, 1 - scratchProgress);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header con contador */}
          <View style={styles.header}>
            <Text style={styles.title}>🎬 Recomendación Diaria</Text>
            <View style={styles.counterContainer}>
              <Ionicons name="ticket" size={16} color="#FFD700" />
              <Text style={styles.counter}>
                {remainingRecommendations}/3 restantes
              </Text>
            </View>
          </View>

          {/* Tarjeta principal */}
          <View style={styles.cardContainer} {...panResponder.panHandlers}>
            {/* Película revelada */}
            <View style={styles.movieContainer}>
              <Image
                source={{ 
                  uri: movie?.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                    : 'https://via.placeholder.com/300x450/cccccc/666666?text=No+Poster'
                }}
                style={styles.poster}
                resizeMode="cover"
              />
              
              {/* Overlay con información */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.9)']}
                style={styles.movieInfo}
              >
                <Text style={styles.movieTitle}>{movie?.title}</Text>
                <Text style={styles.movieOverview} numberOfLines={3}>
                  {movie?.overview}
                </Text>
                <View style={styles.movieMeta}>
                  <Text style={styles.movieYear}>
                    {movie?.release_date || movie?.release_year}
                  </Text>
                  <Text style={styles.movieRating}>
                    ⭐ {movie?.vote_average?.toFixed(1)}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Capa de "scratch" */}
            {!isRevealed && (
              <Animated.View
                style={[
                  styles.scratchLayer,
                  {
                    opacity: getScratchOpacity(),
                    transform: [{ translateY: scratchArea.y }]
                  }
                ]}
              >
                <LinearGradient
                  colors={gradientColors}
                  style={styles.scratchGradient}
                >
                  <View style={styles.scratchContent}>
                    <Ionicons name="gift" size={60} color={colors.text} />
                    <Text style={styles.scratchText}>
                      {isScratching ? '¡Sigue presionando!' : 'Presiona 3 veces para revelar'}
                    </Text>
                    <Text style={styles.scratchSubtext}>
                      Toca la tarjeta para descubrir tu película
                    </Text>
                    <TouchableOpacity 
                      style={styles.revealButton}
                      onPress={handleReveal}
                    >
                      <Ionicons name="eye-outline" size={20} color={colors.text} />
                      <Text style={styles.revealButtonText}>Revelar ahora</Text>
                    </TouchableOpacity>
                  </View>
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
                <Ionicons name="share-outline" size={20} color={colors.text} />
                <Text style={styles.buttonText}>Compartir</Text>
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
    padding: spacing.lg
  },
  movieTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md
  },
  movieOverview: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
    lineHeight: 20
  },
  movieMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  movieYear: {
    ...typography.body,
    color: colors.textMuted
  },
  movieRating: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600'
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
  scratchContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl
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
  shareButton: {
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

export default DailyRecommendationCard;
