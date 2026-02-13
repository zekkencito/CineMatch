import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

const MatchItem = ({ match, onPress }) => {
  // Extraer géneros en común
  const user = match.user || match;
  const genres = user.favorite_genres?.map(g => g.name).join(', ') || 'Movie fan';
  
  // Placeholder consistente basado en ID
  const getPlaceholderImage = () => {
    const placeholders = [
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=80',
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=80',
      'https://images.unsplash.com/photo-1485893086445-ed75865251e0?w=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80',
    ];
    return placeholders[user.id % placeholders.length];
  };
  
  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress && onPress(match)}>
      <Image 
        source={{ uri: user.profile_photo || getPlaceholderImage() }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.commonInterests}>
          🎬 {genres}
        </Text>
        <Text style={styles.bio} numberOfLines={1}>
          {user.bio || 'Movie enthusiast'}
        </Text>
      </View>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>💬</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  commonInterests: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 2,
    fontWeight: '500',
  },
  bio: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 20,
  },
});

export default MatchItem;
