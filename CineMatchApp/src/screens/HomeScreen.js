import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
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
import UserCard from '../components/UserCard';
import OnboardingTutorial from '../components/OnboardingTutorial';
import colors from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMasksTheater, faStar, faReply, faXmark, faFaceSmile } from '@fortawesome/free-solid-svg-icons';
import { tutorialService } from '../services/tutorialService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [finished, setFinished] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const swiperRef = useRef(null);
  const [swiperKey, setSwiperKey] = useState(0);
  const [swiperStartIndex, setSwiperStartIndex] = useState(0);
  const currentCardIndexRef = useRef(0);
  // Estado del tutorial onboarding
  const [showTutorial, setShowTutorial] = useState(false);

  // Animación para fade in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animación para bottom sheet
  const modalTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // PanResponder para swipe hacia abajo
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Solo activar si es swipe vertical hacia abajo
        return gestureState.dy > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          modalTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150) {
          // Cerrar modal si se desliza más de 150px
          Animated.timing(modalTranslateY, {
            toValue: SCREEN_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setModalVisible(false);
            setTimeout(() => setSelectedUser(null), 100);
          });
        } else {
          // Volver a posición original
          Animated.spring(modalTranslateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    loadUsers({ reset: true });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
    // Verificar si el tutorial debe mostrarse
    checkTutorial();
  }, []);

  // Consulta si el onboarding ya fue completado
  const checkTutorial = async () => {
    const completed = await tutorialService.isCompleted();
    if (!completed) {
      setShowTutorial(true);
    }
  };

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

  const closeModal = () => {
    Animated.timing(modalTranslateY, {
      toValue: SCREEN_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      setTimeout(() => setSelectedUser(null), 100);
    });
  };

  const [isUndoing, setIsUndoing] = useState(false);
  const isPremium = user?.subscription?.is_premium || user?.is_premium;

  const handleUndoSwipe = async () => {
    if (!isPremium) {
      Alert.alert(
        'Función Premium 🌟',
        'Deshacer un swipe (Rewind) es una función exclusiva de CineMatch Premium. ¡Actualiza para recuperar a ese perfil!',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Ver Planes', onPress: () => navigation.navigate('Suscripción') },
        ]
      );
      return;
    }

    if (currentCardIndexRef.current === 0) {
      Alert.alert('Atención', 'No hay perfiles pasados en esta ronda para deshacer.');
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
      Alert.alert('Aviso', error.message || 'No hay acciones recientes para deshacer.');
    } finally {
      setIsUndoing(false);
    }
  };

  const loadUsers = async ({ reset = false } = {}) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setFinished(false);
        currentCardIndexRef.current = 0;
      } else {
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
      Alert.alert('Error', 'Problema al cargar Amigos Palomeros. Por favor, revisa tu conexión e inténtalo de nuevo.');
      if (reset) setUsers([]);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const handleSwiped = async (cardIndex, direction) => {
    const swipedUser = users[cardIndex];

    // Validar que el usuario exista
    if (!swipedUser || !swipedUser.id) {
      console.warn('Usuario no válido:', cardIndex);
      return;
    }

    const type = direction === 'right' ? 'like' : 'dislike';

    try {
      const result = await matchService.sendLike(swipedUser.id, type);
      if (result.matched) {
        Alert.alert(
          "🎬 Encontramos un Amigo de Butaca!",
          `¡${swipedUser.name} y tú tienen gustos similares! Pueden comenzar a chatear.`,
          [
            { text: 'Seguir buscando', style: 'cancel' },
            { text: 'Chatear ahora', onPress: () => navigation.navigate('Amigos de Butaca') },
          ]
        );
      }
    } catch (error) {
      console.error('Error sending like:', error);
    }
  };

  const handleSwipedAll = () => {
    Alert.alert(
      "🎬 ¡Ya no hay más!",
      "Ya viste a todos los usuarios disponibles en tu área. Puedes recargar para buscar nuevos.",
      [
        {
          text: 'Recargar',
          onPress: () => {
            loadUsers();
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.centerContainer}
      >
        <View style={styles.loadingBox}>
          <View style={styles.loadingLogoBox}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Encontrando Amigos Palomeros...</Text>
        </View>
      </LinearGradient>
    );
  }

  if (users.length === 0) {
    return (
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.centerContainer}
      >
        <View style={styles.emptyContainer}>
          <FontAwesomeIcon icon={faMasksTheater} size={64} color={colors.primary} />
          <Text style={styles.emptyText}>No hay más Amigos Palomeros cerca</Text>
          <Text style={styles.emptySubtext}>Vuelve a revisar más tarde para encontrar más amantes del cine!</Text>
          <TouchableOpacity
            style={styles.reloadButton}
            onPress={() => loadUsers({ reset: true })}
            activeOpacity={0.8}
            disabled={loading}
          >
            <Text style={styles.reloadButtonText}>Recargar ↻</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[colors.secondary, colors.secondaryLight]}
      style={styles.container}
    >
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        {isPremium && (
          <TouchableOpacity
            style={styles.premiumBadge}
            onPress={() => navigation.navigate('Suscripción')}
          >
            <FontAwesomeIcon icon={faStar} size={14} color="#ffd700" />
            <Text style={styles.premiumBadgeText}>PREMIUM</Text>
          </TouchableOpacity>
        )}
        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.subtitle}>Desliza para encontrar a tus amigos cinéfilos</Text>
      </Animated.View>

      {/* Botón flotante de refresh */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => loadUsers({ reset: true })}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.refreshButtonIcon}>↻</Text>
      </TouchableOpacity>

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
          stackSize={3}
          stackScale={5}
          stackSeparation={14}
          animateCardOpacity
          verticalSwipe={false}
          disableBottomSwipe
          disableTopSwipe
          onTapCard={async (cardIndex) => {
            const u = users && users[cardIndex];
            if (u) {
              // Mostrar datos basicos inmediatamente
              setSelectedUser(u);
              setModalVisible(true);
              // Cargar datos completos (incluye directores con foto)
              try {
                const fullProfile = await userService.getUserProfile(u.id);
                const profileData = fullProfile?.user || fullProfile;
                if (profileData) {
                  setSelectedUser(prev => ({ ...prev, ...profileData }));
                }
              } catch (e) {
                // Silencioso: se muestran los datos basicos
              }
            }
          }}
          infinite={false}
          overlayLabels={{
            left: {
              title: 'LO SIENTO',
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
              title: 'PALOMITAS',
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

      {/* Botones de accion: rechazar (X), rewind y aceptar (carita) */}
      <View style={styles.actionButtonsRow}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => swiperRef.current && swiperRef.current.swipeLeft()}
          activeOpacity={0.7}
        >
          <FontAwesomeIcon icon={faXmark} size={28} color={colors.primary} />
        </TouchableOpacity>

        {/* Boton de Rewind (Undo) */}
        <TouchableOpacity
          style={styles.undoButton}
          onPress={handleUndoSwipe}
          activeOpacity={0.8}
          disabled={isUndoing || loading}
        >
          {isUndoing ? (
            <ActivityIndicator size="small" color={colors.textDark} />
          ) : (
            <FontAwesomeIcon icon={faReply} size={18} color={colors.textDark} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => swiperRef.current && swiperRef.current.swipeRight()}
          activeOpacity={0.7}
        >
          <FontAwesomeIcon icon={faFaceSmile} size={28} color={colors.textDark} />
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
                  <Text style={styles.modalSectionTitle}>Generos favoritos</Text>
                  <View style={styles.modalTagsRow}>
                    {selectedUser.favorite_genres
                      .filter(g => g != null)
                      .map((genre, index) => {
                        const name = typeof genre === 'object' && genre.name
                          ? genre.name
                          : (typeof genre === 'string' ? genre : 'Genero');
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

              {/* Peliculas vistas */}
              {(selectedUser?.watched_movies_list && selectedUser.watched_movies_list.length > 0) ? (
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Peliculas vistas</Text>
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

      {/* Tutorial onboarding (se muestra una sola vez al registrarse) */}
      <OnboardingTutorial
        visible={showTutorial}
        onFinish={() => setShowTutorial(false)}
        navigation={navigation}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  emptyContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 36,
    paddingVertical: 16,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reloadButtonText: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 35 : 45,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 45 : 45,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffd700',
    zIndex: 10,
  },
  premiumBadgeText: {
    color: '#ffd700',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  logoBox: {
    height: 120,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
  logoEmoji: {
    fontSize: 32,
  },
  logoImage: {
    width: '100%',
    height: '100%',
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  bottomSheetTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  moviesScrollContent: {
    padding: 16,
    paddingBottom: 40,
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
  logo: {
    fontSize: 25,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    fontWeight: '500',

  },
  swiperContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: -50,
    marginBottom: 0,
    paddingHorizontal: 10,
  },
  // Fila de botones de accion debajo de las tarjetas
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingBottom: Platform.OS === 'ios' ? 100 : 96,
    paddingTop: 4,
    zIndex: 20,
    elevation: 20,
  },
  // Boton rojo de rechazar (X)
  rejectButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.textDark,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  // Boton verde de aceptar (carita feliz)
  acceptButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  // Boton de deshacer swipe (rewind)
  undoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 35 : 35,
    right: 24,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  refreshButtonIcon: {
    fontSize: 26,
    color: colors.textDark,
    fontWeight: '900',
  },
  // Secciones dentro del bottom sheet modal (generos, directores)
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  modalTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalTag: {
    backgroundColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  modalTagText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '700',
  },
  // Grilla de directores con fotos en el modal
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
});

export default HomeScreen;
