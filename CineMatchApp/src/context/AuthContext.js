import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';
import { notificationService } from '../services/notificationService';
import { tutorialService } from '../services/tutorialService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingSocialOnboarding, setPendingSocialOnboarding] = useState(false);
  const [pendingPreferencesOnboarding, setPendingPreferencesOnboarding] = useState(false);

  const clearPendingSocialOnboarding = () => setPendingSocialOnboarding(false);
  const clearPendingPreferencesOnboarding = () => setPendingPreferencesOnboarding(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        // Cargar user localmente primero para no bloquear la interfaz
        const userData = await storage.getUser();
        
        if (userData) {
          // Agregar el token al objeto user para que esté disponible en el contexto
          userData.token = token;
          setUser(userData);
          setIsAuthenticated(true);
        }

        // Registrar para notificaciones push
        notificationService.registerForPushNotificationsAsync();

        // Actualizar silenciosamente el usuario desde el servidor en segundo plano
        try {
          refetchUser().catch(err => console.log('Silent user refetch failed on startup:', err));
        } catch (e) {
          // Silencioso
        }
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      // Modo de prueba para desarrollo
      if (email === 'demo@cinematch.com' && password === 'demo123') {
        const mockUser = {
          id: 1,
          name: 'Demo User',
          email: 'demo@cinematch.com',
          age: 25,
          bio: 'Movie lover and cinephile 🎬',
          profile_photo: 'https://i.pravatar.cc/300?img=12',
          token: 'mock-token-123',
        };
        await storage.saveToken('mock-token-123');
        await storage.saveUser(mockUser);
        setUser(mockUser);
        setIsAuthenticated(true);
        return { user: mockUser, token: 'mock-token-123' };
      }

      // Login real con API
      const data = await authService.login(email, password);
      // Agregar token al objeto user
      data.user.token = data.token;
      setUser(data.user);
      setIsAuthenticated(true);

      // Marcar tutorial como completado para usuarios existentes
      try {
        await tutorialService.markCompleted();
      } catch (tutErr) {
        console.log('Error marking tutorial completed:', tutErr);
      }
      setPendingPreferencesOnboarding(false);

      // Actualizar información (como premium flag) que a lo mejor no envía el endpoint login
      try {
        await refetchUser();
      } catch (e) {
        console.log('Error silente al refetch después de login', e);
      }

      // Registrar para notificaciones push
      notificationService.registerForPushNotificationsAsync();

      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      // Agregar token al objeto user
      data.user.token = data.token;
      setUser(data.user);
      setIsAuthenticated(true);

      // Resetear el tutorial para que se muestre al nuevo usuario
      await tutorialService.reset();

      // Marcar onboarding de preferencias pendiente para nuevos usuarios
      setPendingPreferencesOnboarding(true);

      // Registrar para notificaciones push
      notificationService.registerForPushNotificationsAsync();

      return data;
    } catch (error) {
      throw error;
    }
  };

  const loginWithGoogle = async ({ idToken, name, email, photo }) => {
    try {
      const data = await authService.socialLogin({
        idToken,
        provider: 'google',
        name,
        email,
        photo,
      });

      // Agregar token al objeto user
      data.user.token = data.token;
      setUser(data.user);
      setIsAuthenticated(true);

      // Si es usuario nuevo, resetear tutorial y marcar onboarding pendiente
      if (data.is_new_user) {
        await tutorialService.reset();
        setPendingSocialOnboarding(true);
      } else {
        // Usuario existente: marcar tutorial como completado y limpiar estados pendientes
        try {
          await tutorialService.markCompleted();
        } catch (tutErr) {
          console.log('Error marking tutorial completed:', tutErr);
        }
        setPendingSocialOnboarding(false);
        setPendingPreferencesOnboarding(false);
      }

      // Actualizar info completa
      try {
        await refetchUser();
      } catch (e) {
        console.log('Error silente al refetch después de social login', e);
      }

      // Registrar para notificaciones push
      notificationService.registerForPushNotificationsAsync();

      return data;
    } catch (error) {
      throw error;
    }
  };

  const loginWithFacebook = async ({ accessToken }) => {
    try {
      const data = await authService.socialLogin({
        idToken: accessToken,
        provider: 'facebook',
      });

      // Agregar token al objeto user
      data.user.token = data.token;
      setUser(data.user);
      setIsAuthenticated(true);

      if (data.is_new_user) {
        await tutorialService.reset();
        setPendingSocialOnboarding(true);
      } else {
        // Usuario existente: marcar tutorial como completado y limpiar estados pendientes
        try {
          await tutorialService.markCompleted();
        } catch (tutErr) {
          console.log('Error marking tutorial completed:', tutErr);
        }
        setPendingSocialOnboarding(false);
        setPendingPreferencesOnboarding(false);
      }

      try {
        await refetchUser();
      } catch (e) {
        console.log('Error silente al refetch después de Facebook login', e);
      }

      notificationService.registerForPushNotificationsAsync();

      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const updateUser = async (userData) => {
    try {
      const updatedUser = await authService.updateProfile(userData);
      // Merge returned fields with current user to avoid overwriting complete user with partial response
      // Mantener el token existente
      const merged = { ...(user || {}), ...(updatedUser || {}), token: user?.token };
      setUser(merged);
      // Persist merged user to storage (authService.updateProfile may have saved partial data)
      await storage.saveUser(merged);
      return merged;
    } catch (error) {
      throw error;
    }
  };

  const refetchUser = async () => {
    try {
      const responseData = await authService.getCurrentUser();
      // Extraemos el objeto user de la respuesta { success: true, user: {...} }
      const newUserData = responseData.user ? responseData.user : responseData;

      // Mantener el token existente (o cargarlo de storage si no está en el state todavía)
      const token = user?.token || await storage.getToken();
      const merged = { ...(user || {}), ...(newUserData || {}), token };
      setUser(merged);
      await storage.saveUser(merged);
      return merged;
    } catch (error) {
      console.error('Error refetching user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        isAuthenticated,
        setIsAuthenticated,
        pendingSocialOnboarding,
        clearPendingSocialOnboarding,
        pendingPreferencesOnboarding,
        clearPendingPreferencesOnboarding,
        login,
        loginWithGoogle,
        loginWithFacebook,
        register,
        logout,
        updateUser,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
