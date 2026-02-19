import { Linking } from 'react-native';
import api from '../config/api';

// Flujo basado en Web: crear orden en el servidor y abrir la URL de aprobación en el navegador.
export const paymentService = {
  async createPayPalOrder(duration = 30) {
    try {
      const resp = await api.post('/subscription/create-order', { duration });
      return resp.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  async openApprovalUrl(approveUrl) {
    if (!approveUrl) throw new Error('No approval URL provided');
    await Linking.openURL(approveUrl);
  }
};

export default paymentService;
