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
  secondary: '#FFFFFF',
  secondaryLight: '#F4F4F4',
  secondarySoft: '#EDEDED',
  background: '#F7F7F7',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardHover: '#F7F7F7',
  text: '#121212',
  textSecondary: '#4A4A4A',
  textMuted: '#6E6E6E',
  textDark: '#0B0B0B',
  border: '#E1E1E1',
  borderStrong: '#D5D5D5',
  borderLight: '#E3B812',
  overlay: 'rgba(0,0,0,0.45)',
  overlayLight: 'rgba(0,0,0,0.06)',
  gradient: {
    ...baseColors.gradient,
    start: 'rgba(248,248,248,0.78)',
    end: 'rgba(236,236,236,0.86)',
    heroStart: 'rgba(255,255,255,0.72)',
    heroEnd: 'rgba(237,237,237,0.84)',
    accentGlow: 'rgba(245,197,24,0.28)',
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
