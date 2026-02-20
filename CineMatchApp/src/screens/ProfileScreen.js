import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [localPhoto, setLocalPhoto] = useState(null);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permisos requeridos', 'Por favor, permite el acceso a tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true);
        const photoUri = result.assets[0].uri;

        // Mostrar la imagen localmente inmediatamente
        setLocalPhoto(photoUri);

        try {
          // Convertir imagen a base64 usando expo-file-system
          const base64 = await FileSystem.readAsStringAsync(photoUri, {
            encoding: 'base64',
          });

          // Agregar el prefijo data:image para el base64
          const base64data = `data:image/jpeg;base64,${base64}`;

          // Actualizar el perfil con la imagen en base64
          await updateUser({ profile_photo: base64data });

          Alert.alert('Éxito', 'Foto de perfil actualizada!');
        } catch (error) {
          console.error('Error subiendo la foto:', error);
          Alert.alert('Error', 'No se pudo subir la foto. La imagen se muestra localmente solo.');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Error eligiendo la imagen:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const menuItems = [
    {
      title: 'Preferencias de Películas',
      icon: <Ionicons name="film-sharp" size={30} color="white" />,
      subtitle: 'Personaliza tus gustos y preferencias',
      onPress: () => navigation.navigate('Preferencias'),
    },
    {
      title: 'Editar Perfil',
      icon: <Ionicons name="pencil-sharp" size={30} color="white" />,
      subtitle: 'Actualiza tu información personal',
      onPress: () => navigation.navigate('Editar Perfil'),
    },
    {
      title: 'Suscripción',
      icon: <Ionicons name="star" size={30} color="white" />,
      subtitle: 'Características Premium',
      onPress: () => navigation.navigate('Suscripción'),
    },
    {
      title: 'Ajustes',
      icon: <Ionicons name="settings" size={30} color="white" />,
      subtitle: 'Preferencias de la app y privacidad',
      onPress: () => Alert.alert('Próximamente', 'Función de ajustes próximamente!'),
    },
    {
      title: 'Ayuda y Soporte',
      icon: <Ionicons name="help-circle-sharp" size={30} color="white" />,
      subtitle: 'Obtén ayuda o contáctanos',
      onPress: () => Alert.alert('Próximamente', 'Función de ayuda y soporte próximamente!'),
    },
  ];

  return (
    <LinearGradient
      colors={[colors.secondary, colors.secondaryLight]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
            {user?.subscription?.is_premium || user?.is_premium ? (
              <LinearGradient
                colors={['#ffd700', '#ffa500', '#ffd700']}
                style={styles.premiumAvatarBorder}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={[styles.avatarWrapper, { borderWidth: 0, padding: 4, backgroundColor: colors.secondary }]}>
                  <Image
                    source={{
                      uri: localPhoto || user?.profile_photo || 'https://via.placeholder.com/140',
                    }}
                    style={styles.avatar}
                  />
                  {uploadingPhoto && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color={colors.primary} size="large" />
                    </View>
                  )}
                </View>
              </LinearGradient>
            ) : (
              <View style={styles.avatarWrapper}>
                <Image
                  source={{
                    uri: localPhoto || user?.profile_photo || 'https://via.placeholder.com/140',
                  }}
                  style={styles.avatar}
                />
                {uploadingPhoto && (
                  <View style={styles.uploadingOverlay}>
                    <ActivityIndicator color={colors.primary} size="large" />
                  </View>
                )}
              </View>
            )}
            <View style={styles.editIconContainer}>
              <FontAwesome name="camera" size={24} color="black" />
            </View>
          </TouchableOpacity>

          <View style={styles.nameBox}>
            <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
            {user?.age ? (
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>{String(user.age)}</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.email}>{user?.email || 'No email'}</Text>

          {/* Información adicional del usuario */}
          {(user?.location?.city || user?.location?.country) ? (
            <View style={styles.locationInfo}>
              <Text style={styles.locationEmoji}>📍</Text>
              <Text style={styles.locationText}>
                {[user?.location?.city, user?.location?.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          ) : null}
        </Animated.View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <View>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text style={styles.version}>CineMatch v1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  premiumAvatarBorder: {
    width: 156,
    height: 156,
    borderRadius: 78,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ffd700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  avatarWrapper: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: colors.primary,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 70,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 68,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconContainer: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: colors.primary,
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  editIcon: {
    fontSize: 24,
  },
  nameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 6,
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  ageBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  ageText: {
    fontSize: 15,
    fontWeight: '900',
    color: colors.textDark,
  },
  premiumBadgeSmall: {
    backgroundColor: '#ffd700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  premiumBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 5,
    marginBottom: 1,
    paddingHorizontal: 18,
    paddingVertical: 10,
    backgroundColor: 'rgba(245, 197, 24, 0.15)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  locationEmoji: {
    fontSize: 18,
  },
  locationText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  menuSection: {
    gap: 12,
    marginBottom: 8,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bioContainer: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  bioHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  bioIcon: {
    fontSize: 20,
  },
  bioLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  bioText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  menuContainer: {
    gap: 10,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 18,
    borderRadius: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(245, 197, 24, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuIcon: {
    fontSize: 24,
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 17,
    color: colors.text,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  menuArrow: {
    fontSize: 28,
    color: colors.primary,
    fontWeight: '900',
  },
  logoutButton: {
    backgroundColor: colors.accent,
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: colors.textDark,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  logoutIcon: {
    fontSize: 22,
  },
  logoutButtonText: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

export default ProfileScreen;
