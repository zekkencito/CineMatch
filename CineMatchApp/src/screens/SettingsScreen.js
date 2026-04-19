import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { gamificationService } from '../services/gamificationService';

const SETTINGS_KEY = 'cinematch_app_settings';

const defaultSettings = {
  notificationsEnabled: true,
  messageSoundEnabled: true,
  vibrationEnabled: true,
  showDistance: true,
  showOnlineStatus: true,
};

const themeOptions = [
  { key: 'dark', label: 'Oscuro', icon: 'moon' },
  { key: 'light', label: 'Claro', icon: 'sunny' },
  { key: 'system', label: 'Sistema', icon: 'phone-portrait' },
];

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { user, setUser } = useAuth();
  const { colors, themeMode, resolvedTheme, selectedBackground, setThemeMode, setSelectedBackground } = useTheme();
  const [settings, setSettings] = useState(defaultSettings);
  const [gamification, setGamification] = useState(null);
  const frameCatalog = gamificationService.getFrameCatalog();
  const backgroundCatalog = gamificationService.getBackgroundCatalog();

  const styles = useMemo(() => createStyles(colors), [colors]);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const stored = await AsyncStorage.getItem(SETTINGS_KEY);
        if (!stored) return;
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.warn('No se pudieron cargar los ajustes:', error);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    const loadGamification = async () => {
      if (!user?.id) return;
      const state = await gamificationService.getState(user.id);
      setGamification(state);
    };

    loadGamification();
  }, [user?.id]);

  const handleEquipFrame = async (frameId) => {
    if (!user?.id) return;
    const next = await gamificationService.equipFrame(user.id, frameId);
    setGamification(next);
    setUser((prev) => ({ ...(prev || {}), equipped_frame: next.equippedFrame }));
  };

  const handleEquipBackground = async (backgroundId) => {
    try {
      await gamificationService.equipBackground(backgroundId, gamification?.currentStreak || 0);
      await setSelectedBackground(backgroundId);
    } catch (error) {
      // Bloqueado por racha
    }
  };

  const updateSetting = async (field, value) => {
    const next = { ...settings, [field]: value };
    setSettings(next);

    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('No se pudo guardar un ajuste:', error);
    }
  };

  const renderOptionSwitch = ({ key, label, subtitle }) => (
    <View key={key} style={styles.rowCard}>
      <View style={styles.rowTextContainer}>
        <Text style={styles.rowTitle}>{label}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{ false: '#888888', true: colors.primary }}
        thumbColor={settings[key] ? colors.textDark : '#f5f5f5'}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={18} color={colors.primary} />
          <Text style={styles.backButtonText}>Volver</Text>
        </TouchableOpacity>

        <Text style={styles.screenTitle}>Ajustes</Text>
        <Text style={styles.screenSubtitle}>Personaliza tu experiencia en CineMatch</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Apariencia</Text>
          <Text style={styles.sectionSubtitle}>Elige como quieres ver la app</Text>

          <View style={styles.themeRow}>
            {themeOptions.map((option) => {
              const selected = themeMode === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.themeChip, selected && styles.themeChipSelected]}
                  onPress={() => setThemeMode(option.key)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={option.icon}
                    size={16}
                    color={selected ? colors.textDark : colors.textSecondary}
                  />
                  <Text style={[styles.themeChipText, selected && styles.themeChipTextSelected]}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.themeHint}>
            Tema activo: {resolvedTheme === 'light' ? 'Claro' : 'Oscuro'}
          </Text>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Fondos de perfil</Text>
          <Text style={styles.sectionSubtitle}>Racha actual: {gamification?.currentStreak || 0} dias</Text>
          <View style={styles.backgroundsWrap}>
            {backgroundCatalog.map((background) => {
              const unlocked = (gamification?.currentStreak || 0) >= background.unlockDay;
              const isEquipped = selectedBackground === background.id;
              return (
                <TouchableOpacity
                  key={background.id}
                  style={[
                    styles.backgroundChip,
                    isEquipped && styles.backgroundChipEquipped,
                    !unlocked && styles.backgroundChipLocked,
                  ]}
                  activeOpacity={0.85}
                  onPress={() => unlocked && handleEquipBackground(background.id)}
                >
                  <LinearGradient
                    colors={gamificationService.getBackgroundGradient(background.id, colors)}
                    style={styles.backgroundPreview}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={[styles.backgroundName, isEquipped && styles.backgroundNameEquipped]}>
                    {background.name}
                  </Text>
                  <Text style={[styles.backgroundMeta, isEquipped && styles.backgroundMetaEquipped]}>
                    {isEquipped ? 'Equipado' : unlocked ? 'Disponible' : `Dia ${background.unlockDay}`}
                  </Text>
                  <Text style={styles.backgroundDesc}>{background.description}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Coleccion de marcos</Text>
          <Text style={styles.sectionSubtitle}>Racha actual: {gamification?.currentStreak || 0} dias</Text>
          <View style={styles.framesWrap}>
            {frameCatalog.map((frame) => {
              const unlocked = (gamification?.unlockedFrames || []).includes(frame.id);
              const equipped = gamification?.equippedFrame === frame.id;
              return (
                <TouchableOpacity
                  key={frame.id}
                  style={[
                    styles.frameChip,
                    {
                      borderColor: frame.borderColor,
                      backgroundColor: equipped ? frame.accentColor : colors.surface,
                      opacity: unlocked ? 1 : 0.45,
                    },
                  ]}
                  onPress={() => unlocked && handleEquipFrame(frame.id)}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.frameName, equipped && styles.frameNameEquipped]}>{frame.name}</Text>
                  <Text style={[styles.frameMeta, equipped && styles.frameMetaEquipped]}>
                    {equipped ? 'Equipado' : unlocked ? 'Disponible' : `Dia ${frame.unlockDay}`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Notificaciones</Text>
          {renderOptionSwitch({
            key: 'notificationsEnabled',
            label: 'Notificaciones push',
            subtitle: 'Avisos cuando recibes matches y mensajes',
          })}
          {renderOptionSwitch({
            key: 'messageSoundEnabled',
            label: 'Sonido de mensajes',
            subtitle: 'Reproducir sonido al recibir un chat nuevo',
          })}
          {renderOptionSwitch({
            key: 'vibrationEnabled',
            label: 'Vibración',
            subtitle: 'Feedback háptico en avisos importantes',
          })}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Privacidad</Text>
          {renderOptionSwitch({
            key: 'showDistance',
            label: 'Mostrar distancia',
            subtitle: 'Permite ver la distancia aproximada en perfiles',
          })}
          {renderOptionSwitch({
            key: 'showOnlineStatus',
            label: 'Estado en línea',
            subtitle: 'Permite que otros vean tu actividad reciente',
          })}
        </View>

        <Text style={styles.footerText}>
          Algunos ajustes visuales avanzados se aplican gradualmente en toda la app.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      paddingTop: Platform.OS === 'ios' ? 64 : 42,
      paddingBottom: 44,
      paddingHorizontal: 18,
      gap: 14,
    },
    screenTitle: {
      fontSize: 30,
      fontWeight: '900',
      color: colors.primary,
      letterSpacing: 0.3,
    },
    backButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 7,
      marginBottom: -2,
    },
    backButtonText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: '700',
    },
    screenSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: -6,
      marginBottom: 6,
      fontWeight: '500',
    },
    sectionCard: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      padding: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.17,
      shadowRadius: 10,
      elevation: 4,
      gap: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    sectionSubtitle: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: -4,
    },
    themeRow: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 4,
    },
    themeChip: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingVertical: 11,
    },
    themeChipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    themeChipText: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: '700',
    },
    themeChipTextSelected: {
      color: colors.textDark,
    },
    themeHint: {
      marginTop: 2,
      fontSize: 12,
      color: colors.textMuted,
      fontWeight: '600',
    },
    rowCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 10,
      gap: 12,
    },
    rowTextContainer: {
      flex: 1,
      gap: 2,
    },
    framesWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    backgroundsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 4,
    },
    frameChip: {
      width: '48%',
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 2,
    },
    frameName: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.text,
    },
    frameNameEquipped: {
      color: colors.textDark,
    },
    frameMeta: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    frameMetaEquipped: {
      color: colors.textDark,
    },
    backgroundChip: {
      width: '48%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 8,
      gap: 3,
      backgroundColor: colors.surface,
    },
    backgroundChipEquipped: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    backgroundChipLocked: {
      opacity: 0.5,
    },
    backgroundPreview: {
      width: '100%',
      height: 52,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.16)',
      marginBottom: 4,
    },
    backgroundName: {
      fontSize: 12,
      fontWeight: '800',
      color: colors.text,
    },
    backgroundNameEquipped: {
      color: colors.textDark,
    },
    backgroundMeta: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    backgroundMetaEquipped: {
      color: colors.textDark,
    },
    backgroundDesc: {
      fontSize: 10,
      color: colors.textMuted,
      lineHeight: 14,
    },
    rowTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    rowSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    footerText: {
      marginTop: 2,
      color: colors.textMuted,
      fontSize: 11,
      textAlign: 'center',
      lineHeight: 17,
      paddingHorizontal: 6,
    },
  });

export default SettingsScreen;

