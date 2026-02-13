import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { matchService } from '../services/matchService';
import { mockMatches } from '../utils/mockData';
import MatchItem from '../components/MatchItem';
import colors from '../constants/colors';

const MatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Recargar matches cada vez que la pantalla sea visible
  useFocusEffect(
    React.useCallback(() => {
      loadMatches();
    }, [])
  );

  const loadMatches = async () => {
    try {
      setLoading(true);
      // Intentar cargar desde API
      try {
        const data = await matchService.getMatches();
        // Filtrar matches válidos y extraer información del usuario
        const validMatches = (data || []).filter(m => m && m.user && m.user.id);
        console.log(`Loaded ${validMatches.length} matches`);
        setMatches(validMatches);
      } catch (apiError) {
        console.log('API error loading matches:', apiError);
        // Si falla la API, usar datos mock
        console.log('Using mock data for matches');
        setMatches(mockMatches);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchPress = (match) => {
    navigation.navigate('Chat', { matchId: match.id, matchName: match.name });
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎬 Movie Buddies</Text>
        <Text style={styles.subtitle}>
          {matches.length} {matches.length === 1 ? 'person' : 'people'} with similar movie tastes
        </Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>🎥 No movie buddies yet</Text>
          <Text style={styles.emptySubtext}>
            Keep swiping to find people who share your film taste!
          </Text>
        </View>
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
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  listContainer: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default MatchesScreen;
