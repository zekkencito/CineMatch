import React, { useState } from 'react';
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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import colors from '../constants/colors';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // MODO DE PRUEBA - Acepta cualquier credencial para testing
      // Usuario de prueba: demo@cinematch.com / demo123
      if (email === 'demo@cinematch.com' && password === 'demo123') {
        // Simular login exitoso con datos de prueba
        const mockUser = {
          id: 1,
          name: 'Demo User',
          email: 'demo@cinematch.com',
          age: 25,
          bio: 'Movie lover and cinephile 🎬',
          profile_photo: 'https://i.pravatar.cc/300?img=12',
        };
        
        // Guardar en storage simulado
        await storage.saveToken('mock-token-123');
        await storage.saveUser(mockUser);
        
        // Login usando el contexto
        await login(email, password);
      } else {
        // Intentar login real con API
        await login(email, password);
      }
    } catch (error) {
      Alert.alert('Login Demo', 'Use estas credenciales de prueba:\n\nEmail: demo@cinematch.com\nPassword: demo123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>🎬 CineMatch</Text>
        <Text style={styles.subtitle}>Find your perfect movie match</Text>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>🎭 Modo Demo</Text>
          <Text style={styles.demoText}>Email: demo@cinematch.com</Text>
          <Text style={styles.demoText}>Password: demo123</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>
              Don't have an account? Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  demoBox: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
    borderWidth: 2,
    borderColor: colors.text,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 14,
    color: colors.text,
    textAlign: 'center',
    fontFamily: 'monospace',
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
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    padding: 16,
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});

export default LoginScreen;
