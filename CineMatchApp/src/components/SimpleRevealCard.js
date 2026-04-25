import React, { useState } from 'react';
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

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = height * 0.6;

const SimpleRevealCard = ({ 
  movie, 
  isVisible, 
  onClose, 
  onShare,
  remainingRecommendations,
  onWatchedMovie 
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  const handleReveal = () => {
    setIsRevealed(true);
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 800,
      useNativeDriver: true
    }).start();
  };

  const handleShare = async () => {
    try {
      // Lógica de compartir simplificada
      console.log('Compartiendo película:', movie?.title);
      if (onShare) onShare(movie);
    } catch (error) {
      console.log('Error al compartir:', error);
    }
  };

  const handleWatched = () => {
    if (onWatchedMovie) {
      onWatchedMovie(movie);
    }
    onClose();
  };

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

  if (!movie) {
    console.log('SimpleRevealCard: No hay película para mostrar');
    return null;
  }

  console.log('SimpleRevealCard renderizado con película:', movie.title);

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
                    {movie?.vote_average ? `? ${movie.vote_average?.toFixed(1)}` : '? ?'}
                  </Text>
                </View>
              </LinearGradient>
            </View>

            {/* Capa de revelación */}
            {!isRevealed && (
              <Animated.View
                style={[
                  styles.revealLayer,
                  { opacity: fadeAnim }
                ]}
              >
                <LinearGradient
                  colors={gradientColors}
                  style={styles.revealGradient}
                >
                  <View style={styles.revealContent}>
                    <Ionicons name="gift" size={60} color="white" />
                    <Text style={styles.revealText}>
                      ? Tu película está lista
                    </Text>
                    <Text style={styles.revealSubtext}>
                      Toca para descubrirla
                    </Text>
                    <TouchableOpacity 
                      style={styles.revealButton}
                      onPress={handleReveal}
                    >
                      <Ionicons name="eye-outline" size={20} color="white" />
                      <Text style={styles.revealButtonText}>Revelar película</Text>
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
    padding: 20
  },
  movieTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8
  },
  movieOverview: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
    lineHeight: 20
  },
  movieMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  movieYear: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)'
  },
  movieRating: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600'
  },
  revealLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10
  },
  revealGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  revealContent: {
    alignItems: 'center',
    paddingHorizontal: 30
  },
  revealText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    textAlign: 'center'
  },
  revealSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center'
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

export default SimpleRevealCard;
