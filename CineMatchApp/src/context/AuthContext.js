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

  const clearPendingSocialOnboarding = () => setPendingSocialOnboarding(false);

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
          setUser(userData);
          setIsAuthenticated(true);
        }

        // Pero pedirle al backend el usuario más actualizado para reflejar Premium silenciosamente
        try {
          await refetchUser();
        } catch (e) {
          console.log('Fallo al refetch user silencioso', e);
        }

        // Registrar para notificaciones push
        notificationService.registerForPushNotificationsAsync();
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
        };
        await storage.saveToken('mock-token-123');
        await storage.saveUser(mockUser);
        setUser(mockUser);
        setIsAuthenticated(true);
        return { user: mockUser, token: 'mock-token-123' };
      }

      // Login real con API
      const data = await authService.login(email, password);
      setUser(data.user);
      setIsAuthenticated(true);

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
      setUser(data.user);
      setIsAuthenticated(true);

      // Resetear el tutorial para que se muestre al nuevo usuario
      await tutorialService.reset();

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

      setUser(data.user);
      setIsAuthenticated(true);

      // Si es usuario nuevo, resetear tutorial y marcar onboarding pendiente
      if (data.is_new_user) {
        await tutorialService.reset();
        setPendingSocialOnboarding(true);
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

      setUser(data.user);
      setIsAuthenticated(true);

      if (data.is_new_user) {
        await tutorialService.reset();
        setPendingSocialOnboarding(true);
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
      const merged = { ...(user || {}), ...(updatedUser || {}) };
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

      const merged = { ...(user || {}), ...(newUserData || {}) };
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
        pendingSocialOnboarding,
        clearPendingSocialOnboarding,
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
