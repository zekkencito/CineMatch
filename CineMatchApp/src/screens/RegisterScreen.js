import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome5'; // Fix Bootstrap import in RegisterScreen
import Button from '../components/Button';
import Input from '../components/Input';
// Importación condicional de react-native-maps (solo iOS/Android)
let MapView, Circle, Marker;
// Forzado a false para evitar crashes en APK por falta de Google Maps API Key
if (false && Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Circle = maps.Circle;
  Marker = maps.Marker;
}
import Slider from '@react-native-community/slider';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CustomAlert from '../components/CustomAlert';
import useCustomAlert from '../hooks/useCustomAlert';
import typography from '../constants/typography';
import spacing from '../constants/spacing';
import LocationPicker from '../components/LocationPicker';

const { height, width } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const { colors, resolvedTheme } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  // State management
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    age: '',
    bio: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [searchRadius, setSearchRadius] = useState(7);
  const { register } = useAuth();
  const { alertConfig, showSuccess, showError, showWarning, showInfo, showConfirm, hideAlert } = useCustomAlert();

  // Refs for input navigation
  const emailInputRef = useRef(null);
  const ageInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const bioInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(30)).current;
  const logoScaleAnim = useRef(new Animated.Value(0.5)).current;
  const formSlideAnim = useRef(new Animated.Value(50)).current;
  const photoScaleAnim = useRef(new Animated.Value(0.8)).current;

  // Animation setup
  useEffect(() => {
    // Set status bar for dark theme
    StatusBar.setBarStyle(resolvedTheme === 'light' ? 'dark-content' : 'light-content');
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(formSlideAnim, {
        toValue: 0,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
        delay: 100,
      }),
      Animated.spring(photoScaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 30,
        useNativeDriver: true,
        delay: 200,
      }),
    ]).start();
  }, []);

  // Form validation
  const validateForm = () => {
    const { name, email, password, confirmPassword, age } = formData;

    if (!name.trim()) {
      showWarning('Campo requerido', 'Por favor, ingresa tu nombre completo.');
      return false;
    }

    if (!email.trim()) {
      showWarning('Campo requerido', 'Por favor, ingresa tu correo electrónico.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showWarning('Correo inválido', 'Por favor, ingresa un correo electrónico válido.');
      return false;
    }

    if (!password) {
      showWarning('Campo requerido', 'Por favor, ingresa una contraseña.');
      return false;
    }

    if (password.length < 6) {
      showWarning('Contraseña débil', 'La contraseña debe tener al menos 6 caracteres.');
      return false;
    }

    if (password !== confirmPassword) {
      showWarning('Contraseñas no coinciden', 'Las contraseñas que ingresaste no son iguales.');
      return false;
    }

    if (!age || parseInt(age) < 18) {
      showWarning('Edad requerida', 'Debes tener 18 años o más para usar CineMatch.');
      return false;
    }

    if (!profilePhoto) {
      showWarning('Foto requerida', 'Por favor, añade una foto de perfil para continuar.');
      return false;
    }

    if (!locationData) {
      showWarning('Ubicación requerida', 'Por favor, obtén tu ubicación GPS para encontrar matches cercanos.');
      return false;
    }

    if (!locationData.latitude || !locationData.longitude) {
      showWarning('Ubicación inválida', 'Coordenadas GPS inválidas. Intenta obtener la ubicación nuevamente.');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    const { name, email, password, confirmPassword, age } = formData;
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
        profile_photo: profilePhoto,
      });

      showSuccess(
        '¡Bienvenido a CineMatch!',
        'Tu cuenta ha sido creada exitosamente. Ahora configuremos tus preferencias de películas.'
      ).then(() => {
        navigation.replace('Preferencias', { isInitialSetup: true });
      });
    } catch (error) {
      console.error('Registration error:', error);

      if (error.errors) {
        const errorMessages = Object.keys(error.errors).map(key =>
          `${key}: ${error.errors[key].join(', ')}`
        ).join('\n');
        showError('Errores de Validación', errorMessages);
      } else if (error.message) {
        showError('Error', error.message);
      } else {
        showError('Error', 'Error al registrar. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Image picker functionality
  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        showWarning(
          'Permiso requerido',
          'Necesitamos acceso a tu galería para que puedas subir una foto de perfil.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurar', onPress: () => Linking.openSettings() }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProfilePhoto(base64Image);
        
        // Animate the photo selection
        Animated.spring(photoScaleAnim, {
          toValue: 1.1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }).start(() => {
          Animated.spring(photoScaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 40,
            useNativeDriver: true,
          }).start();
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showError('Error', 'No pudimos acceder a tu galería. Por favor, inténtalo de nuevo.');
    }
  };

  // Form data management
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Navigation handlers
  const navigateToLogin = () => {
    navigation.navigate('Inicio de Sesión');
  };

  // Footer handlers
  const handleTermsPress = () => {
    // TODO: Navigate to terms screen or open modal
    console.log('Terms pressed');
  };

  const handlePrivacyPress = () => {
    // TODO: Navigate to privacy screen or open modal
    console.log('Privacy pressed');
  };

  // Input focus helpers
  const focusNextInput = (ref) => {
    ref.current?.focus();
  };

  const scrollToInput = (ref) => {
    setTimeout(() => {
      ref.current?.focus();
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={resolvedTheme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <LinearGradient
          colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
          style={styles.container}
        >
        {/* Background decorative elements */}
        <View style={styles.backgroundElements}>
          <View style={styles.bgOrbTop} />
          <View style={styles.bgOrbBottom} />
          <View style={styles.bgOrbRight} />
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideUpAnim },
                ],
              },
            ]}
          >
            {/* Minimal logo section */}
            <Animated.View
              style={[
                styles.logoSection,
                {
                  transform: [{ scale: photoScaleAnim }]
                }
              ]}
            >
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/logo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.brandName}>CineMatch</Text>
              <Text style={styles.brandTagline}>Crea tu cuenta</Text>
            </Animated.View>
          </Animated.View>

          {/* Profile Photo Section */}
          <Animated.View
            style={[
              styles.photoSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: photoScaleAnim }]
              }
            ]}
          >
            <TouchableOpacity onPress={pickImage} style={styles.photoSelector}>
              {profilePhoto ? (
                <>
                  <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
                  <View style={styles.photoEditOverlay}>
                    <Icon name="camera" size={20} color={colors.textDark} />
                    <Text style={styles.photoEditText}>Editar</Text>
                  </View>
                </>
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Icon name="camera" size={32} color={colors.primary} />
                  <Text style={styles.photoText}>Añadir Foto</Text>
                  <Text style={styles.photoSubtext}>Requerido</Text>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Dark form card */}
            <Animated.View
              style={[
                styles.formContainer,
                {
                  transform: [{ translateY: formSlideAnim }]
                }
              ]}
            >
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <Text style={styles.welcomeText}>Crear Cuenta</Text>
                  <Text style={styles.welcomeSubtext}>Completa tus datos para comenzar</Text>
                </View>

                <View style={styles.formFields}>
                  <Input
                    label="Nombre completo"
                    value={formData.name}
                    onChangeText={(value) => updateFormData('name', value)}
                    placeholder="Ej: María González"
                    icon="user"
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextInput(emailInputRef)}
                    autoCapitalize="words"
                    style={styles.inputField}
                  />

                  <Input
                    ref={emailInputRef}
                    label="Correo electrónico"
                    value={formData.email}
                    onChangeText={(value) => updateFormData('email', value)}
                    placeholder="tucorreo@email.com"
                    icon="mail"
                    keyboardType="email-address"
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextInput(ageInputRef)}
                    autoCapitalize="none"
                    autoCorrect={false}
                    style={styles.inputField}
                  />

                  <Input
                    ref={ageInputRef}
                    label="Edad"
                    value={formData.age}
                    onChangeText={(value) => updateFormData('age', value)}
                    placeholder="18+"
                    icon="calendar"
                    keyboardType="numeric"
                    returnKeyType="next"
                    onSubmitEditing={() => scrollToInput(passwordInputRef)}
                    maxLength={2}
                    style={styles.inputField}
                  />

                  <Input
                    ref={passwordInputRef}
                    label="Contraseña"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
                    placeholder="Mínimo 6 caracteres"
                    icon="lock-closed"
                    secureTextEntry
                    returnKeyType="next"
                    onSubmitEditing={() => focusNextInput(confirmPasswordInputRef)}
                    style={styles.inputField}
                  />

                  <Input
                    ref={confirmPasswordInputRef}
                    label="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
                    placeholder="Repite tu contraseña"
                    icon="lock-closed"
                    secureTextEntry
                    returnKeyType="next"
                    onSubmitEditing={() => scrollToInput(bioInputRef)}
                    style={styles.inputField}
                  />

                  <Input
                    ref={bioInputRef}
                    label="Biografía (Opcional)"
                    value={formData.bio}
                    onChangeText={(value) => updateFormData('bio', value)}
                    placeholder="Cuéntanos sobre ti..."
                    icon="comment"
                    multiline
                    numberOfLines={3}
                    returnKeyType="done"
                    textAlignVertical="top"
                    style={styles.inputField}
                  />
                </View>

                <Button
                  label={loading ? 'Creando...' : 'Crear Cuenta'}
                  onPress={handleRegister}
                  loading={loading}
                  disabled={loading}
                  fullWidth
                  style={styles.loginButton}
                />
              </View>
            </Animated.View>

          {/* Location Section */}
          <Animated.View
            style={[
              styles.locationSection,
              {
                opacity: fadeAnim,
                transform: [{ scale: photoScaleAnim }]
              }
            ]}
          >
            <View style={styles.locationCard}>
              <View style={styles.locationHeader}>
                <Text style={styles.locationTitle}>Ubicación</Text>
                <Text style={styles.locationSubtitle}>Encuentra matches cercanos</Text>
              </View>

              <View style={styles.inputGroup}>
                <LocationPicker onLocationChange={setLocationData} />
              </View>

              {locationData && (
                <View style={styles.mapSection}>
                  <Text style={styles.mapTitle}>Radio de búsqueda</Text>
                  <Text style={styles.mapSubtitle}>Define hasta dónde buscar personas con gustos similares</Text>

                  <View style={styles.mapContainer}>
                    {true || Platform.OS === 'web' ? (
                      <View style={styles.webMapPlaceholder}>
                        <Text style={styles.webMapEmoji}>Mapa interactivo</Text>
                        <Text style={styles.webMapText}>
                          Disponible en la app móvil
                        </Text>
                        <View style={styles.webMapInfo}>
                          <Text style={styles.webMapInfoText}>Ubicación: {locationData.city || 'Tu ubicación'}</Text>
                          <Text style={styles.webMapInfoText}>Radio: {searchRadius} km</Text>
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
                          <Text style={styles.markerEmoji}>Ubicación</Text>
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
                    <Text style={styles.radiusLabel}>Ajusta el radio de búsqueda:</Text>
                    <Slider
                      style={styles.slider}
                      minimumValue={1}
                      maximumValue={7}
                      step={1}
                      value={searchRadius}
                      onValueChange={setSearchRadius}
                      minimumTrackTintColor={colors.primary}
                      maximumTrackTintColor={colors.border}
                      thumbTintColor={colors.primary}
                    />
                    <View style={styles.radiusLabels}>
                      <Text style={styles.radiusLabelText}>1 km</Text>
                      <Text style={styles.radiusLabelText}>4 km</Text>
                      <Text style={styles.radiusLabelText}>7 km</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al continuar, aceptas nuestros{' '}
              <Text style={styles.footerLink} onPress={handleTermsPress}>Términos</Text>
              {' y '}
              <Text style={styles.footerLink} onPress={handlePrivacyPress}>Privacidad</Text>
            </Text>
          </View>

          {/* Login Link */}
          <View style={styles.loginLinkSection}>
            <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.7}>
              <Text style={styles.loginLinkText}>
                ¿Ya tienes cuenta? <Text style={styles.loginLinkHighlight}>Iniciar sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        </LinearGradient>
        
        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const createStyles = (colors) => StyleSheet.create({
  // Layout and container styles
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 80,
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  content: {
    justifyContent: 'center',
    minHeight: height * 0.8,
  },

  // Background pattern
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  patternDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },

  // Background decorative elements
  backgroundElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  bgOrbTop: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.gradient.accentGlow,
    opacity: 0.6,
  },
  bgOrbBottom: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  bgOrbRight: {
    position: 'absolute',
    top: height * 0.3,
    right: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,215,0,0.04)',
  },

  // Logo section
  logoSection: {
    alignItems: 'center',
    marginBottom: 50,
    marginTop: 20,
  },
  logoContainer: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.4)',
    marginBottom: 24,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
  },
  brandName: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 12,
    letterSpacing: 1,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  brandTagline: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Form container
  formContainer: {
    marginBottom: 30,
  },
  formCard: {
    backgroundColor: 'rgba(26, 26, 26, 0.8)',
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  formFields: {
    gap: 20,
  },
  inputField: {
    marginBottom: 4,
  },

  // Buttons
  loginButton: {
    marginBottom: 20,
    backgroundColor: colors.primary,
  },
  loginButtonText: {
    color: colors.textDark,
    fontWeight: '800',
    textAlign: 'center',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#888',
    fontSize: 12,
    marginHorizontal: 16,
  },
  registerButton: {
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#FFD700',
    fontWeight: '600',
    textAlign: 'center',
  },
  registerButtonHighlight: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#FFD700',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },

  // Login Link Section
  loginLinkSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  loginLinkHighlight: {
    color: '#FFD700',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: colors.radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  sectionEyebrow: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    ...typography.h1,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
    textShadowColor: 'rgba(255,215,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 24,
  },
  featureStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  featurePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: colors.radius.full,
    backgroundColor: 'rgba(255,215,0,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  featurePillText: {
    ...typography.smallStrong,
    color: colors.primary,
  },

  // Photo section styles
  photoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  photoSelector: {
    position: 'relative',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  photoEditOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    borderRadius: colors.radius.full,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  photoEditText: {
    ...typography.smallStrong,
    color: colors.textDark,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 3,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  photoText: {
    ...typography.bodyMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  photoSubtext: {
    ...typography.small,
    color: colors.textMuted,
  },

  // Form section styles
  formSection: {
    marginBottom: spacing.xl,
  },
  formCard: {
    backgroundColor: 'rgba(26,26,26,0.95)',
    borderRadius: colors.radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  formTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  formSubtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  formContent: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  inputLabel: {
    ...typography.label,
    color: colors.primary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: colors.radius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    fontFamily: typography.bodyMedium.fontFamily,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Location section styles
  locationSection: {
    marginBottom: spacing.xl,
  },
  locationCard: {
    backgroundColor: 'rgba(26,26,26,0.95)',
    borderRadius: colors.radius.xl,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.2)',
  },
  locationHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  locationTitle: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  locationSubtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Action section styles
  actionSection: {
    alignItems: 'center',
    gap: spacing.md,
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: colors.radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    ...typography.bodyStrong,
    color: colors.textDark,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButton: {
    paddingVertical: spacing.md,
  },
  loginButtonText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  loginButtonHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
  // Map section styles
  mapSection: {
    marginTop: spacing.lg,
  },
  mapTitle: {
    ...typography.h4,
    color: colors.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  mapSubtitle: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  mapContainer: {
    height: 300,
    borderRadius: colors.radius.lg,
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
    borderRadius: colors.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border,
  },
  webMapEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  webMapTitle: {
    ...typography.h4,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  webMapText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textAlign: 'center',
  },
  webMapInfo: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.secondary,
    borderRadius: colors.radius.lg,
    gap: spacing.sm,
    width: '100%',
  },
  webMapInfoText: {
    ...typography.bodyMedium,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapOverlay: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    zIndex: 10,
  },
  distanceBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: colors.radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  distanceBadgeText: {
    ...typography.bodyStrong,
    color: colors.textDark,
    fontWeight: '800',
  },
  markerEmoji: {
    fontSize: 32,
  },
  radiusControl: {
    marginTop: spacing.lg,
  },
  radiusLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  radiusLabelText: {
    ...typography.small,
    color: colors.textMuted,
    fontWeight: '500',
  },
});

export default RegisterScreen;

