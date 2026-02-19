import api from '../config/api';
import { storage } from '../utils/storage';

export const authService = {
  // Registro de usuario
  async register(userData) {
    try {
      const response = await api.post('/register', userData);
      if (response.data.token) {
        await storage.saveToken(response.data.token);
        await storage.saveUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Login
  async login(email, password) {
    try {
      const response = await api.post('/login', { email, password });
      
      if (response.data.token) {
        await storage.saveToken(response.data.token);
        await storage.saveUser(response.data.user);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Logout
  async logout() {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storage.clear();
    }
  },

  // Obtener usuario actual
  async getCurrentUser() {
    try {
      const response = await api.get('/me');
      await storage.saveUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Actualizar perfil
  async updateProfile(userData) {
    try {
      const response = await api.put('/profile', userData);
      await storage.saveUser(response.data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
