import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configuración automática según la plataforma
const getApiUrl = () => {
  // 1. Si hay EXPO_PUBLIC_API_URL en .env, úsala (prioridad máxima)
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envApiUrl) {
    return envApiUrl;
  }

  // 2. Auto-detectar IP del Metro bundler (Expo)
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0]; // Extraer solo la IP
    const autoUrl = `http://${ip}:8000/api`;
    return autoUrl;
  }

  // 3. Fallback a configuración manual (cambiar solo si falla auto-detección)
  const FALLBACK_IP = '192.168.100.12'; // Tu última IP conocida
  const fallbackUrl = `http://${FALLBACK_IP}:8000/api`;
  return fallbackUrl;
};

const API_URL = getApiUrl();

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
