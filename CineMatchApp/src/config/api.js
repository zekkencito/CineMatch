import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Cambia esta URL por tu API Laravel
const API_BASE_URL = 'http://10.0.2.2:8000/api'; // Para emulador Android
// const API_BASE_URL = 'http://localhost:8000/api'; // Para iOS simulator
// const API_BASE_URL = 'https://tu-servidor.com/api'; // Para producción

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para agregar el token en cada petición
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('authToken');
      // Aquí podrías redirigir al login
    }
    return Promise.reject(error);
  }
);

export default api;
