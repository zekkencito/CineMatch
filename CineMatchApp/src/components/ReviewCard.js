import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  FlatList,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faThumbsUp, faThumbsDown, faReply, faTrash, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { movieForumService } from '../services/movieForumService';
import CustomAlert from './CustomAlert';
import useCustomAlert from '../hooks/useCustomAlert';

const ReviewCard = ({
  review,
  onReactionChange,
  onReplyPress,
  onDeleteSuccess,
  isReply = false,
  level = 0,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { alertConfig, showSuccess, showError, showWarning, showInfo, showConfirm, hideAlert } = useCustomAlert();
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const [likeCount, setLikeCount] = useState(review.reactions?.like_count || 0);
  const [dislikeCount, setDislikeCount] = useState(review.reactions?.dislike_count || 0);
  const [userReaction, setUserReaction] = useState(review.reactions?.user_reaction);
  const [reacting, setReacting] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [expandReplies, setExpandReplies] = useState(false);
  
  const likeScale = useRef(new Animated.Value(1)).current;
  const dislikeScale = useRef(new Animated.Value(1)).current;

  const isOwnReview = user?.id === review.user_id;
  
  console.log('🔍 Review ID:', review.id, 'User ID:', user?.id, 'Review user_id:', review.user_id, 'isOwnReview:', isOwnReview);

  const animateReaction = (scaleRef) => {
    Animated.sequence([
      Animated.timing(scaleRef, {
        toValue: 1.1,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(scaleRef, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleReaction = async (reactionType) => {
    try {
      setReacting(reactionType);
      const oldUserReaction = userReaction;
      const oldLikeCount = likeCount;
      const oldDislikeCount = dislikeCount;

      // Optimistic update
      if (oldUserReaction === reactionType) {
        setUserReaction(null);
        if (reactionType === 'like') {
          setLikeCount(Math.max(0, oldLikeCount - 1));
        } else {
          setDislikeCount(Math.max(0, oldDislikeCount - 1));
        }
      } else {
        if (oldUserReaction === 'like' && reactionType === 'dislike') {
          setLikeCount(Math.max(0, oldLikeCount - 1));
          setDislikeCount(oldDislikeCount + 1);
        } else if (oldUserReaction === 'dislike' && reactionType === 'like') {
          setDislikeCount(Math.max(0, oldDislikeCount - 1));
          setLikeCount(oldLikeCount + 1);
        } else {
          if (reactionType === 'like') {
            setLikeCount(oldLikeCount + 1);
          } else {
            setDislikeCount(oldDislikeCount + 1);
          }
        }
        setUserReaction(reactionType);
      }

      animateReaction(reactionType === 'like' ? likeScale : dislikeScale);
      await movieForumService.reactToReview(review.id, reactionType);
      onReactionChange?.();
    } catch (error) {
      showError('Error', 'No se pudo guardar tu reacción');
    } finally {
      setReacting(null);
    }
  };

  const handleDelete = async () => {
    console.log('🗑️ handleDelete llamado para review ID:', review.id);

    const confirmed = await showConfirm(
      'Eliminar reseña',
      '¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.',
      'Eliminar',
      'Cancelar'
    );

    if (!confirmed) {
      console.log('❌ Usuario canceló eliminación');
      return;
    }

    console.log('✅ Usuario confirmó eliminación, procediendo...');
    try {
      setDeleting(true);
      await movieForumService.deleteReview(review.id);
      console.log('🔄 Llamando a onDeleteSuccess...');
      onDeleteSuccess?.();
      showSuccess('Éxito', 'Reseña eliminada correctamente');
      console.log('✅ Eliminación completada');
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      showError('Error', 'No se pudo eliminar la reseña');
    } finally {
      setDeleting(false);
    }
  };

  const replyCount = review.reply_count || (review.replies?.length || 0);
  const marginLeft = level * 12;

  return (
    <View style={[styles.reviewContainer, { marginLeft }]}>
      {/* Header: Usuario y fecha */}
      <View style={styles.reviewHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{review.user?.name || 'Usuario'}</Text>
          <Text style={styles.reviewDate}>
            {new Date(review.created_at).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              year: '2-digit'
            })}
          </Text>
        </View>
        {isOwnReview && (
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleting}
            style={styles.deleteButton}
          >
            <FontAwesomeIcon icon={faTrash} size={12} color={colors.accent} opacity={deleting ? 0.5 : 1} />
          </TouchableOpacity>
        )}
      </View>

      {/* Texto de la reseña */}
      <Text style={styles.reviewText}>{review.review}</Text>

      {/* Reacciones */}
      <View style={styles.reactionsContainer}>
        <Animated.View style={[{ transform: [{ scale: likeScale }] }]}>
          <TouchableOpacity
            style={[
              styles.reactionButton,
              userReaction === 'like' && styles.reactionButtonActive,
            ]}
            onPress={() => handleReaction('like')}
            disabled={reacting !== null}
          >
            <FontAwesomeIcon
              icon={faThumbsUp}
              size={12}
              color={userReaction === 'like' ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.reactionCount,
              userReaction === 'like' && { color: colors.primary, fontWeight: '700' }
            ]}>
              {likeCount}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={[{ transform: [{ scale: dislikeScale }] }]}>
          <TouchableOpacity
            style={[
              styles.reactionButton,
              userReaction === 'dislike' && styles.reactionButtonActive,
            ]}
            onPress={() => handleReaction('dislike')}
            disabled={reacting !== null}
          >
            <FontAwesomeIcon
              icon={faThumbsDown}
              size={12}
              color={userReaction === 'dislike' ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.reactionCount,
              userReaction === 'dislike' && { color: colors.primary, fontWeight: '700' }
            ]}>
              {dislikeCount}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {!isReply && replyCount > 0 && (
          <TouchableOpacity
            style={styles.replyCountButton}
            onPress={() => setExpandReplies(!expandReplies)}
          >
            <FontAwesomeIcon 
              icon={expandReplies ? faChevronUp : faChevronDown} 
              size={10} 
              color={colors.primary} 
            />
            <Text style={styles.replyCountText}>
              {replyCount}
            </Text>
          </TouchableOpacity>
        )}

        {!isReply && (
          <TouchableOpacity
            style={styles.replyButton}
            onPress={() => onReplyPress?.(review)}
          >
            <FontAwesomeIcon icon={faReply} size={11} color={colors.primary} />
            <Text style={styles.replyButtonText}>Responder</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mostrar respuestas si están expandidas */}
      {!isReply && expandReplies && review.replies && review.replies.length > 0 && (
        <View style={styles.repliesContainer}>
          {review.replies.map((reply) => (
            <ReviewCard
              key={`reply-${reply.id}`}
              review={reply}
              onReactionChange={onReactionChange}
              onDeleteSuccess={onDeleteSuccess}
              isReply={true}
              level={level + 1}
            />
          ))}
        </View>
      )}

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
};

const createStyles = (colors) => StyleSheet.create({
  reviewContainer: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.08)',
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.text,
  },
  reviewDate: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 3,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 7,
    marginLeft: 10,
  },
  reviewText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
    marginBottom: 10,
    fontWeight: '400',
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flexWrap: 'wrap',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,215,0,0.08)',
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.15)',
  },
  reactionButtonActive: {
    backgroundColor: 'rgba(255,215,0,0.25)',
    borderColor: colors.primary,
  },
  reactionCount: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '800',
  },
  replyCountButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  replyCountText: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '800',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  replyButtonText: {
    fontSize: 10,
    color: colors.textDark,
    fontWeight: '800',
  },
  repliesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,215,0,0.1)',
    opacity: 0.95,
  },
});

export default ReviewCard;
