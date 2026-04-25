import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const FRAME_STYLES = {
  classic_gold: { borderColor: '#F5C518' },
  noir_silver: { borderColor: '#A7A7A7' },
  neon_pop: { borderColor: '#31E9FF' },
  epic_scarlet: { borderColor: '#FF5A5A' },
  director_cut: { borderColor: '#B09A5E' },
};

const MatchItem = ({ match, onPress, onAvatarPress, unreadCount = 0 }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // Extraer géneros en común
  const user = match.user || match;
  const genres = user.favorite_genres?.map(g => g.name).join(', ') || 'Fan de Películas';
  const frameId = user.equipped_frame || user.equippedFrame || null;
  const frameStyle = frameId ? FRAME_STYLES[frameId] : null;

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
      <TouchableOpacity
        style={styles.avatarWrap}
        activeOpacity={0.7}
        onPress={(e) => {
          e.stopPropagation && e.stopPropagation();
          onAvatarPress && onAvatarPress(match);
        }}
      >
        <Image
          source={{ uri: user.profile_photo || getPlaceholderImage() }}
          style={[styles.avatar, frameStyle]}
        />
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.commonInterests}>
          🎬 {genres}
        </Text>
        {unreadCount > 0 ? (
          <View style={styles.unreadPill}>
            <Text style={styles.unreadPillText}>
              💬 {unreadCount} mensaje{unreadCount > 1 ? 's' : ''} nuevo{unreadCount > 1 ? 's' : ''} de {user.name.split(' ')[0]}
            </Text>
          </View>
        ) : (
          <Text style={styles.bio} numberOfLines={1}>
            {user.bio || 'Entusiasta de las películas'}
          </Text>
        )}
      </View>
      <View style={[styles.badge, unreadCount > 0 && styles.badgeUnread]}>
        <Text style={styles.badgeText}>💬</Text>
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (colors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 20,
    marginBottom: 13,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.08)',
  },
  containerUnread: {
    borderColor: colors.primary,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255,215,0,0.1)',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
    borderWidth: 2,
    borderColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  unreadBadgeText: {
    color: colors.textDark,
    fontSize: 11,
    fontWeight: '900',
  },
  infoContainer: {
    flex: 1,
    paddingRight: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  commonInterests: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 6,
    fontWeight: '800',
  },
  bio: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 18,
  },
  unreadPill: {
    backgroundColor: 'rgba(255,215,0,0.15)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  unreadPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.1)',
  },
  badgeUnread: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.5,
    elevation: 7,
    borderColor: colors.primary,
  },
  badgeText: {
    fontSize: 20,
  },
});

export default MatchItem;
