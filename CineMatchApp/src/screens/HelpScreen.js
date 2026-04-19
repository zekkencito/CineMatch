import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';

const faqs = [
  {
    q: 'No aparecen perfiles nuevos, ¿qué hago?',
    a: 'Revisa tu radio de búsqueda en Preferencias y luego recarga la pantalla de Palomeros.',
  },
  {
    q: '¿Cómo mejoro mis coincidencias?',
    a: 'Completa tus géneros, directores y películas vistas. Mientras más datos, mejores matches.',
  },
  {
    q: 'No me llegan notificaciones',
    a: 'Activa permisos del sistema y verifica en Ajustes que las notificaciones estén encendidas.',
  },
  {
    q: '¿Qué incluye Premium?',
    a: 'Incluye funciones avanzadas como mayor radio, rewind y herramientas de descubrimiento mejoradas.',
  },
];

const HelpScreen = () => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const openLink = async (url, fallbackMessage) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('No disponible', fallbackMessage);
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('No disponible', fallbackMessage);
    }
  };

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

        <Text style={styles.screenTitle}>Ayuda y Soporte</Text>
        <Text style={styles.screenSubtitle}>Resolvemos tus dudas para que sigas conectando</Text>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Contacto rápido</Text>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => openLink('mailto:soporte@cinematch.app?subject=Soporte%20CineMatch', 'No se pudo abrir tu app de correo.')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="mail" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Correo de soporte</Text>
              <Text style={styles.actionSubtitle}>soporte@cinematch.app</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => openLink('https://wa.me/51999999999', 'No se pudo abrir WhatsApp en este dispositivo.')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="logo-whatsapp" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>WhatsApp</Text>
              <Text style={styles.actionSubtitle}>Respuesta en horario de atención</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => openLink('https://cinematch.app/faq', 'No se pudo abrir el centro de ayuda.')}
          >
            <View style={styles.iconCircle}>
              <Ionicons name="help-circle" size={18} color={colors.primary} />
            </View>
            <View style={styles.actionTextWrap}>
              <Text style={styles.actionTitle}>Centro de ayuda web</Text>
              <Text style={styles.actionSubtitle}>Guías y preguntas frecuentes</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Preguntas frecuentes</Text>
          {faqs.map((item, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{item.q}</Text>
              <Text style={styles.faqAnswer}>{item.a}</Text>
            </View>
          ))}
        </View>

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
      paddingBottom: 40,
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
      gap: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.16,
      shadowRadius: 10,
      elevation: 4,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 2,
    },
    actionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: 10,
      paddingVertical: 10,
      gap: 10,
    },
    iconCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: 'rgba(245,197,24,0.1)',
      borderWidth: 1,
      borderColor: colors.borderLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionTextWrap: {
      flex: 1,
      gap: 1,
    },
    actionTitle: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    actionSubtitle: {
      color: colors.textSecondary,
      fontSize: 11,
    },
    faqItem: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 10,
      gap: 4,
    },
    faqQuestion: {
      color: colors.primary,
      fontSize: 13,
      fontWeight: '800',
    },
    faqAnswer: {
      color: colors.textSecondary,
      fontSize: 12,
      lineHeight: 18,
    },
    tipCard: {
      backgroundColor: 'rgba(245,197,24,0.12)',
      borderWidth: 1,
      borderColor: colors.borderLight,
      borderRadius: 16,
      padding: 12,
      gap: 4,
    },
    tipTitle: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '800',
    },
    tipText: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 18,
    },
  });

export default HelpScreen;

