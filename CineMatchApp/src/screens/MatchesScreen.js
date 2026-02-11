import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { matchService } from '../services/matchService';

const MatchesScreen = ({ navigation }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    setLoading(true);
    try {
      const data = await matchService.getMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error al cargar matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMatch = ({ item }) => (
    <TouchableOpacity
      style={styles.matchCard}
      onPress={() => navigation.navigate('Chat', { matchId: item.id, user: item })}
    >
      <Image
        source={{ uri: item.profile_photo_url || 'https://via.placeholder.com/100' }}
        style={styles.avatar}
      />
      <View style={styles.matchInfo}>
        <Text style={styles.matchName}>{item.name}</Text>
        <View style={styles.compatibilityRow}>
          <Icon name="heart" size={14} color="#E50914" />
          <Text style={styles.compatibility}>
            {item.compatibility_score}% compatible
          </Text>
        </View>
        {item.common_genres && item.common_genres.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.common_genres.slice(0, 2).map((genre, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{genre.name}</Text>
              </View>
            ))}
            {item.common_genres.length > 2 && (
              <Text style={styles.moreText}>
                +{item.common_genres.length - 2}
              </Text>
            )}
          </View>
        )}
      </View>
      <Icon name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Tus Matches</Text>
        <Text style={styles.subtitle}>{matches.length} personas comparten tus gustos</Text>
      </View>

      {matches.length > 0 ? (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="people-outline" size={80} color="#666" />
          <Text style={styles.emptyText}>Aún no tienes matches</Text>
          <Text style={styles.emptySubtext}>
            Sigue descubriendo películas y personas para encontrar tu match perfecto
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
  },
  listContainer: {
    padding: 20,
  },
  matchCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  compatibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  compatibility: {
    fontSize: 14,
    color: '#999',
    marginLeft: 5,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tag: {
    backgroundColor: 'rgba(229, 9, 20, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 5,
  },
  tagText: {
    color: '#E50914',
    fontSize: 11,
    fontWeight: '600',
  },
  moreText: {
    color: '#666',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});

export default MatchesScreen;
