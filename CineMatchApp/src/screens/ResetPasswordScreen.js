/**
 * Pantalla de Reset de Contraseña
 * 
 * Archivo: src/screens/ResetPasswordScreen.js
 * Lugar: CineMatchApp/src/screens/
 * 
 * Uso:
 * import ResetPasswordScreen from '@/screens/ResetPasswordScreen';
 * 
 * Se puede pasar el token via deep link o como parámetro:
 * navigation.navigate('ResetPassword', { token: 'xxxxx' })
 */

import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import {
  verifyPasswordResetToken,
  resetPassword,
} from '@/services/authService';

export default function ResetPasswordScreen({ navigation, route }) {
  const { token: routeToken } = route.params || {};

  const [token, setToken] = useState(routeToken || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [verifying, setVerifying] = useState(!!routeToken);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  // Verificar token cuando se carga la pantalla
  useEffect(() => {
    if (routeToken) {
      verifyToken(routeToken);
    }
  }, [routeToken]);

  const verifyToken = async (tokenToVerify) => {
    try {
      setVerifying(true);
      const response = await verifyPasswordResetToken(tokenToVerify);

      if (response.success) {
        setUserEmail(response.email);
        setTokenValid(true);
      }
    } catch (error) {
      Alert.alert('Error', error.message, [
        { text: 'OK', onPress: () => navigation.navigate('ForgotPassword') },
      ]);
    } finally {
      setVerifying(false);
    }
  };

  const handleVerifyManualToken = () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Por favor ingresa el código de recuperación');
      return;
    }

    verifyToken(token);
  };

  const handleResetPassword = async () => {
    // Validaciones
    if (!password.trim()) {
      Alert.alert('Error', 'Por favor ingresa una contraseña');
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
      const response = await resetPassword(token, password, confirmPassword);

      if (response.success) {
        Alert.alert(
          'Éxito',
          'Tu contraseña ha sido actualizada correctamente. Por favor, inicia sesión con tu nueva contraseña.',
          [
            {
              text: 'Ir al Login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Mostrar pantalla de verificación si no hay token válido
  if (!tokenValid) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View className="flex-1 p-6 justify-center">
            <Text className="text-3xl font-bold text-gray-900 mb-4">
              🔑 Código de Recuperación
            </Text>

            <Text className="text-gray-600 text-base mb-6 leading-6">
              Ingresa el código que recibiste en tu correo electrónico para
              cambiar tu contraseña.
            </Text>

            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-2">
                Código de Recuperación
              </Text>
              <TextInput
                placeholder="Pega el código aquí"
                placeholderTextColor="#9CA3AF"
                value={token}
                onChangeText={setToken}
                editable={!verifying}
                autoCapitalize="none"
                className={`border-2 border-gray-300 rounded-lg p-4 text-base ${
                  verifying ? 'opacity-50' : ''
                }`}
              />
            </View>

            <TouchableOpacity
              onPress={handleVerifyManualToken}
              disabled={verifying || !token.trim()}
              className={`p-4 rounded-lg flex-row items-center justify-center ${
                verifying || !token.trim()
                  ? 'bg-gray-300'
                  : 'bg-purple-600'
              }`}
            >
              {verifying ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Verificar Código
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              className="mt-6"
            >
              <Text className="text-purple-600 text-center font-semibold">
                ← Volver
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // Pantalla de cambio de contraseña
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 p-6 justify-center">
          <Text className="text-3xl font-bold text-gray-900 mb-2">
            🔐 Nueva Contraseña
          </Text>
          <Text className="text-gray-600 mb-6">
            Para: {userEmail}
          </Text>

          {/* Password Input */}
          <View className="mb-4">
            <Text className="text-gray-700 font-semibold mb-2">
              Nueva Contraseña
            </Text>
            <View className="flex-row items-center border-2 border-gray-300 rounded-lg">
              <TextInput
                placeholder="Ingresa tu contraseña"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                className="flex-1 p-4 text-base"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="px-3"
              >
                <Text className="text-gray-600 text-xl">
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View className="mb-6">
            <Text className="text-gray-700 font-semibold mb-2">
              Confirmar Contraseña
            </Text>
            <View className="flex-row items-center border-2 border-gray-300 rounded-lg">
              <TextInput
                placeholder="Confirma tu contraseña"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
                editable={!loading}
                className="flex-1 p-4 text-base"
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(!showConfirm)}
                className="px-3"
              >
                <Text className="text-gray-600 text-xl">
                  {showConfirm ? '👁️' : '👁️‍🗨️'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Requirements */}
          <View className="bg-blue-50 p-3 rounded-lg mb-6 border border-blue-200">
            <Text className="text-blue-900 text-sm font-semibold mb-2">
              Requisitos:
            </Text>
            <Text className="text-blue-800 text-sm">
              • Mínimo 6 caracteres
            </Text>
            <Text className="text-blue-800 text-sm">
              • Las contraseñas deben coincidir
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading || !password || !confirmPassword}
            className={`p-4 rounded-lg flex-row items-center justify-center ${
              loading || !password || !confirmPassword
                ? 'bg-gray-300'
                : 'bg-purple-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Cambiar Contraseña
              </Text>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View className="mt-8 pt-8 border-t border-gray-200">
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-purple-600 text-center font-semibold text-base">
                ← Volver al Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
