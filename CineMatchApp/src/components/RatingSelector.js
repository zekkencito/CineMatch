import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const RatingSelector = ({ 
  userRating = null, 
  averageRating = null, 
  ratingCount = 0, 
  onRatingChange, 
  disabled = false,
  size = 'small',
  showAverage = true 
}) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, size), [colors, size]);
  
  const [selectedRating, setSelectedRating] = useState(userRating);
  const [hoveredRating, setHoveredRating] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Animation values
  const starScales = useRef(Array.from({ length: 10 }, () => new Animated.Value(1))).current;
  const ratingScale = useRef(new Animated.Value(1)).current;

  const animateStar = useCallback((index) => {
    Animated.sequence([
      Animated.timing(starScales[index], {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(starScales[index], {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [starScales]);

  const animateRating = useCallback(() => {
    Animated.sequence([
      Animated.timing(ratingScale, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(ratingScale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [ratingScale]);

  const handleRatingPress = useCallback(async (rating) => {
    if (disabled || isSubmitting) return;

    setIsSubmitting(true);
    
    // Optimistic update
    const previousRating = selectedRating;
    setSelectedRating(rating);
    animateStar(rating - 1);

    try {
      await onRatingChange(rating);
      animateRating();
    } catch (error) {
      // Rollback on error
      setSelectedRating(previousRating);
      console.error('Error saving rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [disabled, isSubmitting, selectedRating, onRatingChange, animateStar, animateRating]);

  const getStarColor = useCallback((index) => {
    const ratingValue = hoveredRating || selectedRating;
    if (ratingValue && index < ratingValue) {
      return '#FFD700';
    }
    return 'rgba(255, 255, 255, 0.2)';
  }, [hoveredRating, selectedRating]);

  const renderStars = useCallback(() => {
    return Array.from({ length: 10 }, (_, index) => (
      <Animated.View
        key={index}
        style={[
          styles.starContainer,
          { transform: [{ scale: starScales[index] }] }
        ]}
      >
        <TouchableOpacity
          onPress={() => handleRatingPress(index + 1)}
          onPressIn={() => setHoveredRating(index + 1)}
          onPressOut={() => setHoveredRating(null)}
          disabled={disabled || isSubmitting}
          activeOpacity={0.8}
          style={styles.starButton}
        >
          <FontAwesomeIcon
            icon={faStar}
            size={size === 'small' ? 12 : 16}
            color={getStarColor(index)}
          />
        </TouchableOpacity>
      </Animated.View>
    ));
  }, [starScales, styles, size, handleRatingPress, disabled, isSubmitting, getStarColor]);

  const renderAverageRating = useCallback(() => {
    if (!averageRating || ratingCount === 0) return null;

    return (
      <Animated.View 
        style={[
          styles.averageRatingContainer,
          { transform: [{ scale: ratingScale }] }
        ]}
      >
        <View style={styles.averageRatingBadge}>
          <Text style={styles.averageRatingNumber}>
            {(averageRating != null && !isNaN(averageRating)) ? Number(averageRating).toFixed(1) : '0.0'}
          </Text>
        </View>
        <Text style={styles.ratingCountText}>
          {ratingCount} {ratingCount === 1 ? 'calificación' : 'calificaciones'}
        </Text>
      </Animated.View>
    );
  }, [averageRating, ratingCount, ratingScale, styles]);

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {renderStars()}
      </View>
      
      {showAverage && renderAverageRating()}
      
      {selectedRating && (
        <View style={styles.userRatingContainer}>
          <Text style={styles.userRatingText}>
            Tu calificación: {selectedRating}/10
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors, size) => StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: size === 'small' ? 4 : 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: size === 'small' ? 2 : 4,
  },
  starContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButton: {
    padding: size === 'small' ? 2 : 4,
    borderRadius: 4,
  },
  averageRatingContainer: {
    alignItems: 'center',
    gap: 8,
  },
  averageRatingBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  averageRatingNumber: {
    fontSize: size === 'small' ? 16 : 20,
    fontWeight: '900',
    color: '#0a0a0a',
    textAlign: 'center',
    minWidth: size === 'small' ? 32 : 40,
  },
  ratingCountText: {
    fontSize: size === 'small' ? 10 : 12,
    color: '#999',
    fontWeight: '600',
    textAlign: 'center',
  },
  userRatingContainer: {
    alignItems: 'center',
  },
  userRatingText: {
    fontSize: size === 'small' ? 10 : 12,
    color: '#FFD700',
    fontWeight: '600',
  },
});

export default RatingSelector;
