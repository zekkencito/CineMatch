import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SimpleFlipCard from '../components/SimpleFlipCard';
import { dailyRecommendationService } from '../services/dailyRecommendationService';
import { tmdbRandomService } from '../services/tmdbRandomService';
import spacing from '../constants/spacing';
import typography from '../constants/typography';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

const DailyRecommendationScreen = ({ navigation }) => {
  const { colors, resolvedTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [dailyStatus, setDailyStatus] = useState(null);
  const [currentMovie, setCurrentMovie] = useState(null);
  const [showCard, setShowCard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMood, setSelectedMood] = useState('all');
  const [timeUntilNext, setTimeUntilNext] = useState(null);
  const [moods, setMoods] = useState([
    { id: 'all', name: ' Sorpréndeme', icon: 'shuffle' },
    { id: 'comedy', name: ' Comedia', icon: 'happy-outline' },
    { id: 'horror', name: ' Terror', icon: 'skull-outline' },
    { id: 'drama', name: ' Drama', icon: 'film-outline' },
    { id: 'action', name: ' Acción', icon: 'flash-outline' },
    { id: 'romance', name: ' Romance', icon: 'heart-outline' },
    { id: 'thriller', name: ' Thriller', icon: 'search-outline' },
    { id: 'sci-fi', name: ' Sci-Fi', icon: 'rocket-outline' },
    { id: 'animation', name: ' Animación', icon: 'color-palette-outline' },
    { id: 'adventure', name: ' Aventura', icon: 'compass-outline' },
    { id: 'mystery', name: ' Misterio', icon: 'key-outline' },
    { id: 'fantasy', name: ' Fantasía', icon: 'star-outline' },
    { id: 'family', name: ' Familia', icon: 'people-outline' },
    { id: 'documentary', name: ' Documental', icon: 'document-text-outline' },
    { id: 'war', name: ' Bélica', icon: 'shield-outline' }
  ]);
  const [allGenres, setAllGenres] = useState([]);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Iniciar animaciones del header
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    loadDailyStatus();
    loadMoodsFromTMDB();
  }, []);

  // Actualizar contador de tiempo cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      if (dailyStatus?.recommendationTimestamps?.length > 0 && !dailyStatus.isPremium) {
        const now = new Date();
        const timestamps = dailyStatus.recommendationTimestamps
          .map(t => ({ original: t, date: new Date(t) }))
          .sort((a, b) => a.date - b.date);

        // Calcular tiempo restante para cada recomendación
        const recommendationsWithTime = timestamps.map(item => {
          const releaseTime = new Date(item.date.getTime() + 24 * 60 * 60 * 1000);
          const diffMs = Math.max(0, releaseTime - now);
          return {
            timestamp: item.original,
            releaseTime: releaseTime,
            remainingMs: diffMs,
            isExpired: diffMs === 0
          };
        });

        // Encontrar la próxima recomendación que se liberará (la más cercana a expirar)
        const nextRelease = recommendationsWithTime
          .filter(r => !r.isExpired)
          .sort((a, b) => a.remainingMs - b.remainingMs)[0];

        setTimeUntilNext(nextRelease ? nextRelease.remainingMs : null);

        // Si alguna recomendación expiró, recargar el estado para actualizar el contador
        const expiredCount = recommendationsWithTime.filter(r => r.isExpired).length;
        if (expiredCount > 0 && dailyStatus.dailyCount > 0) {
          loadDailyStatus();
        }
      } else {
        setTimeUntilNext(null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dailyStatus]);

  const loadDailyStatus = async () => {
    try {
      const status = await dailyRecommendationService.getDailyStatus();
      setDailyStatus(status);
    } catch (error) {
      console.error('Error loading daily status:', error);
    }
  };

  const loadMoodsFromTMDB = async () => {
    try {
      console.log('Cargando géneros desde TMDB...');
      const result = await dailyRecommendationService.getMoods();
      
      // Cargar todos los géneros adicionales
      if (result.allGenres && result.allGenres.length > 0) {
        console.log('Total de géneros TMDB disponibles:', result.allGenres.length);
        setAllGenres(result.allGenres);
      }
      
    } catch (error) {
      console.error('Error cargando géneros:', error);
    }
  };

  const handleGetRecommendation = async () => {
    if (loading) return;

    setLoading(true);
    
    console.log(`🎯 Solicitando recomendación con mood seleccionado: ${selectedMood}`);
    
    try {
      const result = await dailyRecommendationService.getDailyRecommendation(selectedMood);
      
      if (result.success) {
        const movieWithMood = {
          ...result.movie,
          mood: selectedMood
        };
        setCurrentMovie(movieWithMood);
        setShowCard(true);
        setDailyStatus(prev => ({
          ...prev,
          dailyCount: result.dailyCount,
          remaining: result.remainingRecommendations,
          isPremium: result.isPremium,
          recommendationTimestamps: result.recommendationTimestamps || prev?.recommendationTimestamps || []
        }));
      } else if (result.error === 'DAILY_LIMIT_EXCEEDED') {
        Alert.alert(
          '✨ Límite de Recomendaciones Alcanzado',
          'Has alcanzado tu límite diario de 3 recomendaciones. Suscríbete a CineMatch Pro para obtener recomendaciones ilimitadas.',
          [
            {
              text: 'Cancelar',
              style: 'cancel'
            },
            {
              text: 'Ir a Suscripciones',
              onPress: () => navigation.navigate('Suscripción')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener la recomendación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = (movie) => {
    // La lógica de compartir está en el componente
    console.log('Shared movie:', movie.title);
  };

  const handleReviews = (movie) => {
    console.log('Navegando a reseñas de:', movie.title);
    console.log('ID TMDB:', movie.tmdb_movie_id, 'ID local:', movie.id);
    
    // Para películas de TMDB, pasar ambos IDs y los datos de la película
    if (movie.tmdb_movie_id) {
      navigation.navigate('MovieReviews', { 
        movieId: movie.tmdb_movie_id,
        movieTitle: movie.title,
        tmdbId: movie.tmdb_movie_id,
        movieData: {
          title: movie.title,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          overview: movie.overview,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids || []
        }
      });
    } else {
      navigation.navigate('MovieReviews', {
        movieId: movie.id,
        movieTitle: movie.title
      });
    }
  };

  const handleWatchedMovie = async (movie) => {
    try {
      console.log('Marked as watched:', movie.title);
      Alert.alert('¡Perfecto!', 'Película marcada como vista');
    } catch (error) {
      console.error('Error marking movie as watched:', error);
    }
  };

  const handleResetRecommendations = async () => {
    console.log('Botón de reinicio comentado - solo para pruebas');
  };

  const getGenreIcon = (genreName) => {
    const iconMap = {
      'Acción': 'flash-outline',
      'Aventura': 'compass-outline',
      'Animación': 'color-palette-outline',
      'Comedia': 'happy-outline',
      'Crimen': 'alert-circle-outline',
      'Documental': 'document-text-outline',
      'Drama': 'film-outline',
      'Familia': 'people-outline',
      'Fantasía': 'star-outline',
      'Historia': 'book-outline',
      'Terror': 'skull-outline',
      'Música': 'musical-notes-outline',
      'Misterio': 'key-outline',
      'Romance': 'heart-outline',
      'Ciencia ficción': 'rocket-outline',
      'Película de TV': 'tv-outline',
      'Suspense': 'search-outline',
      'Bélica': 'shield-outline',
      'Western': 'crown-outline'
    };
    
    return iconMap[genreName] || 'film-outline';
  };

  const renderMoodSelector = () => {
    // Combinar moods principales con todos los géneros de TMDB
    const allMoods = [...moods];
    
    // Agregar todos los géneros de TMDB si están disponibles
    if (allGenres.length > 0) {
      // Mapeo de nombres para detectar duplicados por nombre
      const existingNames = moods.map(m => m.name.trim().toLowerCase());
      
      const additionalGenres = allGenres
        .filter(genre => {
          const genreId = genre.id.toString();
          const genreName = ' ' + genre.name;
          const genreNameLower = genreName.trim().toLowerCase();
          
          // Excluir si ya existe por ID
          const existingIds = moods.map(m => m.id);
          const isDuplicateById = existingIds.includes(genreId);
          
          // Excluir si ya existe por nombre
          const isDuplicateByName = existingNames.includes(genreNameLower);
          
          const isDuplicate = isDuplicateById || isDuplicateByName;
          
          if (isDuplicate) {
            console.log(`Excluyendo género duplicado: ${genre.name} (ID: ${genreId})`);
          }
          
          return !isDuplicate;
        })
        .map(genre => ({
          id: genre.id.toString(),
          name: ' ' + genre.name,
          icon: getGenreIcon(genre.name)
        }));
      
      allMoods.push(...additionalGenres);
      console.log(`Total de géneros mostrados: ${allMoods.length} (${moods.length} principales + ${additionalGenres.length} adicionales)`);
    }

    return (
      <View style={styles.moodSection}>
        <Text style={styles.sectionTitle}>¿Qué te apetece hoy?</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.moodContainer}
        >
          {allMoods.map((mood) => (
            <TouchableOpacity
              key={mood.id}
              style={[
                styles.moodButton,
                selectedMood === mood.id && styles.moodButtonSelected
              ]}
              onPress={() => setSelectedMood(mood.id)}
            >
              <Ionicons 
                name={mood.icon} 
                size={24} 
                color={selectedMood === mood.id ? colors.textDark : colors.textMuted} 
              />
              <Text style={[
                styles.moodButtonText,
                selectedMood === mood.id && styles.moodButtonTextSelected
              ]}>
                {mood.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStatusCard = () => {
    if (!dailyStatus) return null;

    const isPremium = dailyStatus.isPremium;

    if (isPremium) {
      return (
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Text style={styles.statusTitle}>🌟 Usuario Premium</Text>
            <Ionicons name="star" size={20} color={colors.primary} />
          </View>

          <View style={styles.statusInfo}>
            <Text style={[styles.statusText, { color: colors.primary }]}>
              ✨ Recomendaciones ilimitadas
            </Text>
            <Text style={styles.resetTime}>
              ¡Disfruta de películas ilimitadas!
            </Text>
          </View>
        </View>
      );
    }

    const usedCount = dailyStatus.dailyCount || 0;
    const remainingCount = dailyStatus.remaining || 0;
    const progress = (usedCount / 3) * 100;
    const remainingColor = remainingCount > 0 ? colors.success : colors.error;

    // Calcular cuándo se liberará la próxima recomendación
    let nextReleaseText = '';
    let releaseDetails = '';
    if (timeUntilNext !== null && timeUntilNext > 0) {
      const hours = Math.floor(timeUntilNext / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntilNext % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeUntilNext % (1000 * 60)) / 1000);

      if (hours > 0) {
        nextReleaseText = `Próxima recomendación en ${hours}h ${minutes}m ${seconds}s`;
        releaseDetails = `Cada recomendación se libera después de 24h`;
      } else if (minutes > 0) {
        nextReleaseText = `Próxima recomendación en ${minutes}m ${seconds}s`;
        releaseDetails = `Cada recomendación se libera después de 24h`;
      } else {
        nextReleaseText = `Próxima recomendación en ${seconds}s`;
        releaseDetails = `Cada recomendación se libera después de 24h`;
      }
    } else if (timeUntilNext === 0) {
      nextReleaseText = '¡Ya puedes obtener otra recomendación!';
    }

    // Calcular tiempos individuales para cada recomendación
    const individualTimes = dailyStatus.recommendationTimestamps?.map((timestamp, index) => {
      const recTime = new Date(timestamp);
      const releaseTime = new Date(recTime.getTime() + 24 * 60 * 60 * 1000);
      const now = new Date();
      const diffMs = Math.max(0, releaseTime - now);

      if (diffMs === 0) {
        return {
          index: index + 1,
          status: 'Disponible',
          timeText: 'Lista para usar'
        };
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      let timeStr = '';
      if (hours > 0) {
        timeStr = `${hours}h ${minutes}m`;
      } else if (minutes > 0) {
        timeStr = `${minutes}m ${seconds}s`;
      } else {
        timeStr = `${seconds}s`;
      }

      return {
        index: index + 1,
        status: 'En espera',
        timeText: `Libera en ${timeStr}`
      };
    }) || [];

    return (
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>Tus recomendaciones</Text>
          <Text style={styles.statusCount}>{usedCount}/3</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>

        <View style={styles.statusInfo}>
          <Text style={[styles.statusText, { color: remainingColor }]}>
            {remainingCount > 0
              ? `🎬 Te quedan ${remainingCount} recomendaciones`
              : '🚫 Has usado todas tus recomendaciones'
            }
          </Text>
          {nextReleaseText && (
            <Text style={[styles.resetTime, { color: remainingCount > 0 ? colors.textMuted : colors.primary }]}>
              {nextReleaseText}
            </Text>
          )}
          {releaseDetails && remainingCount === 0 && (
            <Text style={styles.resetTimeDetails}>
              {releaseDetails}
            </Text>
          )}
        </View>

        {/* Mostrar tiempos individuales de cada recomendación */}
        {individualTimes.length > 0 && (
          <View style={styles.individualTimesContainer}>
            <Text style={styles.individualTimesTitle}>Estado de cada recomendación:</Text>
            {individualTimes.map((item) => (
              <View key={item.index} style={styles.individualTimeItem}>
                <Text style={styles.individualTimeIndex}>#{item.index}</Text>
                <Text style={[
                  styles.individualTimeStatus,
                  { color: item.status === 'Disponible' ? colors.success : colors.textMuted }
                ]}>
                  {item.status}
                </Text>
                <Text style={styles.individualTimeText}>{item.timeText}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle={resolvedTheme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <View style={styles.headerBackground}>
        {/* Header con animaciones */}
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideUpAnim }]
          }
        ]}>
          <View style={styles.headerContent}>
            <View style={styles.headerBadge}>
              <Ionicons name="gift" size={16} color={colors.textDark} />
              <Text style={styles.headerBadgeText}>RECOMENDACIÓN DIARIA</Text>
            </View>
            <Text style={styles.headerTitle}>
              Descubrimiento Diario
            </Text>
            <Text style={styles.headerSubtitle}>
              Descubre tu película perfecta cada día
            </Text>
          </View>
        </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderStatusCard()}
        {renderMoodSelector()}

        <TouchableOpacity
          style={[
            styles.recommendButton,
            (!dailyStatus?.remaining && !dailyStatus?.isPremium) && styles.recommendButtonDisabled
          ]}
          onPress={handleGetRecommendation}
          disabled={!dailyStatus?.remaining && !dailyStatus?.isPremium}
        >
          {loading ? (
            <ActivityIndicator color={colors.textDark} size="large" />
          ) : (
            <>
              <Ionicons name="gift-outline" size={28} color={colors.textDark} />
              <Text style={styles.recommendButtonText}>
                {dailyStatus?.isPremium 
                  ? 'Obtener Recomendación' 
                  : dailyStatus?.remaining > 0 
                    ? 'Obtener Recomendación' 
                    : 'Sin recomendaciones disponibles'
                }
              </Text>
            </>
          )}
        </TouchableOpacity>

        {!dailyStatus?.remaining && !dailyStatus?.isPremium && (
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => navigation.navigate('Suscripción')}
          >
            <Ionicons name="diamond-outline" size={20} color={colors.primary} />
            <Text style={styles.upgradeButtonText}>
              Actualiza a Pro para recomendaciones ilimitadas
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      </View>

      <SimpleFlipCard
        movie={currentMovie}
        isVisible={showCard}
        onClose={() => {
          setShowCard(false);
          setTimeout(() => setCurrentMovie(null), 300);
        }}
        onShare={handleShare}
        onWatchedMovie={handleWatchedMovie}
        onReviews={handleReviews}
        remainingRecommendations={dailyStatus?.remaining || 0}
      />
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  headerBackground: {
    flex: 1,
    backgroundColor: colors.background
  },
  header: {
    paddingTop: spacing.xl + spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center'
  },
  headerContent: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    gap: spacing.md,
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textDark,
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: spacing.md,
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center'
  },
  content: {
    flex: 1,
    padding: spacing.lg
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 15,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow.lg,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  statusTitle: {
    ...typography.h4,
    color: colors.text
  },
  statusCount: {
    ...typography.h4,
    color: colors.primary
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: 4,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4
  },
  statusInfo: {
    alignItems: 'center'
  },
  statusText: {
    ...typography.body,
    color: colors.success,
    marginBottom: spacing.sm
  },
  resetTime: {
    fontSize: 12,
    color: colors.textMuted
  },
  resetTimeDetails: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 4
  },
  individualTimesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  individualTimesTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  individualTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 6
  },
  individualTimeIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginRight: spacing.sm,
    minWidth: 24
  },
  individualTimeStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginRight: spacing.sm,
    flex: 1
  },
  individualTimeText: {
    fontSize: 11,
    color: colors.textMuted
  },
  moodSection: {
    marginBottom: spacing.xl
  },
  sectionTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.lg
  },
  moodContainer: {
    paddingRight: spacing.md
  },
  moodButton: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.lg,
    minWidth: 80,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow.sm,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  moodButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  moodButtonText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm,
    textAlign: 'center'
  },
  moodButtonTextSelected: {
    color: colors.textDark,
    fontWeight: '600'
  },
  moodSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.sm
  },
  recommendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 25,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: colors.shadow.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8
  },
  recommendButtonDisabled: {
    backgroundColor: colors.textMuted,
    opacity: 0.5
  },
  recommendButtonText: {
    color: colors.textDark,
    ...typography.h4,
    marginLeft: spacing.md
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 25,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary
  },
  upgradeButtonText: {
    color: colors.primary,
    ...typography.body,
    fontWeight: '600',
    marginLeft: spacing.md
  }
});

export default DailyRecommendationScreen;
