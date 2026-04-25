import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, ScrollView, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Altura adaptable: pantalla total menos header, botones de accion y tab bar.
// Se resta 320px para dejar espacio suficiente sin cortar el contenido.
const CARD_HEIGHT = Math.min(Math.max(SCREEN_H - 320, 360), 560);
const CARD_WIDTH = SCREEN_W - 40;

const FRAME_STYLES = {
  classic_gold: { borderWidth: 2, borderColor: '#F5C518' },
  noir_silver: { borderWidth: 2, borderColor: '#A7A7A7' },
  neon_pop: { borderWidth: 2, borderColor: '#31E9FF' },
  epic_scarlet: { borderWidth: 2, borderColor: '#FF5A5A' },
  director_cut: { borderWidth: 2, borderColor: '#B09A5E' },
};

const UserCard = ({ user }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Validar que user existe y tiene las propiedades necesarias
  if (!user || !user.id) {
    return null;
  }

  const equippedFrame = user.equipped_frame || user.equippedFrame || null;
  const frameStyle = equippedFrame ? FRAME_STYLES[equippedFrame] : null;

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
    <View style={[styles.card, frameStyle]}>
      <Image
        source={{ uri: user.profile_photo || getPlaceholderImage() }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.imageScrim} />

      {/* Badge de Match % */}
      {(user.match_percentage && user.match_percentage > 0) ? (
        <View style={styles.matchBadge}>
          <Text style={styles.matchPercentage}>{String(user.match_percentage)}%</Text>
          <Text style={styles.matchLabel}>COINCIDENCIA</Text>
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

          {/* Indicador para ver mas detalles (generos, directores y peliculas) */}
          <View style={styles.tapHintContainer}>
            <Text style={styles.tapHintText}>
              Toca la tarjeta para ver mas detalles
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 32,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
    paddingTop: 0,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  },
  image: {
    width: '100%',
    height: '56%',
  },
  imageScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '44%',
    height: '12%',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  matchBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  matchPercentage: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
  },
  matchLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    marginTop: -2,
    letterSpacing: 0.8,
  },
  infoContainer: {
    flex: 1,
    backgroundColor: colors.surfaceElevated,
  },
  infoContent: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
  },
  moviesOnlyContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  moviesOnlyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  moviesGridContent: {
    paddingBottom: 18,
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  gridMovieContainer: {
    width: (SCREEN_W - 80) / 3,
    marginBottom: 4,
  },
  gridMoviePoster: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 14,
    backgroundColor: '#E8E8E8',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  gridMoviePosterPlaceholder: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridMovieTitle: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 12,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.text,
    flex: 1,
    letterSpacing: 0.4,
  },
  distanceBadge: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  distanceText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '800',
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  compatibilityContainer: {
    backgroundColor: 'rgba(255,215,0,0.08)',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  compatibilityTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  compatibilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  compatibilityText: {
    fontSize: 12,
    color: colors.text,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: colors.border,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genresSection: {
    marginTop: 6,
    marginBottom: 10,
  },
  genresSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  genreTag: {
    backgroundColor: 'rgba(255,215,0,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  genreText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tapHintContainer: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 10,
    borderRadius: 999,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  tapHintText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  moviePosterIcon: {
    fontSize: 32,
  },
});

export default UserCard;
