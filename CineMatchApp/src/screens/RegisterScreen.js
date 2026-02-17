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
import MapView, { Circle, Marker } from 'react-native-maps';
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
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (parseInt(age) < 18) {
      Alert.alert('Error', 'You must be 18 or older');
      return;
    }

    if (!locationData) {
      Alert.alert('Error', 'Please get your GPS location first');
      return;
    }

    if (!locationData.latitude || !locationData.longitude) {
      Alert.alert('Error', 'Invalid GPS coordinates. Please try getting location again.');
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
          onPress: () => navigation.replace('Preferences', { isInitialSetup: true })
        }]
      );
    } catch (error) {
      console.error('Registration error:', error);
      
      // Mostrar errores de validación específicos si existen
      if (error.errors) {
        const errorMessages = Object.keys(error.errors).map(key => 
          `${key}: ${error.errors[key].join(', ')}`
        ).join('\n');
        Alert.alert('Validation Errors', errorMessages);
      } else if (error.message) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Failed to register. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'Please allow access to your photos');
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
      Alert.alert('Error', 'Failed to pick image');
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
              <Text style={styles.logoEmoji}>🎬</Text>
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join the cinephile community</Text>
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
                  <Text style={styles.photoText}>Add Photo</Text>
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
              <Text style={styles.inputLabel}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={colors.textSecondary}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={colors.textSecondary}
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Age *</Text>
              <TextInput
                style={styles.input}
                placeholder="18+"
                placeholderTextColor={colors.textSecondary}
                value={formData.age}
                onChangeText={(value) => updateFormData('age', value)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter password"
                placeholderTextColor={colors.textSecondary}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm password"
                placeholderTextColor={colors.textSecondary}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bio (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about yourself..."
                placeholderTextColor={colors.textSecondary}
                value={formData.bio}
                onChangeText={(value) => updateFormData('bio', value)}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Location *</Text>
              <LocationPicker onLocationChange={setLocationData} />
              
              {locationData && (
                <View style={styles.mapSection}>
                  <Text style={styles.mapTitle}>Radio de búsqueda</Text>
                  <Text style={styles.mapSubtitle}>Hasta dónde buscaremos personas con tus gustos</Text>
                  
                  <View style={styles.mapContainer}>
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
                <Text style={styles.registerButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>
                Already have an account? <Text style={{ fontWeight: 'bold', color: colors.primary }}>Login</Text>
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
