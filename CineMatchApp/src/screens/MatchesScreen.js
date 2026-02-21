import React, { useState, useEffect, useRef } from 'react';
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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { matchService } from '../services/matchService';
import MatchItem from '../components/MatchItem';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';
import { faMasksTheater } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTicket, faStar, faHeart } from '@fortawesome/free-solid-svg-icons';
import api from '../config/api';

const MatchesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const isPremium = user?.is_premium || user?.subscription?.is_premium;
  const [matches, setMatches] = useState([]);
  const [unreadPerMatch, setUnreadPerMatch] = useState({});
  const [likesReceived, setLikesReceived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Recargar matches cada vez que la pantalla sea visible
  useFocusEffect(
    React.useCallback(() => {
      loadMatches();
      loadLikesReceived();
      loadUnreadPerMatch();
    }, [])
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
    navigation.navigate('Chat', { match });
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
      colors={[colors.secondary, colors.secondaryLight]}
      style={styles.container}
    >
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
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 45,
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 4,
    fontWeight: '500',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
    marginBottom: 16,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  likesSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  likesSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  premiumBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  premiumBtnText: {
    color: '#fff',
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
});

export default MatchesScreen;
