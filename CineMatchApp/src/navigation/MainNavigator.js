import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform, Animated } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import colors from '../constants/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';

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
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadPerMatch, setUnreadPerMatch] = useState({});

  const fetchUnread = useCallback(async () => {
    try {
      const [totalRes, perMatchRes] = await Promise.all([
        api.get('/messages/unread-count'),
        api.get('/messages/unread-per-match'),
      ]);
      setUnreadCount(totalRes.data.unread_count || 0);
      setUnreadPerMatch(perMatchRes.data.unread_per_match || {});
    } catch (e) {
      // silencioso
    }
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    fetchUnread();

    // 🔥 Listener Firestore en tiempo real para badge inmediato
    const unreadDocRef = doc(db, 'unread', String(user.id));
    const unsubscribe = onSnapshot(unreadDocRef, (snapshot) => {
      if (snapshot.exists()) {
        // Cuando llega una señal nueva, re-fetch el conteo real del backend
        fetchUnread();
      }
    }, () => { });

    // También refrescar cada 15 segundos como respaldo
    const interval = setInterval(fetchUnread, 15000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [user?.id, fetchUnread]);

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
        initialParams={{ unreadPerMatch }}
        listeners={{ tabPress: () => { fetchUnread(); } }}
        options={{
          tabBarIcon: ({ focused }) => (
            <View>
              <AnimatedTabIcon focused={focused} iconName="chat" />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
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
  badge: {
    position: 'absolute',
    top: 2,
    right: -6,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.card,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
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
