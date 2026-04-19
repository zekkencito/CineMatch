import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  RefreshControl,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { matchService } from '../services/matchService';
import { userService } from '../services/userService';
import { gamificationService } from '../services/gamificationService';
import MatchItem from '../components/MatchItem';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { faMasksTheater } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTicket, faStar, faHeart } from '@fortawesome/free-solid-svg-icons';
import api from '../config/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MatchesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const isPremium = user?.is_premium || user?.subscription?.is_premium;
  const [matches, setMatches] = useState([]);
  const [unreadPerMatch, setUnreadPerMatch] = useState({});
  const [likesReceived, setLikesReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Profile modal state
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const modalTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          modalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          Animated.timing(modalTranslateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setProfileModalVisible(false);
            setTimeout(() => setSelectedProfile(null), 100);
          });
        } else {
          Animated.spring(modalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (profileModalVisible) {
      Animated.spring(modalTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(modalTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [profileModalVisible]);

  // Recargar matches cada vez que la pantalla sea visible
  useFocusEffect(
    React.useCallback(() => {
      loadMatches();
      loadLikesReceived();
      loadUnreadPerMatch();
      if (user?.id) {
        gamificationService.trackActivity(user.id, 'matches_open').catch(() => {});
      }
    }, [user?.id])
  );

  const loadMatches = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await matchService.getMatches();
      // Filtrar matches válidos y extraer información del usuario
      const validMatches = (data || []).filter(m => m && m.user && m.user.id);
      setMatches(validMatches);

      // Animar cuando se cargan los datos (solo en carga inicial)
      if (!isRefreshing) {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } catch (error) {
      console.error('Error al cargar los  Amigos de Butaca:', error);
      if (!isRefreshing) {
        Alert.alert('Error', '  Error al cargar los Amigos de Butaca. Por favor, verifica tu conexión e inténtalo de nuevo.');
      }
      setMatches([]);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const loadLikesReceived = async () => {
    try {
      const data = await matchService.getWhoLikedMe();
      setLikesReceived(data?.likes || []);
    } catch (e) {
      console.warn('No se pudieron cargar los likes recibidos:', e);
    }
  };

  const loadUnreadPerMatch = async () => {
    try {
      const res = await api.get('/messages/unread-per-match');
      setUnreadPerMatch(res.data.unread_per_match || {});
    } catch (e) {
      // silencioso
    }
  };

  const handleMatchPress = (match) => {
    if (user?.id) {
      gamificationService.trackActivity(user.id, 'chat_open').catch(() => {});
    }
    navigation.navigate('Chat', { match });
  };

  const closeProfileModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setProfileModalVisible(false);
      setTimeout(() => setSelectedProfile(null), 100);
    });
  };

  const handleAvatarPress = async (match) => {
    const matchUser = match.user || match;
    setSelectedProfile(matchUser);
    setProfileModalVisible(true);
    // Fetch full profile data (directors, movies)
    try {
      const fullProfile = await userService.getUserProfile(matchUser.id);
      const profileData = fullProfile?.user || fullProfile;
      if (profileData) {
        setSelectedProfile(prev => ({ ...prev, ...profileData }));
      }
    } catch (e) {
      // Silent: show basic data from match
    }
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.gradient.start, colors.gradient.end]}
        style={styles.centerContainer}
      >
        <View style={styles.loadingBox}>
          <View style={styles.loadingLogoBox}>
            <Image
              source={require('../../assets/logo.png')}
              style={{ width: '100%', height: '100%' }}
              resizeMode="contain"
            />
          </View>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Cargando tus amigos de butaca...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
      style={styles.container}
    >
      <View style={styles.backgroundGlowTop} pointerEvents="none" />
      <View style={styles.backgroundGlowBottom} pointerEvents="none" />

      <Animated.View
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={styles.headerTop}>
          <View style={styles.iconBox}>
            <FontAwesomeIcon icon={faTicket} size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Amigos de Butaca</Text>
        </View>
        <Text style={styles.subtitle}>
          {matches.length === 0
            ? 'Aún no tienes Amigos de Butaca'
            : `${matches.length} ${matches.length === 1 ? 'amigo de butaca' : 'amigos de butaca'} que comparten tu gusto`
          }
        </Text>
      </Animated.View>

      {/* Sección: Quién te dio Like */}
      {likesReceived.length > 0 && (
        <View style={styles.likesSection}>
          <View style={styles.likesSectionHeader}>
            <FontAwesomeIcon icon={faHeart} size={16} color={colors.primary} />
            <Text style={styles.likesSectionTitle}>
              {isPremium ? `${likesReceived.length} personas te dieron Like` : 'Alguien te dio Like 👀'}
            </Text>
            {!isPremium && (
              <TouchableOpacity
                onPress={() => navigation.navigate('Suscripción')}
                style={styles.premiumBtn}
              >
                <FontAwesomeIcon icon={faStar} size={12} color="#fff" />
                <Text style={styles.premiumBtnText}>Premium</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.likesRow}>
            {likesReceived.map((like, index) => (
              <View key={like.id} style={styles.likeAvatarWrap}>
                {isPremium ? (
                  <Image
                    source={{ uri: like.from_user?.profile_photo }}
                    style={styles.likeAvatar}
                  />
                ) : (
                  <View style={styles.likeAvatarBlurred}>
                    <Text style={styles.likeAvatarBlurText}>?</Text>
                  </View>
                )}
                {isPremium && (
                  <Text style={styles.likeAvatarName} numberOfLines={1}>
                    {like.from_user?.name?.split(' ')[0]}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {matches.length === 0 ? (
        <Animated.View
          style={[
            styles.emptyContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <FontAwesomeIcon icon={faMasksTheater} size={64} color={colors.primary} />
          <Text style={styles.emptyText}>Aún no tienes Amigos de Butaca</Text>
          <Text style={styles.emptySubtext}>
            Comienza a hacer swipes para encontrar personas que compartan tu gusto en películas.
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MatchItem
              match={item}
              onPress={handleMatchPress}
              onAvatarPress={handleAvatarPress}
              unreadCount={unreadPerMatch[item.id] || 0}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadMatches(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
              title="Actualizando..."
              titleColor={colors.textSecondary}
            />
          }
        />
      )}

      {/* Profile Bottom Sheet Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeProfileModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeProfileModal}
          />

          <Animated.View
            style={[
              styles.bottomSheetContainer,
              { transform: [{ translateY: modalTranslateY }] },
            ]}
          >
            {/* Handle */}
            <View {...panResponder.panHandlers} style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            {/* Header con foto y nombre */}
            <View style={styles.profileHeader}>
              <Image
                source={{ uri: selectedProfile?.profile_photo || 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=200' }}
                style={styles.profilePhoto}
              />
              <View style={styles.profileHeaderInfo}>
                <Text style={styles.profileName}>
                  {selectedProfile?.name || 'Usuario'}
                  {selectedProfile?.age ? `, ${selectedProfile.age}` : ''}
                </Text>
                {selectedProfile?.bio ? (
                  <Text style={styles.profileBio} numberOfLines={3}>
                    {selectedProfile.bio}
                  </Text>
                ) : null}
              </View>
            </View>

            <ScrollView
              contentContainerStyle={styles.profileScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Porcentaje de coincidencia */}
              {selectedProfile?.match_percentage ? (
                <View style={styles.coincidenciaBox}>
                  <Text style={styles.coincidenciaPercent}>{selectedProfile.match_percentage}%</Text>
                  <Text style={styles.coincidenciaLabel}>Porcentaje de Coincidencia</Text>
                </View>
              ) : null}

              {/* En común */}
              {((selectedProfile?.common_genres_count && selectedProfile.common_genres_count > 0) ||
                (selectedProfile?.common_directors_count && selectedProfile.common_directors_count > 0) ||
                (selectedProfile?.common_movies_count && selectedProfile.common_movies_count > 0)) ? (
                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>🎬 En común</Text>
                  <View style={styles.commonRow}>
                    {selectedProfile.common_genres_count > 0 && (
                      <View style={styles.commonItem}>
                        <Text style={styles.commonCount}>{selectedProfile.common_genres_count}</Text>
                        <Text style={styles.commonLabel}>género{selectedProfile.common_genres_count > 1 ? 's' : ''}</Text>
                      </View>
                    )}
                    {selectedProfile.common_directors_count > 0 && (
                      <View style={styles.commonItem}>
                        <Text style={styles.commonCount}>{selectedProfile.common_directors_count}</Text>
                        <Text style={styles.commonLabel}>director{selectedProfile.common_directors_count > 1 ? 'es' : ''}</Text>
                      </View>
                    )}
                    {selectedProfile.common_movies_count > 0 && (
                      <View style={styles.commonItem}>
                        <Text style={styles.commonCount}>{selectedProfile.common_movies_count}</Text>
                        <Text style={styles.commonLabel}>película{selectedProfile.common_movies_count > 1 ? 's' : ''}</Text>
                      </View>
                    )}
                  </View>
                </View>
              ) : null}

              {/* Géneros favoritos */}
              {(selectedProfile?.favorite_genres && selectedProfile.favorite_genres.length > 0) ? (
                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>Géneros favoritos</Text>
                  <View style={styles.tagsRow}>
                    {selectedProfile.favorite_genres
                      .filter(g => g != null)
                      .map((genre, index) => {
                        const name = typeof genre === 'object' && genre.name ? genre.name : (typeof genre === 'string' ? genre : 'Género');
                        return (
                          <View key={'pg-' + index} style={styles.tag}>
                            <Text style={styles.tagText}>{name}</Text>
                          </View>
                        );
                      })}
                  </View>
                </View>
              ) : null}

              {/* Directores favoritos */}
              {(() => {
                const dirs = selectedProfile?.favorite_directors || selectedProfile?.favoriteDirectors || [];
                const dirList = Array.isArray(dirs) ? dirs.filter(d => d != null) : [];
                if (dirList.length === 0) return null;
                return (
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>Directores favoritos</Text>
                    <View style={styles.directorsGrid}>
                      {dirList.map((director, index) => {
                        const name = typeof director === 'object' && director.name ? director.name : (typeof director === 'string' ? director : 'Director');
                        const profilePath = typeof director === 'object' ? director.profile_path : null;
                        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
                        return (
                          <View key={'pd-' + index} style={styles.directorCard}>
                            {profilePath ? (
                              <Image
                                source={{ uri: `https://image.tmdb.org/t/p/w185${profilePath}` }}
                                style={styles.directorPhoto}
                              />
                            ) : (
                              <View style={styles.directorPhotoPlaceholder}>
                                <Text style={styles.directorInitials}>{initials}</Text>
                              </View>
                            )}
                            <Text style={styles.directorName} numberOfLines={2}>{name}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                );
              })()}

              {/* Películas vistas */}
              {(() => {
                const movies = selectedProfile?.watched_movies_list || selectedProfile?.watched_movies || [];
                if (movies.length === 0) return null;
                return (
                  <View style={styles.profileSection}>
                    <Text style={styles.profileSectionTitle}>Películas vistas</Text>
                    {movies.map((m) => (
                      <View key={m.tmdb_id || m.id} style={styles.movieItemContainer}>
                        {m.poster_path ? (
                          <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w300${m.poster_path}` }}
                            style={styles.moviePoster}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.moviePosterPlaceholder}>
                            <Text style={styles.moviePosterIcon}>🎬</Text>
                          </View>
                        )}
                        <Text style={styles.movieTitle}>{m.title || m.name}</Text>
                      </View>
                    ))}
                  </View>
                );
              })()}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGlowTop: {
    position: 'absolute',
    top: -110,
    left: -70,
    width: 230,
    height: 230,
    borderRadius: 120,
    backgroundColor: colors.gradient.accentGlow,
    opacity: 0.3,
  },
  backgroundGlowBottom: {
    position: 'absolute',
    bottom: 70,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 120,
    backgroundColor: colors.overlayLight,
    opacity: 0.24,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingBox: {
    alignItems: 'center',
    gap: 16,
  },
  loadingLogoBox: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 42,
    paddingHorizontal: 18,
    paddingBottom: 16,
    gap: 12,
    marginHorizontal: 0,
    marginTop: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 29,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.6,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginLeft: 2,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 120,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  likesSection: {
    marginHorizontal: 20,
    marginBottom: 14,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 10,
    elevation: 4,
  },
  likesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  likesSectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
    flex: 1,
  },
  premiumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  premiumBtnText: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '800',
  },
  likesRow: {
    flexDirection: 'row',
  },
  likeAvatarWrap: {
    alignItems: 'center',
    marginRight: 12,
    width: 60,
  },
  likeAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  likeAvatarBlurred: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  likeAvatarBlurText: {
    fontSize: 24,
    color: colors.textSecondary,
    fontWeight: '900',
  },
  likeAvatarName: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    width: 60,
  },
  // Profile Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContainer: {
    backgroundColor: colors.secondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: SCREEN_HEIGHT * 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.textSecondary,
    opacity: 0.5,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    gap: 14,
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  profileHeaderInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 4,
  },
  profileBio: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  profileScrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  coincidenciaBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(245, 197, 24, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#F5C518',
  },
  coincidenciaPercent: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F5C518',
  },
  coincidenciaLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F5C518',
    marginTop: 2,
  },
  profileSection: {
    marginBottom: 16,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  commonRow: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  commonItem: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 80,
  },
  commonCount: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  commonLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  tagText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  directorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  directorCard: {
    width: 80,
    alignItems: 'center',
  },
  directorPhoto: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.primary,
    marginBottom: 6,
  },
  directorPhotoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  directorInitials: {
    color: colors.textDark,
    fontSize: 20,
    fontWeight: '900',
  },
  directorName: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  movieItemContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  moviePoster: {
    width: 200,
    height: 300,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  moviePosterPlaceholder: {
    width: 200,
    height: 300,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moviePosterIcon: {
    fontSize: 48,
  },
  movieTitle: {
    marginTop: 10,
    fontWeight: '700',
    fontSize: 16,
    color: colors.textDark,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default MatchesScreen;
