import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';
import { storage } from '../utils/storage';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        const userData = await storage.getUser();
        setUser(userData);
        setIsAuthenticated(true);
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
        loading,
        isAuthenticated,
        login,
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
