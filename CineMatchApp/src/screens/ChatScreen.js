import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const ChatScreen = ({ route, navigation }) => {
  const { user, matchId } = route.params;
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    // Datos de ejemplo
    {
      id: '1',
      text: '¡Hola! Vi que también te gusta Nolan 🎬',
      sender: 'other',
      timestamp: new Date('2026-02-11T10:30:00'),
    },
    {
      id: '2',
      text: '¡Sí! Inception es mi favorita',
      sender: 'me',
      timestamp: new Date('2026-02-11T10:31:00'),
    },
  ]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: user?.name || 'Chat',
    });
  }, [navigation, user]);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: 'me',
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Aquí integrarías con tu API o WebSocket
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender === 'me';
    
    return (
      <View
        style={[
          styles.messageContainer,
          isMe ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMe ? styles.myMessageBubble : styles.otherMessageBubble,
          ]}
        >
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        inverted={false}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor="#666"
          value={message}
          onChangeText={setMessage}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!message.trim()}
        >
          <Icon
            name="send"
            size={24}
            color={message.trim() ? '#fff' : '#666'}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  messagesContainer: {
    padding: 15,
  },
  messageContainer: {
    marginBottom: 15,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
  },
  myMessageBubble: {
    backgroundColor: '#E50914',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: '#1a1a1a',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
  },
  timestamp: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  input: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    color: '#fff',
    fontSize: 16,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E50914',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  sendButtonDisabled: {
    backgroundColor: '#333',
  },
});

export default ChatScreen;
