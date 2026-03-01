import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();

  // Referencias para navegación entre inputs
  const passwordInputRef = useRef(null);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Configurar Google Sign-In
    GoogleSignin.configure({
      webClientId: '815909950118-ub202cfiv226mgf25t803lhgquclpcjv.apps.googleusercontent.com', // TODO: Reemplazar con tu Web Client ID real
      offlineAccess: true,
    });
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor, ingresa tu email y contraseña.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert(
        'Error al iniciar sesión',
        error?.message || 'Credenciales inválidas. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();

      const idToken = signInResult?.data?.idToken || signInResult?.idToken;

      if (!idToken) {
        throw new Error('No se obtuvo el token de Google');
      }

      const userInfo = signInResult?.data?.user || signInResult?.user || {};

      await loginWithGoogle({
        idToken,
        name: userInfo.name,
        email: userInfo.email,
        photo: userInfo.photo,
      });
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // Usuario canceló, no mostrar error
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Operación ya en progreso
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services no está disponible en este dispositivo.');
      } else {
        Alert.alert(
          'Error al iniciar con Google',
          error?.message || 'Ocurrió un error. Inténtalo de nuevo.'
        );
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setFacebookLoading(true);
      const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

      if (result.isCancelled) {
        return;
      }

      const data = await AccessToken.getCurrentAccessToken();
      if (!data) {
        throw new Error('No se obtuvo el token de Facebook');
      }

      await loginWithFacebook({
        accessToken: data.accessToken,
      });
    } catch (error) {
      if (!error?.message?.includes('cancel')) {
        Alert.alert(
          'Error al iniciar con Facebook',
          error?.message || 'Ocurrió un error. Inténtalo de nuevo.'
        );
      }
    } finally {
      setFacebookLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight, colors.secondary]}
        style={styles.gradient}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Logo Area */}
          <View style={styles.logoContainer}>
            <View style={styles.logoBox}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.logo}>CineMatch</Text>
            <Text style={styles.subtitle}>Encuentra a tus Amigos de Butaca</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="tucorreo@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <View>
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.input, { paddingRight: 50 }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                  <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={colors.textDark} size="small" />
              ) : (
                <>
                  <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                  <Text style={styles.loginButtonIcon}>→</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>O</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Botones de login social */}
            <TouchableOpacity
              style={styles.socialButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
              disabled={googleLoading}
            >
              {googleLoading ? (
                <ActivityIndicator size="small" color="#4285F4" />
              ) : (
                <Text style={styles.socialButtonTextGoogle}>G</Text>
              )}
              <Text style={styles.socialButtonLabel}>
                {googleLoading ? 'Conectando...' : 'Continuar con Google'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, styles.socialButtonFacebook]}
              onPress={handleFacebookSignIn}
              activeOpacity={0.8}
              disabled={facebookLoading}
            >
              {facebookLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.socialButtonTextFb}>f</Text>
              )}
              <Text style={[styles.socialButtonLabel, { color: '#fff' }]}>
                {facebookLoading ? 'Conectando...' : 'Continuar con Facebook'}
              </Text>
            </TouchableOpacity>

            <View style={styles.dividerSmall} />

            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Registro')}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                Crear Nueva Cuenta
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Para continuar, acepta nuestros{' '}
              <Text style={styles.footerLink}>Términos</Text> &{' '}
              <Text style={styles.footerLink}>Política de Privacidad</Text>
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoEmoji: {
    fontSize: 42,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 15,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
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
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  loginButtonIcon: {
    color: colors.textDark,
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.textSecondary,
    paddingHorizontal: 16,
    fontSize: 12,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    gap: 10,
  },
  socialButtonFacebook: {
    backgroundColor: '#1877F2',
    borderColor: '#1877F2',
  },
  socialIcon: {
    width: 22,
    height: 22,
  },
  socialButtonTextGoogle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4285F4',
  },
  socialButtonTextFb: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  socialButtonLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  dividerSmall: {
    height: 4,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
});

export default LoginScreen;
