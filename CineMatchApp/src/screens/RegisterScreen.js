import React, { useState } from 'react';
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
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
  const { register } = useAuth();

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Join CineMatch today</Text>

      <TouchableOpacity onPress={pickImage} style={styles.photoSelector}>
        {profilePhoto ? (
          <Image source={{ uri: profilePhoto }} style={styles.profilePhoto} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoIcon}>📷</Text>
            <Text style={styles.photoText}>Add Profile Photo</Text>
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Name *"
          placeholderTextColor={colors.textSecondary}
          value={formData.name}
          onChangeText={(value) => updateFormData('name', value)}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          placeholderTextColor={colors.textSecondary}
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder="Age *"
          placeholderTextColor={colors.textSecondary}
          value={formData.age}
          onChangeText={(value) => updateFormData('age', value)}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Password *"
          placeholderTextColor={colors.textSecondary}
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          secureTextEntry
        />

        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          placeholderTextColor={colors.textSecondary}
          value={formData.confirmPassword}
          onChangeText={(value) => updateFormData('confirmPassword', value)}
          secureTextEntry
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Bio (optional)"
          placeholderTextColor={colors.textSecondary}
          value={formData.bio}
          onChangeText={(value) => updateFormData('bio', value)}
          multiline
          numberOfLines={4}
        />

        <LocationPicker onLocationSelected={setLocationData} />

        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.registerButtonText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.loginButtonText}>
            Already have an account? Log In
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 30,
  },
  photoSelector: {
    alignSelf: 'center',
    marginBottom: 24,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  photoText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  registerButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    padding: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default RegisterScreen;
