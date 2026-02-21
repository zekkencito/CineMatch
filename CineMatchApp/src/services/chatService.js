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
      console.log('🔄 chatService.sendMessage:', { matchId, receiverId, messageLength: message.length });
      const payload = {
        match_id: matchId,
        receiver_id: receiverId,
        message: message.trim(),
      };
      console.log('📨 Payload:', payload);
      
      const response = await api.post('/messages', payload);
      console.log('📨 Response status:', response.status);
      console.log('📨 Response data:', response.data);
      
      return response.data.data;
    } catch (error) {
      console.error('💥 Error in sendMessage:', error.message);
      console.error('💥 Error response:', error.response?.data);
      console.error('💥 Error status:', error.response?.status);
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
