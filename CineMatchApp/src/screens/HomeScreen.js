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
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { LinearGradient } from 'expo-linear-gradient';
import { userService } from '../services/userService';
import { matchService } from '../services/matchService';
import UserCard from '../components/UserCard';
import colors from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  
  // Animaciones para los botones
  const likeScale = useRef(new Animated.Value(1)).current;
  const dislikeScale = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUsers();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      // Filtrar cualquier usuario invalido o undefined
      const validUsers = (data || []).filter(user => user && user.id && user.name);
      console.log(`Loaded ${validUsers.length} valid users`);
      setUsers(validUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Problema al cargar Amigos Palomeros. Por favor, revisa tu conexión e inténtalo de nuevo.');
      setUsers([]);
    } finally {
      setLoading(false);
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
    console.log('Todos los Amigos Palomeros han sido vistos');
    Alert.alert(
      "🎬 Viste a todos",
      "Ya viste a todos los Amigos Palomeros disponibles. Actualizaremos la lista por ti.",
      [
        { 
          text: 'OK', 
          onPress: () => {
            loadUsers();
          }
        }
      ]
    );
  };

  const animateButton = (buttonAnim) => {
    Animated.sequence([
      Animated.timing(buttonAnim, {
        toValue: 0.85,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonAnim, {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleLike = () => {
    animateButton(likeScale);
    if (swiperRef.current) {
      swiperRef.current.swipeRight();
    }
  };

  const handleDislike = () => {
    animateButton(dislikeScale);
    if (swiperRef.current) {
      swiperRef.current.swipeLeft();
    }
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
          <Text style={styles.loadingText}>Encontrando Amigos de Butaca...</Text>
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
          <Text style={styles.emptyEmoji}>🎭</Text>
          <Text style={styles.emptyText}>No hay más Amigos Palomeros cerca</Text>
          <Text style={styles.emptySubtext}>Vuelve a revisar más tarde para encontrar más amantes del cine!</Text>
          <TouchableOpacity 
            style={styles.reloadButton} 
            onPress={loadUsers}
            activeOpacity={0.8}
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
          onSwiped={(cardIndex) => {}}
          onSwipedLeft={(cardIndex) => handleSwiped(cardIndex, 'left')}
          onSwipedRight={(cardIndex) => handleSwiped(cardIndex, 'right')}
          onSwipedAll={handleSwipedAll}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          stackScale={5}
          stackSeparation={14}
          animateCardOpacity
          verticalSwipe={false}
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

      <View style={styles.buttonsContainer}>
        <Animated.View style={{ transform: [{ scale: dislikeScale }] }}>
          <TouchableOpacity 
            style={styles.dislikeButton} 
            onPress={handleDislike}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonIcon}>✕</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={handleLike}
            activeOpacity={0.9}
          >
            <Text style={styles.buttonIcon}>★</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
    fontSize: 64,
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
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  reloadButtonText: {
    color: colors.textDark,
    fontSize: 17,
    fontWeight: '800',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    alignItems: 'center',
    gap: 8,
  },
  logoBox: {
    width: 56,
    height: 56,
    backgroundColor: colors.primary,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logoEmoji: {
    fontSize: 32,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logo: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  swiperContainer: {
    flex: 1,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
    paddingBottom: 40,
    paddingTop: 20,
  },
  dislikeButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.textDark,
  },
  likeButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: colors.textDark,
  },
  buttonIcon: {
    fontSize: 34,
    color: colors.textDark,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
