import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import HomeScreen from '../screens/HomeScreen';
import MatchesScreen from '../screens/MatchesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Fontisto from '@expo/vector-icons/Fontisto';
import api from '../config/api';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const Tab = createBottomTabNavigator();

// Componente personalizado para cada tab con animaciones
const AnimatedTabIcon = ({ focused, iconName, iconLib = 'material', palette, styles }) => {
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

  const color = focused ? palette.primary : palette.textSecondary;
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

const MainNavigator = ({ navigation: parentNavigation }) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadPerMatch, setUnreadPerMatch] = useState({});
  // Insets de areas seguras para evitar que la barra de navegacion del sistema tape el tab bar
  const insets = useSafeAreaInsets();

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
          backgroundColor: colors.surfaceElevated,
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 94 : (78 + Math.max(insets.bottom, 0)),
          paddingBottom: Platform.OS === 'ios' ? 24 : Math.max(insets.bottom, 12),
          paddingTop: 10,
          paddingHorizontal: 12,
          shadowColor: colors.textDark,
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.34,
          shadowRadius: 22,
          elevation: 16,
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 8 : 6,
          left: 14,
          right: 14,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          letterSpacing: 0.3,
          marginTop: 5,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          borderRadius: 16,
        },
      }}
    >
      <Tab.Screen
        name="Amigos Palomeros"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <AnimatedTabIcon focused={focused} iconName="film" iconLib="fontisto" palette={colors} styles={styles} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabLabel,
              {
                color: focused ? colors.primary : colors.textSecondary,
                fontWeight: focused ? '800' : '600',
              },
              focused && styles.tabLabelActive,
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
              <AnimatedTabIcon focused={focused} iconName="chat" palette={colors} styles={styles} />
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
                color: focused ? colors.primary : colors.textSecondary,
                fontWeight: focused ? '800' : '600',
              },
              focused && styles.tabLabelActive,
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
            <AnimatedTabIcon focused={focused} iconName="account" palette={colors} styles={styles} />
          ),
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabLabel,
              {
                color: focused ? colors.primary : colors.textSecondary,
                fontWeight: focused ? '800' : '600',
              },
              focused && styles.tabLabelActive,
            ]}>
              Perfil
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const createStyles = (colors) => StyleSheet.create({
  iconContainer: {
    width: 62,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    position: 'relative',
    borderRadius: 14,
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
    color: colors.textDark,
    fontSize: 10,
    fontWeight: '900',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -1,
    width: 22,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  tabLabel: {
    fontSize: 12,
    letterSpacing: 0.2,
    marginTop: 0,
  },
  tabLabelActive: {
    letterSpacing: 0.35,
  },
});

export default MainNavigator;
