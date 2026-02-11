import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { authService } from '../services/authService';
import { preferenceService } from '../services/preferenceService';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await authService.getCurrentUser();
      const prefsData = await preferenceService.getUserPreferences();
      setUser(userData);
      setPreferences(prefsData);
    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Salir',
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.profile_photo_url || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.name || 'Usuario'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('Preferences')}
        >
          <View style={styles.menuItemLeft}>
            <Icon name="heart-outline" size={24} color="#E50914" />
            <Text style={styles.menuItemText}>Mis Gustos</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        {preferences?.favorite_genres && preferences.favorite_genres.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Géneros Favoritos:</Text>
            <View style={styles.tagsContainer}>
              {preferences.favorite_genres.map((genre, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{genre.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {preferences?.favorite_directors && preferences.favorite_directors.length > 0 && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Directores Favoritos:</Text>
            <View style={styles.tagsContainer}>
              {preferences.favorite_directors.map((director, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{director.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Icon name="notifications-outline" size={24} color="#E50914" />
            <Text style={styles.menuItemText}>Notificaciones</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Icon name="lock-closed-outline" size={24} color="#E50914" />
            <Text style={styles.menuItemText}>Privacidad</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Icon name="help-circle-outline" size={24} color="#E50914" />
            <Text style={styles.menuItemText}>Ayuda</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Icon name="log-out-outline" size={24} color="#fff" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.version}>CineMatch v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#E50914',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#999',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
  },
  previewContainer: {
    backgroundColor: '#1a1a1a',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  previewLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(229, 9, 20, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E50914',
    marginHorizontal: 20,
    marginTop: 30,
    padding: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  footer: {
    alignItems: 'center',
    padding: 30,
  },
  version: {
    color: '#666',
    fontSize: 12,
  },
});

export default ProfileScreen;
