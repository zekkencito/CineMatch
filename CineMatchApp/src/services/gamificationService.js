import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_STORAGE_KEY = 'cinematch_equipped_profile_background';

const FRAME_CATALOG = [
  {
    id: 'classic_gold',
    name: 'Clasico Dorado',
    unlockDay: 1,
    borderColor: '#F5C518',
    accentColor: '#FFD54A',
  },
  {
    id: 'noir_silver',
    name: 'Noir Plateado',
    unlockDay: 3,
    borderColor: '#A7A7A7',
    accentColor: '#D7D7D7',
  },
  {
    id: 'neon_pop',
    name: 'Neon Pop',
    unlockDay: 7,
    borderColor: '#31E9FF',
    accentColor: '#9E6CFF',
  },
  {
    id: 'epic_scarlet',
    name: 'Epico Escarlata',
    unlockDay: 14,
    borderColor: '#FF5A5A',
    accentColor: '#FFB86C',
  },
  {
    id: 'director_cut',
    name: 'Director Cut',
    unlockDay: 30,
    borderColor: '#B09A5E',
    accentColor: '#F3D27A',
  },
];

const BACKGROUND_CATALOG = [
  {
    id: 'default_classic',
    name: 'Predeterminado',
    unlockDay: 0,
    description: 'Estilo base de CineMatch',
  },
  {
    id: 'cinema_night',
    name: 'Noche de Cine',
    unlockDay: 14,
    description: 'Tonos frios para una noche de estreno',
  },
  {
    id: 'sunset_popcorn',
    name: 'Atardecer Popcorn',
    unlockDay: 21,
    description: 'Paleta calida inspirada en la tarde',
  },
  {
    id: 'red_carpet',
    name: 'Alfombra Roja',
    unlockDay: 30,
    description: 'Look premium para perfiles constantes',
  },
  {
    id: 'neon_lounge',
    name: 'Sala Neon',
    unlockDay: 45,
    description: 'Contraste vibrante para cinefilos elite',
  },
];

const defaultState = {
  currentStreak: 0,
  bestStreak: 0,
  lastActiveDate: null,
  unlockedFrames: ['classic_gold'],
  equippedFrame: 'classic_gold',
  totalActivities: 0,
};

const normalizeState = (rawState = {}) => ({
  currentStreak: rawState.current_streak ?? defaultState.currentStreak,
  bestStreak: rawState.best_streak ?? defaultState.bestStreak,
  lastActiveDate: rawState.last_active_date ?? defaultState.lastActiveDate,
  unlockedFrames: rawState.unlocked_frames ?? defaultState.unlockedFrames,
  equippedFrame: rawState.equipped_frame ?? defaultState.equippedFrame,
  totalActivities: rawState.total_activities ?? defaultState.totalActivities,
});

const getState = async (userId) => {
  try {
    const response = await api.get('/gamification/state');
    return normalizeState(response.data?.gamification || {});
  } catch (error) {
    console.warn('No se pudo cargar gamification state desde API:', error);
    return { ...defaultState };
  }
};

const trackActivity = async (userId, activityType = 'generic') => {
  try {
    const response = await api.post('/gamification/activity', {
      activity_type: activityType,
    });

    return {
      ...normalizeState(response.data?.gamification || {}),
      newlyUnlocked: response.data?.newly_unlocked || [],
      didCountForStreak: Boolean(response.data?.did_count_for_streak),
      activityType,
    };
  } catch (error) {
    console.warn('No se pudo registrar actividad de gamificacion:', error);
    return { ...defaultState, newlyUnlocked: [], didCountForStreak: false, activityType };
  }
};

const equipFrame = async (userId, frameId) => {
  try {
    await api.post('/gamification/equip-frame', {
      frame_id: frameId,
    });

    return getState(userId);
  } catch (error) {
    console.warn('No se pudo equipar marco en API:', error);
    return getState(userId);
  }
};

const getFrameCatalog = () => FRAME_CATALOG;

const getFrameById = (frameId) => FRAME_CATALOG.find((f) => f.id === frameId) || null;

const getNextReward = (currentStreak) => {
  const next = FRAME_CATALOG.find((frame) => frame.unlockDay > currentStreak);
  return next || null;
};

const getBackgroundCatalog = () => BACKGROUND_CATALOG;

const getUnlockedBackgrounds = (currentStreak = 0) => (
  BACKGROUND_CATALOG
    .filter((bg) => bg.unlockDay <= currentStreak)
    .map((bg) => bg.id)
);

const getBackgroundById = (backgroundId) => (
  BACKGROUND_CATALOG.find((bg) => bg.id === backgroundId) || BACKGROUND_CATALOG[0]
);

const getBackgroundGradient = (backgroundId, colors) => {
  switch (backgroundId) {
    case 'cinema_night':
      return ['#0D1B2A', '#1B263B', '#415A77'];
    case 'sunset_popcorn':
      return ['#2A1210', '#8C3B20', '#D9A441'];
    case 'red_carpet':
      return ['#22070E', '#5A0F1E', '#A31230'];
    case 'neon_lounge':
      return ['#0E0726', '#3A1671', '#01C7D9'];
    case 'default_classic':
    default:
      return ['#0A0A0A', '#121212', '#1B1B1B'];
  }
};

const getEquippedBackground = async (currentStreak = 0) => {
  try {
    const stored = await AsyncStorage.getItem(BACKGROUND_STORAGE_KEY);
    const unlocked = getUnlockedBackgrounds(currentStreak);
    if (stored && unlocked.includes(stored)) {
      return stored;
    }
  } catch (error) {
    console.warn('No se pudo cargar el fondo equipado:', error);
  }
  return 'default_classic';
};

const equipBackground = async (backgroundId, currentStreak = 0) => {
  const unlocked = getUnlockedBackgrounds(currentStreak);
  if (!unlocked.includes(backgroundId)) {
    throw new Error('Background not unlocked');
  }

  await AsyncStorage.setItem(BACKGROUND_STORAGE_KEY, backgroundId);
  return backgroundId;
};

export const gamificationService = {
  getState,
  trackActivity,
  equipFrame,
  getFrameCatalog,
  getFrameById,
  getNextReward,
  getBackgroundCatalog,
  getBackgroundById,
  getUnlockedBackgrounds,
  getBackgroundGradient,
  getEquippedBackground,
  equipBackground,
};
