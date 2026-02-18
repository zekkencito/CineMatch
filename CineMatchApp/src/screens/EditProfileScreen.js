import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import colors from '../constants/colors';

const EditProfileScreen = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    age: user?.age?.toString() || '',
    bio: user?.bio || '',
  });

  // Referencias para navegación con "Next"
  const ageInputRef = useRef(null);
  const bioInputRef = useRef(null);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }

    if (formData.age && (parseInt(formData.age) < 18 || parseInt(formData.age) > 120)) {
      Alert.alert('Error', 'La edad debe estar entre 18 y 120 años');
      return;
    }

    setLoading(true);
    try {
      const response = await api.put('/profile', {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        bio: formData.bio,
      });

      if (response.data.success) {
        setUser(response.data.user);
        Alert.alert('Éxito', 'Perfil actualizado correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          
        </View>
      </LinearGradient>
            <Text style={styles.headerTitle}>Editar Perfil</Text>
          <Text style={styles.headerSubtitle}>Actualiza tu información personal</Text>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <LinearGradient
            colors={[colors.secondary, colors.secondaryLight]}
            style={styles.formGradient}
          >
            <View style={styles.form}>
              {/* Nombre */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Nombre *</Text>
                <TextInput
                  style={styles.input}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Tu nombre"
                  placeholderTextColor={colors.textSecondary}
                  returnKeyType="next"
                  onSubmitEditing={() => ageInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>

              {/* Edad */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Edad</Text>
                <TextInput
                  ref={ageInputRef}
                  style={styles.input}
                  value={formData.age}
                  onChangeText={(text) => setFormData({ ...formData, age: text.replace(/[^0-9]/g, '') })}
                  placeholder="Tu edad"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  returnKeyType="next"
                  onSubmitEditing={() => bioInputRef.current?.focus()}
                  blurOnSubmit={false}
                  maxLength={3}
                />
              </View>

              {/* Bio */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Biografía</Text>
                <TextInput
                  ref={bioInputRef}
                  style={[styles.input, styles.bioInput]}
                  value={formData.bio}
                  onChangeText={(text) => setFormData({ ...formData, bio: text })}
                  placeholder="Cuéntanos sobre ti y tus gustos cinematográficos..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  returnKeyType="done"
                  maxLength={500}
                />
                <Text style={styles.charCount}>{formData.bio.length}/500</Text>
              </View>

              {/* Botones */}
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.disabledButton]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={colors.textDark} />
                ) : (
                  <>
                    <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                    <Text style={styles.saveButtonIcon}>→</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
                disabled={loading}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    padding: 50,
    paddingTop: 0,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  backButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  headerIconBox: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerIcon: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 6,
    marginLeft: 130,
    marginTop: 40,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  formGradient: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
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
  bioInput: {
    minHeight: 120,
    paddingTop: 16,
  },
  charCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 5,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  saveButtonIcon: {
    fontSize: 24,
    color: colors.textDark,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  cancelButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default EditProfileScreen;
