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
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Notifications from 'expo-notifications';
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
  const flatListRef = useRef(null);

  // Usuario con el que estamos chateando
  const otherUser = match.user || match;
  const matchId = match.match_id || match.id;
  const receiverId = otherUser.id;

  useEffect(() => {
    // Configurar título del header
    navigation.setOptions({
      title: otherUser.name,
      headerStyle: {
        backgroundColor: colors.secondary,
      },
      headerTintColor: colors.primary,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });

    // Cargar mensajes iniciales
    loadMessages();

    // Listener para recibir notificaciones en primer plano y refrescar mensajes automáticamente
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      const { data } = notification.request.content;
      // Si la notificación es de un mensaje y pertenece a este match, recargar
      if (data && data.type === 'message' && data.match_id === matchId) {
        loadMessages(false);
      }
    });

    return () => {
      notificationListener.remove();
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

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage(''); // Limpiar input inmediatamente

    try {
      setSending(true);
      console.log('📤 Enviando mensaje:', { matchId, receiverId, messageText });

      const response = await chatService.sendMessage(matchId, receiverId, messageText);
      console.log('✅ Mensaje enviado exitosamente:', response);

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

        {/* Input de nuevo mensaje */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
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
});

export default ChatScreen;
