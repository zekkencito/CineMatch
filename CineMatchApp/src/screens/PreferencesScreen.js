import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { preferenceService } from '../services/preferenceService';

const PreferencesScreen = ({ navigation }) => {
  const [genres, setGenres] = useState([]);
  const [directors, setDirectors] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [genresData, directorsData, prefsData] = await Promise.all([
        preferenceService.getGenres(),
        preferenceService.getDirectors(),
        preferenceService.getUserPreferences(),
      ]);

      setGenres(genresData);
      setDirectors(directorsData);
      
      if (prefsData) {
        setSelectedGenres(prefsData.favorite_genres?.map(g => g.id) || []);
        setSelectedDirectors(prefsData.favorite_directors?.map(d => d.id) || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleGenre = (genreId) => {
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const toggleDirector = (directorId) => {
    setSelectedDirectors(prev =>
      prev.includes(directorId)
        ? prev.filter(id => id !== directorId)
        : [...prev, directorId]
    );
  };

  const handleSave = async () => {
    if (selectedGenres.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un género');
      return;
    }

    setSaving(true);
    try {
      await Promise.all([
        preferenceService.saveFavoriteGenres(selectedGenres),
        preferenceService.saveFavoriteDirectors(selectedDirectors),
      ]);

      Alert.alert('Éxito', 'Preferencias guardadas correctamente', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Icon name="heart-circle" size={60} color="#E50914" />
          <Text style={styles.title}>Tus Gustos Cinematográficos</Text>
          <Text style={styles.subtitle}>
            Selecciona tus géneros y directores favoritos para encontrar mejores matches
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Géneros Favoritos</Text>
          <Text style={styles.sectionSubtitle}>
            Seleccionados: {selectedGenres.length}
          </Text>
          <View style={styles.optionsContainer}>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre.id}
                style={[
                  styles.optionButton,
                  selectedGenres.includes(genre.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleGenre(genre.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedGenres.includes(genre.id) && styles.optionTextSelected,
                  ]}
                >
                  {genre.name}
                </Text>
                {selectedGenres.includes(genre.id) && (
                  <Icon name="checkmark-circle" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Directores Favoritos</Text>
          <Text style={styles.sectionSubtitle}>
            Seleccionados: {selectedDirectors.length} (opcional)
          </Text>
          <View style={styles.optionsContainer}>
            {directors.map((director) => (
              <TouchableOpacity
                key={director.id}
                style={[
                  styles.optionButton,
                  selectedDirectors.includes(director.id) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleDirector(director.id)}
              >
                <Text
                  style={[
                    styles.optionText,
                    selectedDirectors.includes(director.id) && styles.optionTextSelected,
                  ]}
                >
                  {director.name}
                </Text>
                {selectedDirectors.includes(director.id) && (
                  <Icon name="checkmark-circle" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Guardar Preferencias</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 15,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#1a1a1a',
  },
  optionButtonSelected: {
    backgroundColor: '#E50914',
    borderColor: '#E50914',
  },
  optionText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  optionTextSelected: {
    color: '#fff',
  },
  footer: {
    padding: 20,
    backgroundColor: '#000',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#E50914',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PreferencesScreen;
