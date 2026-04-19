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
    padding: 15,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    marginBottom: 12,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.border,
  },
  containerUnread: {
    borderColor: colors.primary,
    borderWidth: 1,
    backgroundColor: 'rgba(245, 197, 24, 0.08)',
  },
  avatarWrap: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    borderWidth: 2,
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
    color: colors.textDark,
    fontSize: 10,
    fontWeight: '900',
  },
  infoContainer: {
    flex: 1,
    paddingRight: 8,
  },
  name: {
    fontSize: 19,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  commonInterests: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 5,
    fontWeight: '700',
  },
  bio: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  unreadPill: {
    backgroundColor: 'rgba(245,197,24,0.14)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 2,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  unreadPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  badge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 3,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeUnread: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    elevation: 6,
  },
  badgeText: {
    fontSize: 18,
  },
});

export default MatchItem;
