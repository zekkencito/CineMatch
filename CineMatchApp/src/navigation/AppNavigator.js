import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import ChatScreen from '../screens/ChatScreen';
import PreferencesScreen from '../screens/PreferencesScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import { ActivityIndicator, View } from 'react-native';
import colors from '../constants/colors';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? (
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
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
