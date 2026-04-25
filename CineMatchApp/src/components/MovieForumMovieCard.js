import React, { useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faComment, faStar, faFilm } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MovieForumMovieCard = ({ movie, onPress, onWriteReview }) => {
  // Context and hooks
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Animation refs
  const cardScale = useRef(new Animated.Value(1)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;

  const animateCardPress = useCallback(() => {
    Animated.sequence([
      Animated.timing(cardScale, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(cardScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCardPress = useCallback(() => {
    animateCardPress();
    onPress();
  }, [animateCardPress, onPress]);

  const displayAverageRating = Number(
    movie?.ratings?.average_rating ?? movie?.ratings?.user_rating ?? movie?.vote_average ?? 0
  );
  const displayRatingCount = Number(
    movie?.ratings?.rating_count ?? movie?.reviews_count ?? movie?.vote_count ?? 0
  );
  const normalizedRatingCount = Number.isFinite(displayRatingCount)
    ? (displayRatingCount > 0 ? displayRatingCount : (Number.isFinite(displayAverageRating) && displayAverageRating > 0 ? 1 : 0))
    : 0;

  
  return (
    <Animated.View
      style={[
        styles.movieCard,
        { transform: [{ scale: cardScale }] }
      ]}
    >
      {/* Shine effect */}
      <Animated.View
        style={[
          styles.shineOverlay,
          {
            transform: [{ translateX: shineAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH]
            }) }]
          }
        ]}
      />
      
      {/* Main content */}
      <TouchableOpacity
        style={styles.cardTouchable}
        onPress={handleCardPress}
        activeOpacity={0.9}
      >
        {/* Poster section */}
        <View style={styles.posterSection}>
          {movie.poster_path ? (
            <Image
              source={{ 
                uri: movie.poster_path.startsWith('http') 
                  ? movie.poster_path 
                  : `https://image.tmdb.org/t/p/w500${movie.poster_path}` 
              }}
              style={styles.poster}
              resizeMode="cover"
              onError={(error) => {
                console.log('Image load error for', movie.title, ':', error.nativeEvent.error);
              }}
            />
          ) : (
            <View style={styles.posterPlaceholder}>
              <FontAwesomeIcon icon={faFilm} size={32} color="#FFD700" />
              <Text style={styles.posterPlaceholderText}>No hay imagen</Text>
            </View>
          )}
        </View>

        {/* Content section */}
        <View style={styles.contentSection}>
          {/* Title and year */}
          <View style={styles.headerSection}>
            <Text style={styles.title} numberOfLines={2}>
              {movie.title}
            </Text>
            {movie.release_date && (
              <Text style={styles.year}>
                {new Date(movie.release_date).getFullYear()}
              </Text>
            )}
          </View>

          {/* Review info section */}
          <View style={styles.reviewInfoSection}>
            <View style={styles.reviewCountContainer}>
              <FontAwesomeIcon icon={faComment} size={12} color="#FFD700" />
              <Text style={styles.reviewCountText}>
                {movie.reviews_count || movie.review_count || movie.ratings?.rating_count || 0} reseñas
              </Text>
            </View>
            
            {/* Rating Button */}
            <TouchableOpacity 
              style={styles.ratingButton}
              onPress={() => {}} // No navigation, just visual feedback
              activeOpacity={0.8}
            >
              <FontAwesomeIcon icon={faStar} size={16} color="#0a0a0a" />
              <Text style={styles.ratingButtonText}>
                {Number.isFinite(displayAverageRating) && displayAverageRating > 0
                  ? displayAverageRating.toFixed(1)
                  : 'N/A'}/10
              </Text>
              <Text style={styles.ratingCountLabel}>
                ({normalizedRatingCount})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Action button */}
          <View style={styles.actionSection}>
            <TouchableOpacity 
              style={styles.reviewsButton} 
              onPress={() => onWriteReview && onWriteReview(movie)}
              activeOpacity={0.8}
            >
              <FontAwesomeIcon icon={faComment} size={14} color="#0a0a0a" />
              <Text style={styles.reviewsButtonText}>Reseñas</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  // Main card styles
  movieCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.9)',
    borderRadius: 20,
    marginBottom: spacing.md,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  cardTouchable: {
    flexDirection: 'row',
    height: 250,
  },

  // Shine effect
  shineOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: [{ translateX: -SCREEN_WIDTH }],
  },

  // Poster section
  posterSection: {
    width: 140,
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterPlaceholder: {
    width: '100%',
    height: '100%',
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

  // Content section
  contentSection: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  headerSection: {
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
    lineHeight: 20,
  },
  year: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },

  // Review info section
  reviewInfoSection: {
    gap: 6,
    marginBottom: spacing.sm,
  },
  reviewCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewCountText: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '600',
  },
  ratingInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingInfoText: {
    fontSize: 10,
    color: '#999',
    fontWeight: '500',
  },
  ratingButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
    alignSelf: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  ratingButtonText: {
    fontSize: 14,
    color: '#0a0a0a',
    fontWeight: '700',
    marginLeft: 6,
  },
  ratingCountLabel: {
    fontSize: 12,
    color: '#0a0a0a',
    fontWeight: '600',
    marginLeft: 6,
  },

  
  // Action section
  actionSection: {
    marginTop: 8,
  },
  reviewsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#FFD700',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    alignSelf: 'flex-end',
  },
  reviewsButtonText: {
    fontSize: 12,
    color: '#0a0a0a',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});

export default MovieForumMovieCard;
