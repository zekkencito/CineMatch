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
import colors from '../constants/colors';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMasksTheater } from '@fortawesome/free-solid-svg-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 20;
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [finished, setFinished] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const swiperRef = useRef(null);
  
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
  }, []);

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

  const loadUsers = async ({ reset = false } = {}) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
        setFinished(false);
      } else {
        setIsFetchingMore(true);
      }

      const p = reset ? 1 : page;
      const resp = await userService.getUsers({ page: p, per_page: perPage });
      const fetched = (resp.users || []).filter(u => u && u.id && u.name);

      if (reset) {
        setUsers(fetched);
        // Reset swiper to top
        if (swiperRef.current && fetched.length > 0) swiperRef.current.jumpToCardIndex(0);
      } else {
        setUsers(prev => [...prev, ...fetched]);
      }

      const meta = resp.meta || {};
      const totalLoaded = (reset ? 0 : users.length) + fetched.length;
      if (fetched.length < perPage || (meta.page && meta.per_page && meta.total && (meta.page * meta.per_page) >= meta.total)) {
        setFinished(true);
      }

      // Increment page for next fetch (only if we actually fetched something)
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
          <Text style={styles.loadingEmoji}>🎬</Text>
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
        <View style={styles.logoBox}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.logo}>CineMatch</Text>
        <Text style={styles.subtitle}>Desliza para encontrar a tus amigos cinéfilos</Text>
      </Animated.View>

      {/* Botón flotante de refresh */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => loadUsers({ reset: true })}
        activeOpacity={0.8}
        disabled={loading}
      >
        <Text style={styles.refreshButtonIcon }>↻</Text>
      </TouchableOpacity>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={users}
          renderCard={(user) => {
            if (!user || !user.id) {
              return null;
            }
            return <UserCard user={user} />;
          }}
          onSwiped={(cardIndex) => {
            const remaining = users.length - (cardIndex + 1);
            if (!finished && remaining < 3 && !isFetchingMore) {
              loadUsers({ reset: false });
            }
          }}
          onSwipedLeft={(cardIndex) => handleSwiped(cardIndex, 'left')}
          onSwipedRight={(cardIndex) => handleSwiped(cardIndex, 'right')}
          onSwipedAll={() => {
            if (!finished) {
              // try load more instead of showing empty state
              loadUsers({ reset: false });
            } else {
              handleSwipedAll();
            }
          }}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          stackScale={5}
          stackSeparation={14}
          animateCardOpacity
          verticalSwipe={false}
          disableBottomSwipe
          disableTopSwipe
          onTapCard={(cardIndex) => {
            const u = users && users[cardIndex];
            if (u) {
              setSelectedUser(u);
              setModalVisible(true);
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
  loadingEmoji: {
    fontSize: 65,
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
  },
  logoBox: {
    width: 55,
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 3,
    borderColor: 'rgba(245, 197, 24, 0.3)',
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
    marginTop: -20,
    marginBottom: 20,
    paddingHorizontal: 10,
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
});

export default HomeScreen;
