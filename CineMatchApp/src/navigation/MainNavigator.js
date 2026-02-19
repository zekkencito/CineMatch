import React, { useRef, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform, Animated, TouchableOpacity } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';

const Tab = createBottomTabNavigator();

// Componente personalizado para cada tab con animaciones
const AnimatedTabIcon = ({ focused, iconName, iconLib = 'material' }) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1 : 0.9)).current;
  const lineWidthAnim = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 0.9,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.spring(lineWidthAnim, {
        toValue: focused ? 1 : 0,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  const color = focused ? colors.primary : '#000000';
  const size = iconLib === 'fontisto' ? 24 : 28;

  return (
    <View style={styles.iconContainer}>
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        {iconLib === 'fontisto' ? (
          <Fontisto name={iconName} size={size} color={color} />
        ) : (
          <MaterialCommunityIcons name={iconName} size={size} color={color} />
        )}
      </Animated.View>
      <Animated.View
        style={[
          styles.activeIndicator,
          {
            opacity: lineWidthAnim,
            transform: [{ scaleX: lineWidthAnim }],
          },
        ]}
      />
    </View>
  );
};

const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopColor: 'transparent',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 90 : 72,
          paddingBottom: Platform.OS === 'ios' ? 24 : 12,
          paddingTop: 8,
          paddingHorizontal: 16,
          shadowColor: colors.textDark,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 12,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#000000',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          letterSpacing: 0.3,
          marginTop: 12,
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
      }}
    >
      <Tab.Screen
        name="Amigos Palomeros"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused} iconName="film" iconLib="fontisto" />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabLabel,
              { 
                color: focused ? colors.primary : '#000000',
                fontWeight: focused ? '800' : '600',
              }
            ]}>
              Palomeros
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Amigos de Butaca"
        component={MatchesScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused} iconName="chat" />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabLabel,
              { 
                color: focused ? colors.primary : '#000000',
                fontWeight: focused ? '800' : '600',
              }
            ]}>
              Butaca
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused} iconName="account" />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabLabel,
              { 
                color: focused ? colors.primary : '#000000',
                fontWeight: focused ? '800' : '600',
              }
            ]}>
              Perfil
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    width: 56,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
  },
  iconText: {
    fontSize: 26,
  },
  iconTextActive: {
    textShadowColor: colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 40,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.3,
    marginTop: -1,
  },
});

export default MainNavigator;
