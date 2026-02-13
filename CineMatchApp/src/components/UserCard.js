import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

const UserCard = ({ user }) => {
  // Validar que user existe y tiene las propiedades necesarias
  if (!user || !user.id) {
    return null;
  }

  // Imágenes de placeholder por género/preferencias
  const getPlaceholderImage = () => {
    const placeholders = [
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=400',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
      'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=400',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
    ];
    // Usar el ID del usuario para seleccionar una imagen consistente
    return placeholders[user.id % placeholders.length];
  };

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: user.profile_photo || getPlaceholderImage() }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Badge de Match % */}
      {user.match_percentage && (
        <View style={styles.matchBadge}>
          <Text style={styles.matchPercentage}>{user.match_percentage}%</Text>
          <Text style={styles.matchLabel}>MATCH</Text>
        </View>
      )}
      
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}, {user.age}</Text>
          {user.distance && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>📍 {user.distance}km</Text>
            </View>
          )}
        </View>
        
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
        
        {/* Compatibilidad */}
        {(user.common_genres_count > 0 || user.common_directors_count > 0 || user.common_movies_count > 0) && (
          <View style={styles.compatibilityContainer}>
            <Text style={styles.compatibilityTitle}>🎬 En común:</Text>
            <View style={styles.compatibilityRow}>
              {user.common_genres_count > 0 && (
                <Text style={styles.compatibilityText}>
                  {user.common_genres_count} género{user.common_genres_count > 1 ? 's' : ''}
                </Text>
              )}
              {user.common_directors_count > 0 && (
                <Text style={styles.compatibilityText}>
                  {user.common_directors_count} director{user.common_directors_count > 1 ? 'es' : ''}
                </Text>
              )}
              {user.common_movies_count > 0 && (
                <Text style={styles.compatibilityText}>
                  {user.common_movies_count} película{user.common_movies_count > 1 ? 's' : ''}
                </Text>
              )}
            </View>
          </View>
        )}
        
        {user.favorite_genres && user.favorite_genres.length > 0 && (
          <View style={styles.genresContainer}>
            {user.favorite_genres.slice(0, 3).map((genre, index) => (
              <View key={index} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name || genre}</Text>
              </View>
            ))}
          </View>
        )}
        
        {/* Películas favoritas */}
        {user.watched_movies_list && user.watched_movies_list.length > 0 && (
          <View style={styles.moviesSection}>
            <Text style={styles.moviesSectionTitle}>🎬 Películas vistas:</Text>
            <View style={styles.moviesContainer}>
              {user.watched_movies_list.slice(0, 3).map((movie, index) => (
                <View key={index} style={styles.movieTag}>
                  <Text style={styles.movieText} numberOfLines={1}>
                    {movie.title}
                  </Text>
                  {movie.rating && (
                    <Text style={styles.movieRating}>⭐ {movie.rating}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    height: height * 0.7,
    borderRadius: 20,
    backgroundColor: colors.card,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '70%',
  },
  matchBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(229, 9, 20, 0.95)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  matchPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  matchLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
    marginTop: -2,
  },
  infoContainer: {
    padding: 20,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  distanceBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  bio: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  compatibilityContainer: {
    backgroundColor: 'rgba(229, 9, 20, 0.15)',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  compatibilityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  compatibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compatibilityText: {
    fontSize: 13,
    color: colors.text,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genreTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  genreText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  moviesSection: {
    marginTop: 12,
  },
  moviesSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  moviesContainer: {
    gap: 6,
  },
  movieTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  movieText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  movieRating: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default UserCard;
