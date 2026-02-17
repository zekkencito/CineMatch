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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { matchService } from '../services/matchService';
import MatchItem from '../components/MatchItem';
import colors from '../constants/colors';

const MatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Recargar matches cada vez que la pantalla sea visible
  useFocusEffect(
    React.useCallback(() => {
      loadMatches();
    }, [])
  );

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await matchService.getMatches();
      // Filtrar matches válidos y extraer información del usuario
      const validMatches = (data || []).filter(m => m && m.user && m.user.id);
      console.log(`Loaded ${validMatches.length} matches`);
      setMatches(validMatches);
      
      // Animar cuando se cargan los datos
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
    } catch (error) {
      console.error('Error al cargar los  matches:', error);
      Alert.alert('Error', '  Error al cargar los matches. Por favor, verifica tu conexión e inténtalo de nuevo.');
      setMatches([]);
    } finally {
      setLoading(false);
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
          <Text style={styles.loadingEmoji}>🎬</Text>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading your movie buddies...</Text>
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
            <Text style={styles.iconEmoji}>🍿</Text>
          </View>
          <Text style={styles.title}>Amigos de Butaca</Text>
        </View>
        <Text style={styles.subtitle}>
          {matches.length === 0 
            ? 'Aún no tienes amigos de butaca'
            : `${matches.length} ${matches.length === 1 ? 'amigo de butaca' : 'amigos de butaca'} que comparten tu gusto`
          }
        </Text>
      </Animated.View>

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
          <Text style={styles.emptyEmoji}>🎭</Text>
          <Text style={styles.emptyText}>Aún no tienes amigos de butaca</Text>
          <Text style={styles.emptySubtext}>
            Comienza a hacer swipes para encontrar personas que compartan tu gusto en películas.
          </Text>
        </Animated.View>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MatchItem match={item} onPress={handleMatchPress} />
          )}
          contentContainerStyle={styles.listContainer}
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
  loadingEmoji: {
    fontSize: 64,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 48,
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  iconEmoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginLeft: 4,
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
});

export default MatchesScreen;
