import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
// Importación condicional de react-native-maps (solo iOS/Android)
let MapView, Circle, Marker;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Circle = maps.Circle;
  Marker = maps.Marker;
}
import Slider from '@react-native-community/slider';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';
import LocationPicker from '../components/LocationPicker';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [searchRadius, setSearchRadius] = useState(15);
  const { register } = useAuth();
  
  // Referencias para navegación entre inputs
  const emailInputRef = useRef(null);
  const ageInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const bioInputRef = useRef(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRegister = async () => {
    const { name, email, password, confirmPassword, age } = formData;

    if (!name || !email || !password || !age) {
      Alert.alert('Error', 'Por favor, completa todos los campos requeridos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (parseInt(age) < 18) {
      Alert.alert('Error', 'Debes tener 18 años o más');
      return;
    }

    if (!locationData) {
      Alert.alert('Error', 'Por favor, obtén tu ubicación GPS primero');
      return;
    }

    if (!locationData.latitude || !locationData.longitude) {
      Alert.alert('Error', 'Coordenadas GPS inválidas. Intenta obtener la ubicación nuevamente.');
      return;
    }

    console.log('📍 Registration data:', {
      name,
      email,
      age: parseInt(age),
      hasPassword: !!password,
      location: locationData,
    });

    setLoading(true);
    try {
      await register({
        name,
        email,
        password,
        age: parseInt(age),
        bio: formData.bio,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        city: locationData.city,
        country: locationData.country,
      });
      
      // Navegar a PreferencesScreen para configurar gustos de películas
      Alert.alert(
        '✅ Cuenta creada',
        'Ahora configura tus preferencias de películas',
        [{
          text: 'Continuar',
          onPress: () => navigation.replace('Preferencias', { isInitialSetup: true })
        }]
      );
    } catch (error) {
      console.error('Registration error:', error);
      
      // Mostrar errores de validación específicos si existen
      if (error.errors) {
        const errorMessages = Object.keys(error.errors).map(key => 
          `${key}: ${error.errors[key].join(', ')}`
        ).join('\n');
        Alert.alert('Errores de Validación', errorMessages);
      } else if (error.message) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Error al registrar. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permiso Requerido', 'Por favor, permite el acceso a tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Error al seleccionar imagen');
    }
  };

  const updateFormData = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
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
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Crear Cuenta</Text>
            <Text style={styles.subtitle}>Únete a la comunidad de cinéfilos</Text>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{
                scale: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1]
                })
              }]
            }}
          >
            <TouchableOpacity onPress={pickImage} style={styles.photoSelector}>
              {profilePhoto ? (
                <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Text style={styles.photoIcon}>📷</Text>
                  <Text style={styles.photoText}>Añadir Foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            style={[
              styles.form,
              {
                opacity: fadeAnim,
              }
            ]}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre *</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                returnKeyType="next"
                onSubmitEditing={() => emailInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                ref={emailInputRef}
                style={styles.input}
                placeholder="tucorreo@email.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => ageInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Edad *</Text>
              <TextInput
                ref={ageInputRef}
                style={styles.input}
                placeholder="18+"
                placeholderTextColor={colors.textSecondary}
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                keyboardType="numeric"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contraseña *</Text>
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="Ingresa tu contraseña"
                placeholderTextColor={colors.textSecondary}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirmar Contraseña *</Text>
              <TextInput
                ref={confirmPasswordInputRef}
                style={styles.input}
                placeholder="Confirma tu contraseña"
                placeholderTextColor={colors.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                returnKeyType="next"
                onSubmitEditing={() => bioInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Biografía (Opcional)</Text>
              <TextInput
                ref={bioInputRef}
                style={[styles.input, styles.textArea]}
                placeholder="Cuéntanos sobre ti..."
                placeholderTextColor={colors.textSecondary}
                value={formData.bio}
                onChangeText={(value) => updateFormData('bio', value)}
                multiline
                numberOfLines={4}
                returnKeyType="done"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ubicación *</Text>
              <LocationPicker onLocationChange={setLocationData} />
              
              {locationData && (
                <View style={styles.mapSection}>
                  <Text style={styles.mapTitle}>Radio de búsqueda</Text>
                  <Text style={styles.mapSubtitle}>Hasta dónde buscaremos personas con tus gustos</Text>
                  
                  <View style={styles.mapContainer}>
                    {Platform.OS === 'web' ? (
                      // Fallback para web
                      <View style={styles.webMapPlaceholder}>
                        <Text style={styles.webMapEmoji}>🗺️</Text>
                        <Text style={styles.webMapTitle}>Mapa interactivo</Text>
                        <Text style={styles.webMapText}>
                          Disponible en la app móvil
                        </Text>
                        <View style={styles.webMapInfo}>
                          <Text style={styles.webMapInfoText}>📍 {locationData.city || 'Tu ubicación'}</Text>
                          <Text style={styles.webMapInfoText}>🎯 Radio: {searchRadius} km</Text>
                        </View>
                      </View>
                    ) : (
                      <MapView
                        style={styles.map}
                        initialRegion={{
                          latitude: locationData.latitude,
                          longitude: locationData.longitude,
                          latitudeDelta: Math.max(0.01, Math.min(10, searchRadius / 111)),
                          longitudeDelta: Math.max(0.01, Math.min(10, searchRadius / 111)),
                        }}
                        mapType="standard"
                        showsUserLocation={false}
                        zoomEnabled={true}
                        scrollEnabled={true}
                      >
                        <Marker
                          coordinate={{
                            latitude: locationData.latitude,
                            longitude: locationData.longitude,
                          }}
                          title="Tu ubicación"
                        >
                          <Text style={styles.markerEmoji}>📍</Text>
                        </Marker>
                        
                        <Circle
                          center={{
                            latitude: locationData.latitude,
                            longitude: locationData.longitude,
                          }}
                          radius={searchRadius * 1000}
                          fillColor="rgba(255, 215, 0, 0.2)"
                          strokeColor="rgba(255, 215, 0, 0.8)"
                          strokeWidth={3}
                        />
                      </MapView>
                    )}
                    
                    <View style={styles.mapOverlay}>
                      <View style={styles.distanceBadge}>
                        <Text style={styles.distanceBadgeText}>{searchRadius} km</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.radiusControl}>
                    <Text style={styles.radiusLabel}>Ajusta el radio:</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={5}
                      maximumValue={50}
                      step={5}
                      value={searchRadius}
                      onValueChange={setSearchRadius}
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.primary}
                    />
                    <View style={styles.radiusLabels}>
                      <Text style={styles.radiusLabelText}>5 km</Text>
                      <Text style={styles.radiusLabelText}>25 km</Text>
                      <Text style={styles.radiusLabelText}>50 km</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && { opacity: 0.6 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textDark} />
              ) : (
                <Text style={styles.registerButtonText}>Crear Cuenta</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>
              ¿Ya tienes una cuenta? <Text style={{ fontWeight: 'bold', color: colors.primary }}>Iniciar sesión</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBox: {
    width: 70,
    height: 70,
    backgroundColor: colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  logoEmoji: {
    fontSize: 38,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    letterSpacing: 0.3,
  },
  photoSelector: {
    alignSelf: 'center',
    marginBottom: 28,
  },
  profilePhoto: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: colors.primary,
  },
  photoPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: colors.card,
    borderWidth: 3,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  photoIcon: {
    fontSize: 36,
  },
  photoText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  form: {
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: colors.textDark,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  registerButtonIcon: {
    color: colors.textDark,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loginButton: {
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  mapSection: {
    marginTop: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  webMapEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  webMapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  webMapText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  webMapInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    gap: 6,
    width: '100%',
  },
  webMapInfoText: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  distanceBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  distanceBadgeText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '800',
  },
  markerEmoji: {
    fontSize: 32,
  },
  radiusControl: {
    marginTop: 16,
  },
  radiusLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  radiusLabelText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
});

export default RegisterScreen;
