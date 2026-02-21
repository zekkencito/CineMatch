/**
 * 💬 Pantalla de Chat Individual
 * Conversación con actualización manual (pull-to-refresh)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
import { db } from '../config/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import chatService from '../services/chatService';
import colors from '../constants/colors';

const ChatScreen = ({ route, navigation }) => {
  const { match } = route.params; // Recibe el objeto match completo
  const { user: currentUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const [otherIsTyping, setOtherIsTyping] = useState(false);
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const typingDotsAnim = useRef(new Animated.Value(0)).current;

  // Usuario con el que estamos chateando
  const otherUser = match.user || match;
  const matchId = match.match_id || match.id;
  const receiverId = otherUser.id;

  useEffect(() => {
    // Configurar título del header
    navigation.setOptions({
      title: otherUser.name,
      headerStyle: { backgroundColor: colors.secondary },
      headerTintColor: colors.primary,
      headerTitleStyle: { fontWeight: 'bold' },
    });

    loadMessages();

    const chatDocRef = doc(db, 'chats', String(matchId));
    const typingDocRef = doc(db, 'typing', String(matchId));

    // Escuchar mensajes nuevos (señal en chats/)
    const unsubscribeFirestore = onSnapshot(chatDocRef, (snapshot) => {
      if (snapshot.exists()) {
        loadMessages(false);
      }
    }, (error) => { console.warn('Firestore listener error:', error.message); });

    // Escuchar estado de 'escribiendo' del otro usuario
    const unsubscribeTyping = onSnapshot(typingDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        const isTyping = data?.[`user_${otherUser.id}`] === true;
        setOtherIsTyping(isTyping);
        if (isTyping) {
          Animated.loop(
            Animated.sequence([
              Animated.timing(typingDotsAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.timing(typingDotsAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
          ).start();
        }
      }
    }, (error) => { console.warn('Typing listener error:', error.message); });

    // Listener de notificaciones locales
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const { data } = notification.request.content;
      if (data && data.type === 'message' && data.match_id === matchId) {
        loadMessages(false);
      }
    });

    return () => {
      unsubscribeFirestore();
      unsubscribeTyping();
      notificationListener.remove();
      // Limpiar estado de escribiendo al salir
      const typingDocRef = doc(db, 'typing', String(matchId));
      updateDoc(typingDocRef, { [`user_${currentUser.id}`]: false }).catch(() => { });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  const loadMessages = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await chatService.getMessages(matchId, false);
      setMessages(data);

      // Scroll automático al último mensaje (solo en carga inicial)
      if (!isRefreshing) {
        setTimeout(() => {
          if (flatListRef.current && data.length > 0) {
            flatListRef.current.scrollToEnd({ animated: true });
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      if (!isRefreshing) {
        Alert.alert('Error', 'No se pudieron cargar los mensajes');
      }
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleTyping = (text) => {
    setNewMessage(text);

    // Notificar a Firestore que estoy escribiendo
    const typingDocRef = doc(db, 'typing', String(matchId));
    setDoc(typingDocRef, { [`user_${currentUser.id}`]: true }, { merge: true }).catch(() => { });

    // Auto-limpiar tras 3 segundos de inactividad
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(typingDocRef, { [`user_${currentUser.id}`]: false }).catch(() => { });
    }, 3000);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Limpiar input inmediatamente

    try {
      setSending(true);
      console.log('📤 Enviando mensaje:', { matchId, receiverId, messageText });

      const response = await chatService.sendMessage(matchId, receiverId, messageText);
      console.log('✅ Mensaje enviado exitosamente:', response);

      // 🔥 Escribir señal en Firestore para notificar al otro usuario en tiempo real
      try {
        const chatDocRef = doc(db, 'chats', String(matchId));
        await setDoc(chatDocRef, {
          lastMessageAt: serverTimestamp(),
          matchId: matchId,
        }, { merge: true });
      } catch (firestoreError) {
        // No bloqueamos si Firestore falla — los mensajes siguen funcionando
        console.warn('Firestore signal error (non-critical):', firestoreError.message);
      }

      // Recargar mensajes inmediatamente después de enviar
      await loadMessages(false);
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
      });
      Alert.alert('Error', 'No se pudo enviar el mensaje. Intenta de nuevo.');
      setNewMessage(messageText); // Restaurar el mensaje si falla
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMine = item.sender_id === currentUser.id;
    const timestamp = new Date(item.created_at).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={[
          styles.messageBubble,
          isMine ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={[styles.messageText, isMine && styles.myMessageText]}>
          {item.message}
        </Text>
        <Text style={[styles.timestamp, isMine && styles.myTimestamp]}>
          {timestamp}
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>💬</Text>
      <Text style={styles.emptyText}>Inicia la conversación</Text>
      <Text style={styles.emptySubtext}>
        Envía un mensaje a {otherUser.name}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.loadingContainer}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando chat...</Text>
      </LinearGradient>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior='padding'
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 80}
    >
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.flex}
      >
        {/* Lista de mensajes */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.messagesList}
          ListEmptyComponent={renderEmpty}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: true })
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadMessages(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
              title="Actualizando..."
              titleColor={colors.textSecondary}
            />
          }
        />

        {/* Indicador de 'escribiendo...' */}
        {otherIsTyping && (
          <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
              <Animated.Text style={[styles.typingDots, { opacity: typingDotsAnim }]}>
                ···
              </Animated.Text>
              <Text style={styles.typingText}>{otherUser.name} está escribiendo</Text>
            </View>
          </View>
        )}

        {/* Input de nuevo mensaje */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={handleTyping}
            multiline
            maxLength={1000}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!newMessage.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.textDark} />
            ) : (
              <Text style={styles.sendButtonText}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.textSecondary,
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  myMessageText: {
    color: colors.textDark,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textSecondary,
    alignSelf: 'flex-end',
  },
  myTimestamp: {
    color: colors.secondaryLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 24,
    color: colors.textDark,
    fontWeight: 'bold',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typingDots: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '900',
    lineHeight: 22,
  },
  typingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default ChatScreen;
