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
      icon: '🎬',
      subtitle: 'Personaliza tus gustos y preferencias',
      onPress: () => navigation.navigate('Preferencias'),
    },
    {
      title: 'Editar Perfil',
      icon: '✏️',
      subtitle: 'Actualiza tu información personal',
      onPress: () => navigation.navigate('Editar Perfil'),
    },
    {
      title: 'Suscripción',
      icon: '⭐',
      subtitle: 'Características Premium',
      onPress: () => navigation.navigate('Suscripción'),
    },
    {
      title: 'Ajustes',
      icon: '⚙️',
      subtitle: 'Preferencias de la app y privacidad',
      onPress: () => Alert.alert('Próximamente', 'Función de ajustes próximamente!'),
    },
    {
      title: 'Ayuda y Soporte',
      icon: '💬',
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
            <View style={styles.editIconContainer}>
              <Text style={styles.editIcon}>📷</Text>
            </View>
          </TouchableOpacity>
          
          <View style={styles.nameBox}>
            <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
            {user?.age && (
              <View style={styles.ageBadge}>
                <Text style={styles.ageText}>{user.age}</Text>
              </View>
            )}
          </View>
          <Text style={styles.email}>{user?.email || 'No email'}</Text>
          
          {/* Información adicional del usuario */}
          {(user?.location?.city || user?.location?.country) && (
            <View style={styles.locationInfo}>
              <Text style={styles.locationEmoji}>📍</Text>
              <Text style={styles.locationText}>
                {[user?.location?.city, user?.location?.country].filter(Boolean).join(', ')}
              </Text>
            </View>
          )}
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
  avatarWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary,
    padding: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 68,
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
    bottom: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.secondary,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  editIcon: {
    fontSize: 22,
  },
  nameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  name: {
    fontSize: 30,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  ageBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ageText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
  },
  email: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  locationEmoji: {
    fontSize: 16,
  },
  locationText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  menuSection: {
    gap: 12,
    marginBottom: 24,
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
    padding: 16,
    borderRadius: 16,
    gap: 14,
    borderWidth: 2,
    borderColor: colors.border,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 22,
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '700',
  },
  menuSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: colors.accent,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 3,
    borderColor: colors.textDark,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutIcon: {
    fontSize: 20,
  },
  logoutButtonText: {
    color: colors.textDark,
    fontSize: 17,
    fontWeight: '800',
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 8,
  },
});

export default ProfileScreen;
