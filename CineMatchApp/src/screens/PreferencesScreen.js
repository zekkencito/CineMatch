import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import colors from '../constants/colors';
import tmdbMovieService from '../services/tmdbMovieService';
import preferenceService from '../services/preferenceService';

const PreferencesScreen = ({ navigation, route }) => {
  const isInitialSetup = route?.params?.isInitialSetup || false;
  
  const [activeTab, setActiveTab] = useState('genres');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Géneros
  const [allGenres, setAllGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  
  // Directores
  const [directorSearch, setDirectorSearch] = useState('');
  const [directorResults, setDirectorResults] = useState([]);
  const [selectedDirectors, setSelectedDirectors] = useState([]);
  const [searchingDirectors, setSearchingDirectors] = useState(false);
  
  // Películas
  const [movieSearch, setMovieSearch] = useState('');
  const [movieResults, setMovieResults] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [searchingMovies, setSearchingMovies] = useState(false);
  
  // Radio de búsqueda
  const [searchRadius, setSearchRadius] = useState(50);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      
      // Cargar géneros de TMDB
      const genres = await tmdbMovieService.getGenres();
      setAllGenres(genres);
      
      // Si no es setup inicial, cargar preferencias guardadas
      if (!isInitialSetup) {
        const [favGenres, favDirectors, watched, location] = await Promise.all([
          preferenceService.getFavoriteGenres(),
          preferenceService.getFavoriteDirectors(),
          preferenceService.getWatchedMovies(),
          preferenceService.getLocation(),
        ]);
        
        setSelectedGenres(favGenres.map(g => g.id));
        setSelectedDirectors(favDirectors);
        setWatchedMovies(watched);
        setSearchRadius(location?.radius || 50);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'No se pudieron cargar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  // Buscar directores
  const searchDirectors = async (query) => {
    if (query.length < 2) {
      setDirectorResults([]);
      return;
    }
    
    try {
      setSearchingDirectors(true);
      const results = await tmdbMovieService.searchDirectors(query);
      setDirectorResults(results);
    } catch (error) {
      console.error('Error searching directors:', error);
    } finally {
      setSearchingDirectors(false);
    }
  };

  // Buscar películas
  const searchMovies = async (query) => {
    if (query.length < 2) {
      setMovieResults([]);
      return;
    }
    
    try {
      setSearchingMovies(true);
      const results = await tmdbMovieService.searchMovies(query);
      // searchMovies retorna { movies: [...], total_pages, total_results }
      setMovieResults(results.movies || []);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setSearchingMovies(false);
    }
  };

  // Toggle género
  const toggleGenre = (genreId) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  // Agregar director
  const addDirector = (director) => {
    if (selectedDirectors.find(d => d.id === director.id)) {
      Alert.alert('Info', 'Este director ya está en tu lista');
      return;
    }
    
    setSelectedDirectors(prev => [...prev, {
      id: director.id,
      name: director.name,
      profile_path: director.profile_path,
    }]);
    setDirectorSearch('');
    setDirectorResults([]);
  };

  // Remover director
  const removeDirector = (directorId) => {
    setSelectedDirectors(prev => prev.filter(d => d.id !== directorId));
  };

  // Agregar película
  const addMovie = (movie) => {
    if (watchedMovies.find(m => m.id === movie.id)) {
      Alert.alert('Info', 'Esta película ya está en tu lista');
      return;
    }
    
    setWatchedMovies(prev => [...prev, {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_year: movie.release_date?.substring(0, 4),
    }]);
    setMovieSearch('');
    setMovieResults([]);
  };

  // Remover película
  const removeMovie = (movieId) => {
    setWatchedMovies(prev => prev.filter(m => m.id !== movieId));
  };

  // Guardar preferencias
  const savePreferences = async () => {
    // Validaciones
    if (selectedGenres.length === 0) {
      Alert.alert('Error', 'Selecciona al menos 1 género');
      return;
    }
    
    if (selectedDirectors.length === 0) {
      Alert.alert('Error', 'Agrega al menos 1 director favorito');
      return;
    }

    try {
      setSaving(true);
      
      // Preparar datos para enviar al backend (solo id y title)
      const moviesToSync = watchedMovies.map(m => ({
        id: m.id,
        title: m.title,
        rating: m.rating || null,
      }));
      
      const directorsToSync = selectedDirectors.map(d => ({
        id: d.id,
        name: d.name,
      }));
      
      // Guardar todo usando sync (más eficiente)
      await Promise.all([
        preferenceService.syncFavoriteGenres(selectedGenres),
        preferenceService.syncFavoriteDirectors(directorsToSync),
        preferenceService.syncWatchedMovies(moviesToSync),
        preferenceService.updateLocation({ searchRadius }),
      ]);
      
      Alert.alert(
        '✅ Guardado',
        'Tus preferencias se guardaron correctamente',
        [{ 
          text: 'OK', 
          onPress: () => {
            if (isInitialSetup) {
              navigation.replace('MainTabs');
            } else {
              navigation.goBack();
            }
          }
        }]
      );
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'No se pudieron guardar las preferencias');
    } finally {
      setSaving(false);
    }
  };

  // Renderizar tabs
  const renderTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'genres' && styles.activeTab]}
        onPress={() => setActiveTab('genres')}
      >
        <Text style={[styles.tabText, activeTab === 'genres' && styles.activeTabText]}>
          Géneros
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'directors' && styles.activeTab]}
        onPress={() => setActiveTab('directors')}
      >
        <Text style={[styles.tabText, activeTab === 'directors' && styles.activeTabText]}>
          Directores
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'movies' && styles.activeTab]}
        onPress={() => setActiveTab('movies')}
      >
        <Text style={[styles.tabText, activeTab === 'movies' && styles.activeTabText]}>
          Películas
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'radius' && styles.activeTab]}
        onPress={() => setActiveTab('radius')}
      >
        <Text style={[styles.tabText, activeTab === 'radius' && styles.activeTabText]}>
          Radio
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Renderizar géneros
  const renderGenres = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Selecciona tus géneros favoritos</Text>
      <Text style={styles.sectionSubtitle}>
        Mínimo 1 género • {selectedGenres.length} seleccionados
      </Text>
      
      <View style={styles.genreGrid}>
        {allGenres.map(genre => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.genreChip,
              selectedGenres.includes(genre.id) && styles.genreChipSelected
            ]}
            onPress={() => toggleGenre(genre.id)}
          >
            <Text style={[
              styles.genreChipText,
              selectedGenres.includes(genre.id) && styles.genreChipTextSelected
            ]}>
              {selectedGenres.includes(genre.id) ? '✓ ' : ''}{genre.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Renderizar directores
  const renderDirectors = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Directores favoritos</Text>
      <Text style={styles.sectionSubtitle}>
        Busca y agrega directores que te gustan
      </Text>
      
      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar director (ej: Christopher Nolan)"
          placeholderTextColor={colors.textSecondary}
          value={directorSearch}
          onChangeText={(text) => {
            setDirectorSearch(text);
            searchDirectors(text);
          }}
        />
        {searchingDirectors && <ActivityIndicator style={styles.searchLoader} />}
      </View>
      
      {/* Resultados de búsqueda */}
      {directorResults.length > 0 && (
        <View style={styles.resultsContainer}>
          {directorResults.map(director => (
            <TouchableOpacity
              key={director.id}
              style={styles.resultItem}
              onPress={() => addDirector(director)}
            >
              <View style={styles.resultItemWithImage}>
                {director.profile_path ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w185${director.profile_path}` }}
                    style={styles.directorPhoto}
                  />
                ) : (
                  <View style={styles.directorPhotoPlaceholder}>
                    <Text style={styles.directorInitials}>
                      {director.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                    </Text>
                  </View>
                )}
                <Text style={styles.resultText}>{director.name}</Text>
              </View>
              <Text style={styles.addButton}>+ Agregar</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Directores seleccionados */}
      <Text style={styles.listTitle}>
        Seleccionados ({selectedDirectors.length})
      </Text>
      {selectedDirectors.length === 0 ? (
        <Text style={styles.emptyText}>No has agregado directores aún</Text>
      ) : (
        <View style={styles.selectedList}>
          {selectedDirectors.map(director => (
            <View key={director.id} style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>{director.name}</Text>
              <TouchableOpacity onPress={() => removeDirector(director.id)}>
                <Text style={styles.removeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Renderizar películas
  const renderMovies = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Películas favoritas</Text>
      <Text style={styles.sectionSubtitle}>
        Agrega películas que hayas visto y te gustaron
      </Text>
      
      {/* Búsqueda */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar película (ej: Inception)"
          placeholderTextColor={colors.textSecondary}
          value={movieSearch}
          onChangeText={(text) => {
            setMovieSearch(text);
            searchMovies(text);
          }}
        />
        {searchingMovies && <ActivityIndicator style={styles.searchLoader} />}
      </View>
      
      {/* Resultados de búsqueda */}
      {movieResults.length > 0 && (
        <View style={styles.resultsContainer}>
          {movieResults.map(movie => (
            <TouchableOpacity
              key={movie.id}
              style={styles.resultItem}
              onPress={() => addMovie(movie)}
            >
              {movie.poster_path ? (
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w342${movie.poster_path}` }}
                  style={styles.moviePoster}
                />
              ) : (
                <View style={styles.moviePosterPlaceholder}>
                  <Text style={styles.moviePosterIcon}>🎬</Text>
                </View>
              )}
              <View style={styles.movieResultInfo}>
                <Text style={styles.resultText}>{movie.title}</Text>
                <Text style={styles.movieYear}>
                  {movie.release_date?.substring(0, 4)}
                </Text>
              </View>
              <Text style={styles.addButton}>+ Agregar</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Películas seleccionadas */}
      <Text style={styles.listTitle}>
        Tus películas ({watchedMovies.length})
      </Text>
      {watchedMovies.length === 0 ? (
        <Text style={styles.emptyText}>No has agregado películas aún</Text>
      ) : (
        <View style={styles.selectedList}>
          {watchedMovies.map(movie => (
            <View key={movie.id} style={styles.selectedItem}>
              <View>
                <Text style={styles.selectedItemText}>{movie.title}</Text>
                {movie.release_year && (
                  <Text style={styles.movieYearSmall}>{movie.release_year}</Text>
                )}
              </View>
              <TouchableOpacity onPress={() => removeMovie(movie.id)}>
                <Text style={styles.removeButton}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Renderizar radio
  const renderRadius = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Radio de búsqueda</Text>
      <Text style={styles.sectionSubtitle}>
        Define qué tan lejos quieres buscar personas
      </Text>
      
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusValue}>{searchRadius} km</Text>
        
        <Slider
          style={styles.slider}
          minimumValue={5}
          maximumValue={500}
          step={5}
          value={searchRadius}
          onValueChange={setSearchRadius}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        
        <View style={styles.radiusLabels}>
          <Text style={styles.radiusLabel}>5 km (cerca)</Text>
          <Text style={styles.radiusLabel}>500 km (lejos)</Text>
        </View>
      </View>
      
      <View style={styles.radiusInfo}>
        <Text style={styles.radiusInfoText}>
          ℹ️ Buscaremos personas dentro de {searchRadius}km de tu ubicación actual que tengan gustos similares en películas.
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando preferencias...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isInitialSetup ? 'Configura tus preferencias' : 'Mis Preferencias'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isInitialSetup 
            ? 'Para encontrar mejores movie buddies' 
            : 'Edita tus gustos de películas'}
        </Text>
      </View>

      {renderTabs()}

      <ScrollView style={styles.scrollView}>
        {activeTab === 'genres' && renderGenres()}
        {activeTab === 'directors' && renderDirectors()}
        {activeTab === 'movies' && renderMovies()}
        {activeTab === 'radius' && renderRadius()}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isInitialSetup ? 'Continuar' : 'Guardar cambios'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 15,
    color: colors.textSecondary,
    fontSize: 16,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.card,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  genreChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genreChipText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '500',
  },
  genreChipTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    paddingRight: 50,
  },
  searchLoader: {
    position: 'absolute',
    right: 15,
    top: 16,
  },
  resultsContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultItemWithImage: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  directorPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.border,
  },
  directorPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  directorInitials: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  moviePosterPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moviePosterIcon: {
    fontSize: 30,
  },
  resultText: {
    fontSize: 16,
    color: colors.text,
    flex: 1,
  },
  movieResultInfo: {
    flex: 1,
  },
  movieYear: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 10,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 30,
  },
  selectedList: {
    gap: 10,
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  movieYearSmall: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    fontSize: 22,
    color: colors.primary,
    fontWeight: '600',
    paddingHorizontal: 10,
  },
  radiusContainer: {
    marginTop: 20,
  },
  radiusValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  radiusLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  radiusInfo: {
    backgroundColor: colors.card,
    padding: 15,
    borderRadius: 12,
    marginTop: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radiusInfoText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default PreferencesScreen;
