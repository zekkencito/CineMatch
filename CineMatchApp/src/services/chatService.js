/**
 * 💬 Servicio de Chat
 * Maneja el envío y recepción de mensajes en tiempo real
 */

import api from '../config/api';

const chatService = {
  /**
   * Obtener todos los mensajes de un match
   */
  getMessages: async (matchId) => {
    try {
      const response = await api.get(`/matches/${matchId}/messages`);
      return response.data.messages || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  /**
   * Enviar un nuevo mensaje
   */
  sendMessage: async (matchId, receiverId, message) => {
    try {
      const response = await api.post('/messages', {
        match_id: matchId,
        receiver_id: receiverId,
        message: message.trim(),
      });
      return response.data.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Obtener contador de mensajes no leídos
   */
  getUnreadCount: async () => {
    try {
      const response = await api.get('/messages/unread-count');
      return response.data.unread_count || 0;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  },
};

export default chatService;
