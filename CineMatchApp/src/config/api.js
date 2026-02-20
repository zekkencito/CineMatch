import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configuración automática según la plataforma
const getApiUrl = () => {
  // Always use the production URL for standalone builds
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://cinematch-production-7ba5.up.railway.app/api';
  console.log('📡 API Config: Usando URL:', envApiUrl);
  return envApiUrl;
};

const API_URL = getApiUrl();
console.log('🚀 API Base URL configurada:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 segundos de timeout
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
    }

    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
