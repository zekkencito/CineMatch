import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import baseColors from '../constants/colors';

const THEME_MODE_KEY = 'cinematch_theme_mode';
const BACKGROUND_THEME_KEY = 'cinematch_equipped_profile_background';

const BACKGROUND_GRADIENTS = {
  default_classic: {
    heroStart: '#0A0A0A',
    start: '#121212',
    end: '#1B1B1B',
    heroEnd: '#212121',
  },
  cinema_night: {
    heroStart: '#0D1B2A',
    start: '#1B263B',
    end: '#324C68',
    heroEnd: '#415A77',
  },
  sunset_popcorn: {
    heroStart: '#2A1210',
    start: '#8C3B20',
    end: '#B66A33',
    heroEnd: '#D9A441',
  },
  red_carpet: {
    heroStart: '#22070E',
    start: '#5A0F1E',
    end: '#7A1327',
    heroEnd: '#A31230',
  },
  neon_lounge: {
    heroStart: '#0E0726',
    start: '#3A1671',
    end: '#245F9D',
    heroEnd: '#01C7D9',
  },
};

const getBackgroundGradientSet = (backgroundId) => BACKGROUND_GRADIENTS[backgroundId] || BACKGROUND_GRADIENTS.default_classic;

const lightPalette = {
  ...baseColors,
  primary: '#FFA500',
  primaryLight: '#FFD700',
  primaryDark: '#FF8C00',
  secondary: '#FFFFFF',
  secondaryLight: '#F9F9F9',
  secondarySoft: '#F0F0F0',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceElevated: '#F8F8F8',
  card: '#FFFFFF',
  cardHover: '#F5F5F5',
  text: '#0B0B0B',
  textSecondary: '#555555',
  textMuted: '#777777',
  textDark: '#000000',
  border: '#E8E8E8',
  borderStrong: '#DFDFDF',
  borderLight: '#FFD700',
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.08)',
  overlayStrong: 'rgba(0,0,0,0.6)',
  gradient: {
    ...baseColors.gradient,
    start: 'rgba(250,250,250,0.85)',
    end: 'rgba(240,240,240,0.90)',
    heroStart: 'rgba(255,255,255,0.80)',
    heroEnd: 'rgba(245,245,245,0.88)',
    accentGlow: 'rgba(255,165,0,0.3)',
  },
};

const ThemeContext = createContext({
  themeMode: 'dark',
  resolvedTheme: 'dark',
  selectedBackground: 'default_classic',
  colors: baseColors,
  setThemeMode: () => {},
  setSelectedBackground: async () => {},
});

const getResolvedTheme = (themeMode) => {
  if (themeMode === 'system') {
    const system = Appearance.getColorScheme();
    return system === 'light' ? 'light' : 'dark';
  }
  return themeMode === 'light' ? 'light' : 'dark';
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState('dark');
  const [selectedBackground, setSelectedBackgroundState] = useState('default_classic');

  useEffect(() => {
    const loadThemeMode = async () => {
      try {
        const stored = await AsyncStorage.getItem(THEME_MODE_KEY);
        if (stored === 'dark' || stored === 'light' || stored === 'system') {
          setThemeModeState(stored);
        }
      } catch (error) {
        console.warn('No se pudo cargar el modo de tema:', error);
      }
    };

    loadThemeMode();
  }, []);

  useEffect(() => {
    const loadBackgroundTheme = async () => {
      try {
        const storedBackground = await AsyncStorage.getItem(BACKGROUND_THEME_KEY);
        if (storedBackground && BACKGROUND_GRADIENTS[storedBackground]) {
          setSelectedBackgroundState(storedBackground);
        }
      } catch (error) {
        console.warn('No se pudo cargar el fondo seleccionado:', error);
      }
    };

    loadBackgroundTheme();
  }, []);

  const setThemeMode = async (nextMode) => {
    if (nextMode !== 'dark' && nextMode !== 'light' && nextMode !== 'system') {
      return;
    }

    setThemeModeState(nextMode);
    try {
      await AsyncStorage.setItem(THEME_MODE_KEY, nextMode);
    } catch (error) {
      console.warn('No se pudo guardar el modo de tema:', error);
    }
  };

  const setSelectedBackground = async (backgroundId) => {
    if (!BACKGROUND_GRADIENTS[backgroundId]) {
      return;
    }

    setSelectedBackgroundState(backgroundId);
    try {
      await AsyncStorage.setItem(BACKGROUND_THEME_KEY, backgroundId);
    } catch (error) {
      console.warn('No se pudo guardar el fondo seleccionado:', error);
    }
  };

  const [systemScheme, setSystemScheme] = useState(Appearance.getColorScheme());

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemScheme(colorScheme);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const resolvedTheme = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'light' ? 'light' : 'dark';
    }
    return getResolvedTheme(themeMode);
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    const palette = resolvedTheme === 'light' ? lightPalette : baseColors;
    const bgGradient = getBackgroundGradientSet(selectedBackground);

    return {
      ...palette,
      gradient: {
        ...palette.gradient,
        heroStart: bgGradient.heroStart,
        start: bgGradient.start,
        end: bgGradient.end,
        heroEnd: bgGradient.heroEnd,
      },
    };
  }, [resolvedTheme, selectedBackground]);

  const contextValue = useMemo(
    () => ({
      themeMode,
      resolvedTheme,
      selectedBackground,
      colors,
      setThemeMode,
      setSelectedBackground,
    }),
    [themeMode, resolvedTheme, selectedBackground, colors]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
