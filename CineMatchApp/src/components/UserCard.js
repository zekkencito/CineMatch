import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView } from 'react-native';
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

  // Obtener URL del poster de TMDB
  const getMoviePosterUrl = (movie) => {
    if (movie.poster_path) {
      return `https://image.tmdb.org/t/p/w300${movie.poster_path}`;
    }
    // Si no hay poster_path, intentar construir con tmdb_movie_id
    return null;
  };

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: user.profile_photo || getPlaceholderImage() }}
        style={styles.image}
        resizeMode="cover"
      />
      
      {/* Badge de Match % */}
      {(user.match_percentage && user.match_percentage > 0) ? (
        <View style={styles.matchBadge}>
          <Text style={styles.matchPercentage}>{String(user.match_percentage)}%</Text>
          <Text style={styles.matchLabel}>MATCH</Text>
        </View>
      ) : null}

      {/* Vista con toda la info */}
      <View style={styles.infoContainer}>
        <ScrollView 
          contentContainerStyle={styles.infoContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEnabled={true}
        >
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {user.age ? (user.name || 'Usuario') + ', ' + String(user.age) : (user.name || 'Usuario')}
              </Text>
              {(user.distance && user.distance > 0) ? (
                <View style={styles.distanceBadge}>
                  <Text style={styles.distanceText}>📍 {String(user.distance)}km</Text>
                </View>
              ) : null}
            </View>
            
            {(user.bio && typeof user.bio === 'string' && user.bio.length > 0) ? (
              <Text style={styles.bio}>{user.bio}</Text>
            ) : null}
            
            {/* Compatibilidad */}
            {((user.common_genres_count && user.common_genres_count > 0) || 
              (user.common_directors_count && user.common_directors_count > 0) || 
              (user.common_movies_count && user.common_movies_count > 0)) ? (
              <View style={styles.compatibilityContainer}>
                <Text style={styles.compatibilityTitle}>🎬 En común:</Text>
                <View style={styles.compatibilityRow}>
                  {(user.common_genres_count && user.common_genres_count > 0) ? (
                    <Text style={styles.compatibilityText}>
                      {String(user.common_genres_count)} género{user.common_genres_count > 1 ? 's' : ''}
                    </Text>
                  ) : null}
                  {(user.common_directors_count && user.common_directors_count > 0) ? (
                    <Text style={styles.compatibilityText}>
                      {String(user.common_directors_count)} director{user.common_directors_count > 1 ? 'es' : ''}
                    </Text>
                  ) : null}
                  {(user.common_movies_count && user.common_movies_count > 0) ? (
                    <Text style={styles.compatibilityText}>
                      {String(user.common_movies_count)} película{user.common_movies_count > 1 ? 's' : ''}
                    </Text>
                  ) : null}
                </View>
              </View>
            ) : null}
            
            {/* Géneros favoritos */}
            {(user.favorite_genres && user.favorite_genres.length > 0) ? (
              <View style={styles.genresSection}>
                <Text style={styles.genresSectionTitle}>🎭 Géneros favoritos:</Text>
                <View style={styles.genresContainer}>
                  {user.favorite_genres
                    .filter(genre => genre != null)
                    .slice(0, 5)
                    .map((genre, index) => {
                      const genreName = typeof genre === 'object' && genre.name
                        ? genre.name
                        : (typeof genre === 'string' ? genre : 'Género');
                      return (
                        <View key={'genre-' + index} style={styles.genreTag}>
                          <Text style={styles.genreText}>{genreName}</Text>
                        </View>
                      );
                    })
                  }
                </View>
              </View>
            ) : null}
            
            {/* Indicador para ver películas */}
            {(user.watched_movies_list && user.watched_movies_list.length > 0) ? (
              <View style={styles.tapHintContainer}>
                <Text style={styles.tapHintText}>
                  🎬 Toca la tarjeta para ver {user.watched_movies_list.length} película{user.watched_movies_list.length > 1 ? 's' : ''}
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    height: height * 0.7,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
    shadowColor: '#000',
    paddingTop: 0,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#F5C518',
  },
  image: {
    width: '100%',
    height: '42%',
  },
  matchBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F5C518',
  },
  matchPercentage: {
    fontSize: 24,
    fontWeight: '900',
    color: '#F5C518',
  },
  matchLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#F5C518',
    marginTop: -2,
    letterSpacing: 1,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  infoContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
  },
  moviesOnlyContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F5C518',
  },
  backButtonText: {
    color: '#F5C518',
    fontSize: 13,
    fontWeight: '700',
  },
  moviesOnlyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginBottom: 14,
    letterSpacing: 0.5,
  },
  moviesGridContent: {
    paddingBottom: 16,
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridMovieContainer: {
    width: (width - 80) / 3,
    marginBottom: 4,
  },
  gridMoviePoster: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 8,
    backgroundColor: '#E8E8E8',
    borderWidth: 2,
    borderColor: '#F5C518',
  },
  gridMoviePosterPlaceholder: {
    width: '100%',
    aspectRatio: 2/3,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridMovieTitle: {
    fontSize: 9,
    color: '#000',
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 11,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 12,
    borderBottomWidth: 3,
    borderBottomColor: '#F5C518',
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    flex: 1,
    letterSpacing: 0.8,
  },
  distanceBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  distanceText: {
    fontSize: 11,
    color: '#F5C518',
    fontWeight: '700',
  },
  bio: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
    lineHeight: 21,
    fontWeight: '500',
  },
  compatibilityContainer: {
    backgroundColor: '#FFF9E6',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F5C518',
  },
  compatibilityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  compatibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compatibilityText: {
    fontSize: 12,
    color: '#000',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    fontWeight: '700',
    borderWidth: 2,
    borderColor: '#F5C518',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genresSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  genresSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#000',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  genreTag: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#F5C518',
  },
  genreText: {
    color: '#F5C518',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tapHintContainer: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#F5C518',
    alignItems: 'center',
  },
  tapHintText: {
    color: '#F5C518',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  moviePosterIcon: {
    fontSize: 32,
  },
});

export default UserCard;
