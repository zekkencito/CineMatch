/**
 * Pantalla de Olvide Contraseña
 * 
 * Archivo: src/screens/ForgotPasswordScreen.js
 * Lugar: CineMatchApp/src/screens/
 * 
 * Uso:
 * import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
 * 
 * export default function App() {
 *   return (
 *     <NavigationContainer>
 *       <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
 *     </NavigationContainer>
 *   );
 * }
 */

import React, { useState } from 'react';
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
import { requestPasswordReset } from '@/services/authService';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleRequestReset = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }

    // Validación básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordReset(email);

      if (response.success) {
        setSent(true);
        Alert.alert(
          'Correo Enviado',
          'Si tu correo está registrado en CineMatch, recibirás un enlace para recuperar tu contraseña en los próximos minutos.',
          [
            {
              text: 'Volver al Login',
              onPress: () => navigation.navigate('Login'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'No pudimos procesar tu solicitud');
    } finally {
      setLoading(false);
    }
  };

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
          {/* Header */}
          <View className="mb-8">
            <Text className="text-3xl font-bold text-gray-900 mb-2">
              🔐 Recuperar Contraseña
            </Text>
            <Text className="text-gray-600 text-base leading-6">
              Ingresa tu correo electrónico y te enviaremos un enlace para
              cambiar tu contraseña.
            </Text>
          </View>

          {/* Form */}
          <View>
            {/* Email Input */}
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-2">
                Correo Electrónico
              </Text>
              <TextInput
                placeholder="usuario@email.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                editable={!loading}
                autoCapitalize="none"
                className={`border-2 border-gray-300 rounded-lg p-4 text-base ${
                  loading ? 'opacity-50' : ''
                }`}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleRequestReset}
              disabled={loading || !email.trim()}
              className={`p-4 rounded-lg flex-row items-center justify-center ${
                loading || !email.trim()
                  ? 'bg-gray-300'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-base font-semibold">
                  Enviar Enlace
                </Text>
              )}
            </TouchableOpacity>

            {/* Help Text */}
            <Text className="text-gray-600 text-sm text-center mt-4">
              Por razones de seguridad, solo mostraremos un enlace si el correo
              está registrado.
            </Text>
          </View>

          {/* Footer */}
          <View className="mt-8 pt-8 border-t border-gray-200">
            <Text className="text-gray-600 text-center mb-3">
              ¿Ya tienes tu enlace?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
              <Text className="text-purple-600 text-center font-semibold text-base">
                Ir a cambiar contraseña
              </Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4">
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text className="text-gray-600 text-center">
                ← Volver al login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
