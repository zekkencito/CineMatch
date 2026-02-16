import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';


// Configuración automática según la plataforma
const getApiUrl = () => {
  // IP local detectada automáticamente
  const YOUR_LOCAL_IP = '175.17.2.19'; // Tu IP de Wi-Fi
  
  if (Platform.OS === 'android') {
    // Android emulador - usando IP local porque 10.0.2.2 está bloqueado por firewall
    return __DEV__ 
      ? `http://${YOUR_LOCAL_IP}:8000/api`  // Emulador con IP local
      : `http://${YOUR_LOCAL_IP}:8000/api`; // Dispositivo físico
  } else if (Platform.OS === 'ios') {
    // iOS simulador puede usar localhost directamente
    return __DEV__
      ? 'http://localhost:8000/api'  // Simulador
      : `http://${YOUR_LOCAL_IP}:8000/api`; // Dispositivo físico
  } else {
    // Web
    return 'http://localhost:8000/api';
  }
};

const API_URL = getApiUrl();

console.log('🔗 API URL:', API_URL); // Para debug

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
    
    // Log para debugging
    console.error('❌ API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
