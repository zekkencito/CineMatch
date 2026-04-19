import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ChatScreen from '../screens/ChatScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import SettingsScreen from '../screens/SettingsScreen';
import HelpScreen from '../screens/HelpScreen';
import OnboardingTutorial from '../components/OnboardingTutorial';
import { tutorialService } from '../services/tutorialService';
import { ActivityIndicator, View } from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading, pendingSocialOnboarding } = useAuth();
  const { colors } = useTheme();
  const [showTutorial, setShowTutorial] = useState(false);
  const navigationRef = useRef(null);

  const navigationTheme = {
    dark: colors.background !== '#F7F7F7',
    colors: {
      primary: colors.primary,
      background: 'transparent',
      card: colors.surfaceElevated,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  // Verificar si el tutorial debe mostrarse (solo cuentas nuevas)
  const checkTutorial = async () => {
    // No mostrar tutorial si hay onboarding social pendiente
    if (pendingSocialOnboarding) return;
    const completed = await tutorialService.isCompleted();
    if (!completed) {
      setShowTutorial(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      checkTutorial();
    }
  }, [isAuthenticated]);

  // Cuando termina el onboarding social, revisar si hay tutorial pendiente
  useEffect(() => {
    if (isAuthenticated && !pendingSocialOnboarding) {
      checkTutorial();
    }
  }, [pendingSocialOnboarding]);

  // Navegar a Preferencias cuando hay onboarding social pendiente
  useEffect(() => {
    if (isAuthenticated && pendingSocialOnboarding) {
      const timer = setTimeout(() => {
        navigationRef.current?.navigate('Preferencias', { fromSocialLogin: true });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, pendingSocialOnboarding]);

  // Callback estable para navegar entre tabs
  const navigateToTab = useCallback((screenName) => {
    try {
      navigationRef.current?.navigate('MainTabs', { screen: screenName });
    } catch (e) {
      // Silencioso
    }
  }, []);

  // Callback estable para navegar a pantallas del Stack (ej: Preferencias)
  const navigateToScreen = useCallback((screenName, params = {}) => {
    try {
      if (screenName === 'goBack') {
        navigationRef.current?.goBack();
      } else {
        navigationRef.current?.navigate(screenName, params);
      }
    } catch (e) {
      // Silencioso
    }
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      {isAuthenticated ? (
        <>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={MainNavigator} />
          <Stack.Screen 
            name="Chat" 
            component={ChatScreen}
            options={{ headerShown: true, title: 'Chat' }}
          />
          <Stack.Screen 
            name="Preferencias" 
            component={PreferencesScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Editar Perfil" 
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Suscripción" 
            component={SubscriptionScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Ajustes"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Ayuda"
            component={HelpScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>

        {/* Tutorial onboarding - se renderiza sobre todo, incluyendo pantallas del Stack */}
        <OnboardingTutorial
          visible={showTutorial}
          onFinish={() => setShowTutorial(false)}
          navigateToTab={navigateToTab}
          navigateToScreen={navigateToScreen}
        />
        </>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
