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
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { userService } from '../services/userService';
import { matchService } from '../services/matchService';
import { mockUsers } from '../utils/mockData';
import UserCard from '../components/UserCard';
import colors from '../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // Intentar cargar desde API
      try {
        const data = await userService.getUsers();
        // Filtrar cualquier usuario invalido o undefined
        const validUsers = (data || []).filter(user => user && user.id && user.name);
        console.log(`Loaded ${validUsers.length} valid users`);
        setUsers(validUsers);
      } catch (apiError) {
        // Si falla la API, usar datos mock
        console.log('Using mock data for users');
        setUsers(mockUsers);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSwiped = async (cardIndex, direction) => {
    const swipedUser = users[cardIndex];
    
    // Validar que el usuario exista
    if (!swipedUser || !swipedUser.id) {
      console.warn('Invalid user at index:', cardIndex);
      return;
    }
    
    const type = direction === 'right' ? 'like' : 'dislike';
    
    try {
      // Intentar enviar like a la API
      try {
        const result = await matchService.sendLike(swipedUser.id, type);
        if (result.matched) {
          Alert.alert(
            "🎬 Movie Buddy Found!",
            `You and ${swipedUser.name} share similar movie tastes! Start chatting about films.`,
            [
              { text: 'Keep Looking', style: 'cancel' },
              { text: 'Chat Now', onPress: () => navigation.navigate('Matches') },
            ]
          );
        }
      } catch (apiError) {
        console.log('API error during swipe:', apiError);
        // Modo demo: simular match aleatorio
        if (direction === 'right' && Math.random() > 0.7) {
          Alert.alert(
            "🎬 Movie Buddy Found!",
            `You and ${swipedUser.name} share similar movie tastes! Start chatting about films.`,
            [
              { text: 'Keep Looking', style: 'cancel' },
              { text: 'Chat Now', onPress: () => navigation.navigate('Matches') },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const handleSwipedAll = () => {
    console.log('All cards swiped');
    Alert.alert(
      "🎬 You've seen everyone!",
      "You've checked out all available film fans nearby. We'll refresh the list for you.",
      [
        { 
          text: 'OK', 
          onPress: () => {
            // Recargar usuarios
            loadUsers();
          }
        }
      ]
    );
  };

  const handleLike = () => {
    if (swiperRef.current) {
      swiperRef.current.swipeRight();
    }
  };

  const handleDislike = () => {
    if (swiperRef.current) {
      swiperRef.current.swipeLeft();
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (users.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>🎬 No more film fans nearby</Text>
        <Text style={styles.emptySubtext}>Check back later for more people!</Text>
        <TouchableOpacity style={styles.reloadButton} onPress={loadUsers}>
          <Text style={styles.reloadButtonText}>Reload</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>🎬 CineMatch</Text>
        <Text style={styles.subtitle}>Find people who share your film taste</Text>
      </View>

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
          backgroundColor={colors.background}
          stackSize={2}
          stackScale={10}
          stackSeparation={15}
          animateCardOpacity
          verticalSwipe={false}
          infinite={false}
          overlayLabels={{
            left: {
              title: 'NO',
              style: {
                label: {
                  backgroundColor: colors.error,
                  borderColor: colors.error,
                  color: colors.text,
                  borderWidth: 1,
                  fontSize: 24,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'Sí',
              style: {
                label: {
                  backgroundColor: colors.success,
                  borderColor: colors.success,
                  color: colors.text,
                  borderWidth: 1,
                  fontSize: 24,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.dislikeButton} onPress={handleDislike}>
          <Text style={styles.buttonIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Text style={styles.buttonIcon}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    padding: 20,
    paddingTop: 50,
    alignItems: 'center',
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  swiperContainer: {
    flex: 1,
    marginTop: -50,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 40,
    paddingTop: 20,
  },
  dislikeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonIcon: {
    fontSize: 30,
    color: colors.text,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    textAlign: 'center',
  },
  reloadButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  reloadButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
