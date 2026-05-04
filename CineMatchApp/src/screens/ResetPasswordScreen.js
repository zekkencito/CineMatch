import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';
import spacing from '../constants/spacing';
import api from '../config/api';

const { height } = Dimensions.get('window');

export default function ResetPasswordScreen({ navigation, route }) {
  const { token: routeToken, email: routeEmail } = route.params || {};

  const [stage, setStage] = useState(routeToken ? 'password' : 'token'); // 'token' o 'password'
  const [token, setToken] = useState(routeToken || '');
  const [email, setEmail] = useState(routeEmail || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
    ]).start();
  }, []);

  const handleVerifyToken = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get('/password-reset-verify', {
        params: { token },
      });

      if (response.data.success) {
        setEmail(response.data.email);
        setStage('password');
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Código inválido o expirado'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/password-reset', {
        email,
        token,
        password,
        password_confirmation: confirmPassword,
      });

      if (response.data.success) {
        Alert.alert(
          'Éxito',
          'Tu contraseña ha sido actualizada correctamente. Inicia sesión con tu nueva contraseña.',
          [
            {
              text: 'Ir al Login',
              onPress: () => navigation.navigate('Inicio de Sesión'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Error al cambiar la contraseña'
      );
    } finally {
      setLoading(false);
    }
  };

  // Pantalla de verificación de token
  if (stage === 'token') {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <LinearGradient
          colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
          style={styles.gradient}
        >
          <ScrollView
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
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={styles.bgOrbTop} />
              <View style={styles.bgOrbBottom} />

              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Ionicons name="chevron-back" size={28} color={colors.textLight} />
              </TouchableOpacity>

              <View style={styles.headerContainer}>
                <View style={styles.iconBox}>
                  <Ionicons name="key-outline" size={48} color={colors.primary} />
                </View>
                <Text style={styles.title}>Ingresa el Código</Text>
                <Text style={styles.subtitle}>
                  Copia el código que recibiste en tu correo electrónico
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Código de Recuperación</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Pega el código aquí"
                    placeholderTextColor={colors.textSecondary}
                    value={token}
                    onChangeText={setToken}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleVerifyToken}
                    editable={!loading}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                  onPress={handleVerifyToken}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.textDark} size="small" />
                  ) : (
                    <>
                      <Text style={styles.sendButtonText}>Verificar Código</Text>
                      <Ionicons name="checkmark" size={18} color={colors.textDark} style={{ marginLeft: 8 }} />
                    </>
                  )}
                </TouchableOpacity>

                <Text style={styles.helperText}>
                  El código es válido por 1 hora
                </Text>

                <TouchableOpacity
                  style={styles.backToLoginButton}
                  onPress={() => navigation.navigate('ForgotPassword')}
                  disabled={loading}
                >
                  <Text style={styles.backToLoginText}>
                    ← Solicitar nuevo código
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    );
  }

  // Pantalla de cambio de contraseña
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={[colors.gradient.heroStart, colors.gradient.start, colors.gradient.heroEnd]}
        style={styles.gradient}
      >
        <ScrollView
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
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <View style={styles.bgOrbTop} />
            <View style={styles.bgOrbBottom} />

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStage('token')}
            >
              <Ionicons name="chevron-back" size={28} color={colors.textLight} />
            </TouchableOpacity>

            <View style={styles.headerContainer}>
              <View style={styles.iconBox}>
                <Ionicons name="lock-open" size={48} color={colors.primary} />
              </View>
              <Text style={styles.title}>Nueva Contraseña</Text>
              <Text style={styles.subtitle}>
                Para: {email}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contraseña</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    returnKeyType="next"
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textSecondary}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirm}
                    returnKeyType="done"
                    onSubmitEditing={handleResetPassword}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirm(!showConfirm)}
                  >
                    <Ionicons
                      name={showConfirm ? 'eye-off' : 'eye'}
                      size={22}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.requirementsBox}>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={password.length >= 6 ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={18}
                    color={password.length >= 6 ? colors.success : colors.textSecondary}
                  />
                  <Text style={[
                    styles.requirementText,
                    password.length >= 6 && styles.requirementMet
                  ]}>
                    Mínimo 6 caracteres
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons
                    name={password === confirmPassword && password ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={18}
                    color={password === confirmPassword && password ? colors.success : colors.textSecondary}
                  />
                  <Text style={[
                    styles.requirementText,
                    password === confirmPassword && password && styles.requirementMet
                  ]}>
                    Las contraseñas coinciden
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.sendButton, loading && styles.sendButtonDisabled]}
                onPress={handleResetPassword}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textDark} size="small" />
                ) : (
                  <>
                    <Text style={styles.sendButtonText}>Cambiar Contraseña</Text>
                    <Ionicons name="checkmark" size={18} color={colors.textDark} style={{ marginLeft: 8 }} />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => navigation.navigate('Inicio de Sesión')}
                disabled={loading}
              >
                <Text style={styles.backToLoginText}>
                  ← Volver al Login
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

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
    minHeight: height,
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 10,
    padding: 8,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  iconBox: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(245,197,24,0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textLight,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginTop: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textLight,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textLight,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  passwordInputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.textLight,
  },
  eyeButton: {
    paddingHorizontal: 12,
  },
  requirementsBox: {
    backgroundColor: 'rgba(245,197,24,0.1)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,197,24,0.3)',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementText: {
    marginLeft: 10,
    fontSize: 13,
    color: colors.textSecondary,
  },
  requirementMet: {
    color: colors.primary,
    fontWeight: '600',
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: colors.textDark,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  helperText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 19,
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 20,
  },
  backToLoginText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  success: {
    color: '#10b981',
  },
});
