import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
// import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
// import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

const { height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [googleLoading, setGoogleLoading] = useState(false);
  // const [facebookLoading, setFacebookLoading] = useState(false);
  const { login } = useAuth();

  // Referencias para navegación entre inputs
  const passwordInputRef = useRef(null);
  const scrollViewRef = useRef(null);
  const focusPasswordInput = () => {
    passwordInputRef.current?.focus();
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 120);
  };


  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  // Comentado para Expo Go - Google Sign-in requiere módulos nativos
  // useEffect(() => {
  //   GoogleSignin.configure({
  //     webClientId: '815909950118-ub202cfiv226mgf25t803lhgquclpcjv.apps.googleusercontent.com',
  //     offlineAccess: true,
  //   });
  // }, []);

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
// Comentado para Expo Go - Google Sign-in requiere módulos nativos
  // const handleGoogleSignIn = async () => {
  //   try {
  //     setGoogleLoading(true);
  //     await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  //     const signInResult = await GoogleSignin.signIn();

  //     const idToken = signInResult?.data?.idToken || signInResult?.idToken;

  //     if (!idToken) {
  //       throw new Error('No se obtuvo el token de Google');
  //     }

  //     const userInfo = signInResult?.data?.user || signInResult?.user || {};

  //     await loginWithGoogle({
  //       idToken,
  //       name: userInfo.name,
  //       email: userInfo.email,
  //       photo: userInfo.photo,
  //     });
  //   } catch (error) {
  //     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
  //       // Usuario canceló
  //     } else if (error.code === statusCodes.IN_PROGRESS) {
  //       // Ya en progreso
  //     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
  //       Alert.alert('Error', 'Google Play Services no está disponible en este dispositivo.');
  //     } else {
  //       Alert.alert(
  //         'Error al iniciar con Google',
  //         error?.message || 'Ocurrió un error. Inténtalo de nuevo.'
  //       );
  //     }
  //   } finally {
  //     setGoogleLoading(false);
  //   }
  // };

  // Comentado para Expo Go - Facebook Sign-in requiere módulos nativos
  // const handleFacebookSignIn = async () => {
  //   try {
  //     setFacebookLoading(true);
  //     const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

  //     if (result.isCancelled) {
  //       return;
  //     }

  //     const data = await AccessToken.getCurrentAccessToken();
  //     if (!data) {
  //       throw new Error('No se obtuvo el token de Facebook');
  //     }

  //     await loginWithFacebook({
  //       accessToken: data.accessToken,
  //     });
  //   } finally {
  //     setFacebookLoading(false);
  //   }
  // };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 24}
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
        style={styles.gradient}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
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
            <View style={styles.bgOrbTop} />
            <View style={styles.bgOrbBottom} />

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
                onSubmitEditing={focusPasswordInput}
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
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollToEnd({ animated: true });
                    }, 120);
                  }}
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

            <Text style={styles.helperText}>Accede con correo y contraseña para continuar.</Text>

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
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 44,
  },
  content: {
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    minHeight: height * 0.95,
  },
  bgOrbTop: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: colors.gradient.accentGlow,
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoBox: {
    width: 92,
    height: 92,
    backgroundColor: colors.primary,
    borderRadius: colors.radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  logo: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    letterSpacing: 0.4,
  },
  form: {
    gap: 16,
    backgroundColor: colors.surface,
    borderRadius: colors.radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
  },
  inputContainer: {
    gap: 7,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: colors.radius.md,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
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
    borderRadius: colors.radius.md,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.24,
    shadowRadius: 10,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: colors.textDark,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  loginButtonIcon: {
    color: colors.textDark,
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 7,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: -2,
  },
  registerButton: {
    backgroundColor: 'rgba(245,197,24,0.07)',
    borderRadius: colors.radius.md,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  registerButtonText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});

export default LoginScreen;
