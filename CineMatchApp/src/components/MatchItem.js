import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';

const MatchItem = ({ match, onPress, unreadCount = 0 }) => {
  // Extraer géneros en común
  const user = match.user || match;
  const genres = user.favorite_genres?.map(g => g.name).join(', ') || 'Fan de Películas';

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
    <TouchableOpacity style={[styles.container, unreadCount > 0 && styles.containerUnread]} onPress={() => onPress && onPress(match)}>
      <View style={styles.avatarWrap}>
        <Image
          source={{ uri: user.profile_photo || getPlaceholderImage() }}
          style={styles.avatar}
        />
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.name}>{user.name}</Text>
          {unreadCount > 0 && (
            <Text style={styles.newMsgLabel}>• Nuevo</Text>
          )}
        </View>
        <Text style={styles.commonInterests}>
          🎬 {genres}
        </Text>
        <Text style={styles.bio} numberOfLines={1}>
          {unreadCount > 0
            ? `${unreadCount} mensaje${unreadCount > 1 ? 's' : ''} sin leer`
            : (user.bio || 'Entusiasta de las películas')}
        </Text>
      </View>
      <View style={[styles.badge, unreadCount > 0 && styles.badgeUnread]}>
        <Text style={styles.badgeText}>{unreadCount > 0 ? '💬' : '💬'}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: colors.card,
    borderRadius: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
  },
  containerUnread: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(229, 9, 20, 0.06)',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.card,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  infoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.3,
  },
  newMsgLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  },
  commonInterests: {
    fontSize: 13,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '700',
  },
  bio: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  badgeUnread: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    elevation: 6,
  },
  badgeText: {
    fontSize: 22,
  },
});

export default MatchItem;
