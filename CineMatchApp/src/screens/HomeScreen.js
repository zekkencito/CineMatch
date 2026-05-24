import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  Animated,
  Image,
  Modal,
  ScrollView,
  PanResponder,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { userService } from '../services/userService';
import { matchService } from '../services/matchService';
import { gamificationService } from '../services/gamificationService';
import UserCard from '../components/UserCard';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';
import useCustomAlert from '../hooks/useCustomAlert';
import Icon from 'react-native-vector-icons/FontAwesome5';
import typography from '../constants/typography';
import spacing from '../constants/spacing';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  // Context and hooks
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const { alertConfig, showSuccess, showError, showWarning, showInfo, showConfirm, hideAlert } = useCustomAlert();
  const isPremium = user?.subscription?.is_premium || user?.is_premium;

  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [finished, setFinished] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUndoing, setIsUndoing] = useState(false);
  const [swiperKey, setSwiperKey] = useState(0);
  const [swiperStartIndex, setSwiperStartIndex] = useState(0);

  // Refs
  const swiperRef = useRef(null);
  const currentCardIndexRef = useRef(0);
  const isFetchingMoreRef = useRef(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;

  // PanResponder for modal swipe down gesture
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
            setModalVisible(false);
            setTimeout(() => setSelectedUser(null), 100);
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

  // Effects and animations
  useEffect(() => {
    loadUsers({ reset: true });
    
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const registerDailyActivity = async () => {
      if (!user?.id) return;
      try {
        const progress = await gamificationService.trackActivity(user.id, 'home_open');
        if (progress.newlyUnlocked?.length) {
          showInfo(
            '¡Nuevo marco desbloqueado!',
            'Has desbloqueado un nuevo marco de perfil. Equípalo en tu Perfil.'
          ).then(() => {
            navigation.navigate('Perfil');
          });
        }
      } catch (error) {
        // Silencioso
      }
    };

    registerDailyActivity();
  }, [user?.id, navigation]);

  useEffect(() => {
    if (modalVisible) {
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
  }, [modalVisible]);

  // Modal handlers
  const closeModal = useCallback(() => {
    Animated.timing(modalTranslateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setTimeout(() => setSelectedUser(null), 100);
    });
  }, []);

  // User action handlers
  const handleUndoSwipe = useCallback(async () => {
    if (!isPremium) {
      showInfo(
        '🌟 Función Premium',
        'Deshacer un swipe (Rewind) es exclusivo de CineMatch Premium. ¡Actualiza para recuperar ese perfil!',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Actualizar', onPress: () => navigation.navigate('Suscripción') }
        ]
      );
      return;
    }

    if (currentCardIndexRef.current === 0) {
      showWarning('Atención', 'No hay perfiles pasados en esta ronda para deshacer.');
      return;
    }

    try {
      setIsUndoing(true);
      const res = await matchService.undoSwipe();
      if (res && res.success) {
        if (swiperRef.current) {
          swiperRef.current.swipeBack();
          currentCardIndexRef.current -= 1;
        }
      }
    } catch (error) {
      showWarning('Aviso', error.message || 'No hay acciones recientes para deshacer.');
    } finally {
      setIsUndoing(false);
    }
  }, [isPremium, navigation]);

  const handleRefresh = useCallback(() => {
    loadUsers({ reset: true });
  }, []);

  const handleCardPress = useCallback(async (cardIndex) => {
    const u = users && users[cardIndex];
    if (u) {
      setSelectedUser(u);
      setModalVisible(true);
      
      // Load full profile data
      try {
        const fullProfile = await userService.getUserProfile(u.id);
        const profileData = fullProfile?.user || fullProfile;
        if (profileData) {
          setSelectedUser(prev => ({ ...prev, ...profileData }));
        }
      } catch (e) {
        // Silencioso: mostrar datos básicos
      }
    }
  }, [users]);

  const loadUsers = async ({ reset = false } = {}) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setFinished(false);
        currentCardIndexRef.current = 0;
      } else {
        if (isFetchingMoreRef.current) {
          return;
        }

        isFetchingMoreRef.current = true;
        setIsFetchingMore(true);
      }

      const p = reset ? 1 : page;
      const resp = await userService.getUsers({ page: p, per_page: perPage });
      const fetched = (resp.users || []).filter(u => u && u.id && u.name);

      if (reset) {
        setSwiperStartIndex(0);
        setUsers(fetched);
        setSwiperKey(k => k + 1); // Re-monta el swiper limpio desde 0
      } else if (fetched.length > 0) {
        // Capturar índice actual ANTES de actualizar el estado
        const resumeAt = currentCardIndexRef.current;
        setUsers(prev => [...prev, ...fetched]);
        // Re-montar el swiper restaurando la posición donde estaba el usuario
        setSwiperStartIndex(resumeAt);
        setSwiperKey(k => k + 1);
      }

      const meta = resp.meta || {};
      if (fetched.length < perPage || (meta.page && meta.per_page && meta.total && (meta.page * meta.per_page) >= meta.total)) {
        setFinished(true);
      }

      if (fetched.length > 0) setPage(p + 1);

    } catch (error) {
      console.error('❌ Error loading users:', error);
      showError('Error', 'Problema al cargar Amigos Palomeros. Por favor, revisa tu conexión e inténtalo de nuevo.');
      if (reset) setUsers([]);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
      isFetchingMoreRef.current = false;
    }
  };

  const handleSwiped = async (cardIndex, direction) => {
    const swipedUser = users[cardIndex];

    console.log('Swipe detected in Amigos Palomeros:', {
      cardIndex,
      direction,
      usersLength: users.length,
      swipedUserId: swipedUser?.id,
      swipedUserName: swipedUser?.name,
    });

    // Validar que el usuario exista
    if (!swipedUser || !swipedUser.id) {
      console.warn('Usuario no válido en swipe:', {
        cardIndex,
        direction,
        swipedUser,
        usersLength: users.length,
      });
      return;
    }

    const type = direction === 'right' ? 'like' : 'dislike';

    try {
      const result = await matchService.sendLike(swipedUser.id, type);
      if (user?.id) {
        await gamificationService.trackActivity(user.id, 'swipe');
      }
      if (result.matched) {
        showSuccess(
          "🎬 Encontramos un Amigo de Butaca!",
          `¡${swipedUser.name} y tú tienen gustos similares! Pueden comenzar a chatear.`,
          [
            { text: 'Seguir viendo', style: 'cancel' },
            { text: 'Ir al Chat', onPress: () => navigation.navigate('Chats', { screen: 'Chat', params: { match: result.match } }) }
          ]
        );
      }
    } catch (error) {
      console.error('Error sending like:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        cardIndex,
        direction,
        swipedUser,
      });
    }
  };

  const handleSwipedAll = () => {
    if (isFetchingMoreRef.current) {
      return;
    }

    showInfo(
      "🎬 ¡Ya no hay más!",
      "Ya viste a todos los usuarios disponibles en tu área. Puedes recargar para buscar nuevos.",
      [
        { text: 'OK', style: 'cancel' },
        { text: 'Recargar', onPress: () => loadUsers({ reset: true }) }
      ]
    );
  };

  // Loading state
  if (loading) {
    return (
      <LinearGradient
        colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
        style={styles.centerContainer}
      >
        <View style={styles.backgroundElements}>
          <View style={styles.bgOrbTop} />
          <View style={styles.bgOrbBottom} />
        </View>
        
        <View style={styles.loadingBox}>
          <Animated.View
            style={[
              styles.loadingLogoBox,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                }) }]
              }
            ]}
          >
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Encontrando Amigos de Butaca...</Text>
        </View>
      </LinearGradient>
    );
  }

  // Empty state
  if (users.length === 0) {
    return (
      <LinearGradient
        colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
        style={styles.centerContainer}
      >
        <View style={styles.backgroundElements}>
          <View style={styles.bgOrbTop} />
          <View style={styles.bgOrbBottom} />
        </View>
        
        <View style={styles.emptyContainer}>
          <Animated.View
            style={[
              styles.emptyIconContainer,
              {
                opacity: fadeAnim,
                transform: [{ scale: fadeAnim }]
              }
            ]}
          >
            <Icon name="theater-masks" size={80} color={colors.primary} />
          </Animated.View>
          <Text style={styles.emptyText}>No hay más Amigos de Butaca cerca</Text>
          <Text style={styles.emptySubtext}>Vuelve más tarde para encontrar más amantes del cine</Text>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={handleRefresh}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Icon name="sync" size={16} color={colors.textDark} style={{ marginRight: 6 }} />
            <Text style={styles.reloadButtonText}>Recargar</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
      style={styles.container}
    >
      {/* Background decorative elements */}
      <View style={styles.backgroundElements}>
        <View style={styles.bgOrbTop} />
        <View style={styles.bgOrbBottom} />
        <View style={styles.bgOrbRight} />
      </View>

      {/* Enhanced Header */}
      <Animated.View style={[
        styles.header,
        {
          opacity: fadeAnim,
          transform: [{ translateY: headerSlideAnim }]
        }
      ]}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.headerPill}>
              <Text style={styles.headerPillText}>🎬 DESCUBRIR</Text>
            </View>
            {isPremium && (
              <TouchableOpacity
                style={styles.premiumBadge}
                onPress={() => navigation.navigate('Suscripción')}
                activeOpacity={0.8}
              >
                <Icon name="star" size={14} color="#ffd700" />
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.subtitle}>Desliza y conecta con tus Amigos de Butaca</Text>
          </View>
        </View>
      </Animated.View>

      {/* Floating refresh button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Icon name="sync" size={20} color={colors.textDark} />
      </TouchableOpacity>

      {/* Swiper Container */}
<View style={styles.swiperContainer}>
<Swiper
key={swiperKey}
ref={swiperRef}
cards={users}
cardIndex={swiperStartIndex}
renderCard={(user) => {
if (!user || !user.id) {
return null;
}
return <UserCard user={user} />;
}}
onSwiped={(cardIndex) => {
currentCardIndexRef.current = cardIndex + 1;
const remaining = users.length - (cardIndex + 1);
if (!finished && remaining < 5 && !isFetchingMore) {
loadUsers({ reset: false });
}
}}
onSwipedLeft={(cardIndex) => handleSwiped(cardIndex, 'left')}
onSwipedRight={(cardIndex) => handleSwiped(cardIndex, 'right')}
onSwipedAll={() => {
if (!finished) {
loadUsers({ reset: false });
} else {
handleSwipedAll();
}
}}
backgroundColor="transparent"
stackSize={1}
stackScale={5}
stackSeparation={14}
animateCardOpacity
verticalSwipe={false}
disableBottomSwipe
disableTopSwipe
onTapCard={handleCardPress}
infinite={false}
overlayLabels={{
left: {
title: 'NO GRACIAS',
style: {
label: {
backgroundColor: colors.textDark,
borderColor: colors.textDark,
color: colors.accent,
borderWidth: 2,
fontSize: 28,
fontWeight: 'bold',
borderRadius: 12,
padding: 12,
},
wrapper: {
flexDirection: 'column',
alignItems: 'flex-end',
justifyContent: 'flex-start',
marginTop: 50,
marginLeft: -30,
},
},
},
right: {
title: '🍿 MATCH',
style: {
label: {
backgroundColor: colors.primary,
borderColor: colors.primary,
color: colors.textDark,
borderWidth: 2,
fontSize: 28,
fontWeight: 'bold',
borderRadius: 12,
padding: 12,
},
wrapper: {
flexDirection: 'column',
alignItems: 'flex-start',
justifyContent: 'flex-start',
marginTop: 50,
marginLeft: 30,
},
},
},
}}
/>
</View>

      {/* Enhanced Action Buttons */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => swiperRef.current && swiperRef.current.swipeLeft()}
          activeOpacity={0.7}
        >
          <Icon name="times" size={28} color={colors.primary} />
        </TouchableOpacity>

        {/* Rewind Button */}
        <TouchableOpacity
          style={[styles.undoButton, !isPremium && styles.undoButtonDisabled]}
          onPress={handleUndoSwipe}
          activeOpacity={0.8}
          disabled={isUndoing || loading || !isPremium}
        >
          {isUndoing ? (
            <ActivityIndicator size="small" color={colors.textDark} />
          ) : (
            <Icon name="undo" size={18} color={colors.textDark} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => swiperRef.current && swiperRef.current.swipeRight()}
          activeOpacity={0.7}
        >
          <Icon name="smile" size={28} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet Modal: muestra películas cuando se toca una tarjeta */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={closeModal}
          />

          <Animated.View
            style={[
              styles.bottomSheetContainer,
              {
                transform: [{ translateY: modalTranslateY }],
              }
            ]}
          >
            {/* Handle para indicar que se puede deslizar */}
            <View {...panResponder.panHandlers} style={styles.handleContainer}>
              <View style={styles.handle} />
            </View>

            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>
                {selectedUser?.name || 'Películas'}
              </Text>
              <Text style={styles.bottomSheetSubtitle}>
                🎬 {selectedUser?.watched_movies_list?.length || 0} películas vistas
              </Text>
            </View>

            <ScrollView
              contentContainerStyle={styles.moviesScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Generos favoritos del usuario */}
              {(selectedUser?.favorite_genres && selectedUser.favorite_genres.length > 0) ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Géneros favoritos</Text>
                  <View style={styles.modalTagsRow}>
                    {selectedUser.favorite_genres
                      .filter(g => g != null)
                      .map((genre, index) => {
                        const name = typeof genre === 'object' && genre.name
                          ? genre.name
                          : (typeof genre === 'string' ? genre : 'Género');
                        return (
                          <View key={'mg-' + index} style={styles.modalTag}>
                            <Text style={styles.modalTagText}>{name}</Text>
                          </View>
                        );
                      })}
                  </View>
                </View>
              ) : null}

              {/* Directores favoritos del usuario */}
              {(() => {
                // Buscar directores en ambos formatos posibles de la API
                const dirs = selectedUser?.favorite_directors || selectedUser?.favoriteDirectors || [];
                const dirList = Array.isArray(dirs) ? dirs.filter(d => d != null) : [];
                if (dirList.length === 0) return null;
                return (
                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Directores favoritos</Text>
                    <View style={styles.directorsGrid}>
                      {dirList.map((director, index) => {
                        const name = typeof director === 'object' && director.name
                          ? director.name
                          : (typeof director === 'string' ? director : 'Director');
                        const profilePath = typeof director === 'object' ? director.profile_path : null;
                        const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
                        return (
                          <View key={'md-' + index} style={styles.directorCard}>
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
              {(selectedUser?.watched_movies_list && selectedUser.watched_movies_list.length > 0) ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Películas vistas</Text>
                </View>
              ) : null}
              {(selectedUser?.watched_movies_list || []).map((m) => (
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
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </LinearGradient>
  );
};

const createStyles = (colors) => StyleSheet.create({
  // Layout and container styles
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Background decorative elements
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  bgOrbTop: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: colors.gradient.accentGlow,
    opacity: 0.45,
  },
  bgOrbBottom: {
    position: 'absolute',
    bottom: 40,
    left: -90,
    width: 230,
    height: 230,
    borderRadius: 130,
    backgroundColor: colors.overlayLight,
    opacity: 0.35,
  },
  bgOrbRight: {
    position: 'absolute',
    top: SCREEN_HEIGHT * 0.3,
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,215,0,0.04)',
  },

  // Loading state styles
  loadingBox: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  loadingLogoBox: {
    width: 200,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  loadingText: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginTop: spacing.md,
    textAlign: 'center',
  },

  // Empty state styles
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconContainer: {
    marginBottom: spacing.xl,
  },
  emptyText: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: '700',
  },
  emptySubtext: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 24,
  },
  reloadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reloadButtonText: {
    ...typography.bodyStrong,
    color: colors.textDark,
    fontWeight: '800',
    letterSpacing: 0.5,
    fontSize: 14,
  },
  // Header styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 32 : 38,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    position: 'relative',
    marginTop: spacing.sm,
  },
  headerContent: {
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: spacing.sm,
  },
  headerPill: {
    backgroundColor: 'rgba(245,197,24,0.18)',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  headerPillText: {
    ...typography.smallStrong,
    color: colors.primary,
    letterSpacing: 0.9,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245,197,24,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary,
    zIndex: 10,
  },
  premiumBadgeText: {
    ...typography.smallStrong,
    color: colors.primary,
    marginLeft: spacing.xs,
    letterSpacing: 0.5,
  },
  logoContainer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBox: {
    height: 92,
    width: 156,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    letterSpacing: 0.35,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Swiper container styles
  swiperContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: -24,
    marginBottom: 0,
    paddingHorizontal: spacing.md,
  },

  // Action buttons styles
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 100 : 96,
    paddingTop: spacing.lg,
    zIndex: 20,
    elevation: 0,
    backgroundColor: 'transparent',
    marginHorizontal: spacing.lg,
  },
  rejectButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  },
  acceptButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  },
  undoButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 0,
  },
  undoButtonDisabled: {
    opacity: 0.5,
  },
  refreshButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 18 : 16,
    right: spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 7,
    zIndex: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  refreshButtonIcon: {
    fontSize: 20,
    color: colors.textDark,
    fontWeight: '900',
  },

  // Bottom Sheet styles
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
    maxHeight: SCREEN_HEIGHT * 0.75,
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
  bottomSheetHeader: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomSheetTitle: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: spacing.sm,
    fontWeight: '800',
  },
  bottomSheetSubtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  moviesScrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  movieItemContainer: {
    marginBottom: spacing.xl,
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
    marginTop: spacing.sm,
    fontWeight: '700',
    fontSize: 16,
    color: colors.textDark,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  // Modal section styles
  modalSection: {
    marginBottom: spacing.md,
  },
  modalSectionTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
    fontWeight: '800',
  },
  modalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  modalTag: {
    backgroundColor: '#000',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalTagText: {
    ...typography.smallStrong,
    color: colors.primary,
    fontWeight: '700',
  },
  
  // Directors grid styles
  directorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
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
    marginBottom: spacing.sm,
  },
  directorPhotoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
});

export default HomeScreen;
