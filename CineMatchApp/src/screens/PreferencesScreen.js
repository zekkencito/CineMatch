import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Slider from '@react-native-community/slider';
// Importación condicional de react-native-maps (solo iOS/Android)
let MapView, Circle, Marker;
if (Platform.OS !== 'web') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Circle = maps.Circle;
  Marker = maps.Marker;
}
import * as Location from 'expo-location';
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
  
  // Radio de búsqueda y ubicación
  const [searchRadius, setSearchRadius] = useState(50);
  const [userLocation, setUserLocation] = useState(null);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const mapRef = useRef(null);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadPreferences();
    
    // Animar entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Actualizar región del mapa cuando cambie el radio o la ubicación
  useEffect(() => {
    if (mapRef.current && userLocation && searchRadius > 0) {
      try {
        // Calcular delta con límites seguros (mínimo 0.01, máximo 10)
        const delta = Math.max(0.01, Math.min(10, searchRadius / 111));
        
        const region = {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: delta,
          longitudeDelta: delta,
        };
        
        mapRef.current.animateToRegion(region, 500);
      } catch (error) {
        console.error('Error animando el mapa de la región:', error);
      }
    }
  }, [searchRadius, userLocation]);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      
      // Cargar géneros de TMDB
      const genres = await tmdbMovieService.getGenres();
      console.log(`📚 Géneros cargados: ${genres.length}`, genres.map(g => g.name).join(', '));
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
        // Soportar tanto 'radius' como 'search_radius' del backend
        setSearchRadius(location?.radius || location?.search_radius || 50);
        
        // Guardar ubicación para el mapa
        if (location?.latitude && location?.longitude) {
          const lat = parseFloat(location.latitude);
          const lng = parseFloat(location.longitude);
          
          // Validar que sean coordenadas válidas
          if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            setUserLocation({
              latitude: lat,
              longitude: lng,
              city: location.city || '',
              country: location.country || '',
            });
          } else {
            console.warn('Coordenadas inválidas:', location.latitude, location.longitude);
          }
        }
      }
    } catch (error) {
      console.error('Error cargando preferencias:', error);
      Alert.alert('Error', 'No se pudieron cargar las preferencias');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar ubicación desde GPS
  const updateLocationFromGPS = async () => {
    try {
      setUpdatingLocation(true);
      
      // Solicitar permisos de ubicación
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permisos denegados',
          'Se necesitan permisos de ubicación para actualizar tu posición'
        );
        return;
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Obtener ciudad y país usando geocoding inverso
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const city = geocode[0]?.city || geocode[0]?.subregion || '';
      const country = geocode[0]?.country || '';

      // Actualizar estado local
      setUserLocation({
        latitude,
        longitude,
        city,
        country,
      });

      // Guardar al backend
      try {
        await preferenceService.updateLocation({
          latitude,
          longitude,
          city,
          country,
        });
        
        Alert.alert('✓ Ubicación actualizada', `${city}, ${country}`);
      } catch (error) {
        console.error('Error guardando ubicación:', error);
        Alert.alert('Advertencia', 'Ubicación actualizada localmente pero no se pudo guardar en el servidor');
      }
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Verifica que el GPS esté activado.');
    } finally {
      setUpdatingLocation(false);
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
      console.error('Error encontrando directores:', error);
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
      console.error('Error buscando películas:', error);
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
      
      // Preparar datos para enviar al backend (solo id y title válidos)
      const moviesToSync = watchedMovies
        .filter(m => m.id && m.title) // Filtrar películas sin id o title
        .map(m => ({
          id: parseInt(m.id), // Asegurar que id sea número
          title: String(m.title).substring(0, 200), // Truncar a 200 caracteres
          rating: m.rating ? parseInt(m.rating) : null,
        }));
      
      const directorsToSync = selectedDirectors.map(d => ({
        id: d.id,
        name: d.name,
      }));
      
      console.log('🎬 Sincronizando películas:', moviesToSync.length, 'películas');
      
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
      console.error('Error guardando tus preferencias:', error);
      console.error('Error en respuesta:', error.response?.data);
      
      let errorMessage = 'No se pudieron guardar las preferencias';
      
      if (error.response?.status === 422) {
        errorMessage = 'Error de validación: ' + 
          (error.response.data?.message || 'Verifica que todos los campos sean correctos');
        console.error('Validation errors:', error.response.data?.errors);
      }
      
      Alert.alert('Error', errorMessage);
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
        <Text style={styles.tabEmoji}>🎭</Text>
        <Text style={[styles.tabText, activeTab === 'genres' && styles.activeTabText]}>
          Géneros
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'directors' && styles.activeTab]}
        onPress={() => setActiveTab('directors')}
      >
        <Text style={styles.tabEmoji}>🎬</Text>
        <Text style={[styles.tabText, activeTab === 'directors' && styles.activeTabText]}>
          Directores
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'movies' && styles.activeTab]}
        onPress={() => setActiveTab('movies')}
      >
        <Text style={styles.tabEmoji}>🍿</Text>
        <Text style={[styles.tabText, activeTab === 'movies' && styles.activeTabText]}>
          Películas
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.tab, activeTab === 'radius' && styles.activeTab]}
        onPress={() => setActiveTab('radius')}
      >
        <Text style={styles.tabEmoji}>📍</Text>
        <Text style={[styles.tabText, activeTab === 'radius' && styles.activeTabText]}>
          Distancia
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
  const renderRadius = () => {
    const getRadiusCategory = () => {
      if (searchRadius <= 10) return { emoji: '🏠', text: 'Muy cerca', desc: 'Solo tu vecindario' };
      if (searchRadius <= 20) return { emoji: '🚶', text: 'Cerca', desc: 'Tu ciudad' };
      if (searchRadius <= 35) return { emoji: '🚗', text: 'Normal', desc: 'Área urbana' };
      return { emoji: '🚄', text: 'Lejos', desc: 'Ciudades cercanas' };
    };
    
    const category = getRadiusCategory();
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>Distancia de búsqueda</Text>
        <Text style={styles.sectionSubtitle}>
          El área amarilla muestra hasta dónde buscarás movie buddies
        </Text>
        
        {userLocation ? (
          <View style={styles.mapContainer}>
            {Platform.OS === 'web' ? (
              // Fallback para web - mostrar vista estática
              <View style={styles.webMapPlaceholder}>
                <View style={styles.webMapContent}>
                  <Text style={styles.webMapEmoji}>🗺️</Text>
                  <Text style={styles.webMapTitle}>Mapa no disponible en web</Text>
                  <Text style={styles.webMapText}>
                    El mapa interactivo solo está disponible en la app móvil
                  </Text>
                  <View style={styles.webMapInfo}>
                    <Text style={styles.webMapInfoText}>📍 {userLocation.city || 'Tu ubicación'}</Text>
                    <Text style={styles.webMapInfoText}>🎯 Radio: {searchRadius} km</Text>
                  </View>
                </View>
              </View>
            ) : (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: Math.max(0.01, Math.min(10, searchRadius / 111)),
                  longitudeDelta: Math.max(0.01, Math.min(10, searchRadius / 111)),
                }}
                mapType="standard"
                showsUserLocation={false}
                showsMyLocationButton={false}
                zoomEnabled={true}
                scrollEnabled={true}
              >
                {/* Marcador de ubicación del usuario */}
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="Tu ubicación"
                  description={`${userLocation.city || 'Tu ciudad'}, ${userLocation.country || 'Tu país'}`}
                >
                  <View style={styles.markerContainer}>
                    <Text style={styles.markerEmoji}>📍</Text>
                  </View>
                </Marker>
                
                {/* Círculo del radio de búsqueda */}
                <Circle
                  center={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  radius={searchRadius * 1000} // Convertir km a metros
                  fillColor="rgba(255, 215, 0, 0.2)" // Amarillo con transparencia
                  strokeColor={colors.primary}
                  strokeWidth={3}
                />
              </MapView>
            )}
            
            {/* Indicador de distancia sobre el mapa */}
            <View style={styles.mapOverlay}>
              <View style={styles.mapBadge}>
                <Text style={styles.mapBadgeEmoji}>{category.emoji}</Text>
                <Text style={styles.mapBadgeText}>{searchRadius} km</Text>
              </View>
              
              {/* Botón para actualizar ubicación GPS */}
              <TouchableOpacity
                style={styles.gpsButton}
                onPress={updateLocationFromGPS}
                disabled={updatingLocation}
              >
                {updatingLocation ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <Text style={styles.gpsButtonText}>📍 Actualizar GPS</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.noLocationBox}>
            <Text style={styles.noLocationEmoji}>📍</Text>
            <Text style={styles.noLocationText}>No se ha detectado tu ubicación</Text>
            <Text style={styles.noLocationSubtext}>
              Asegúrate de haber dado permisos de ubicación al registrarte
            </Text>
            
            {/* Botón para obtener ubicación */}
            <TouchableOpacity
              style={styles.updateLocationButton}
              onPress={updateLocationFromGPS}
              disabled={updatingLocation}
            >
              {updatingLocation ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <>
                  <Text style={styles.updateLocationButtonText}>Obtener Ubicación</Text>
                  <Text style={styles.updateLocationButtonEmoji}>🌍</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
        
        <View style={styles.radiusControlBox}>
          <Text style={styles.radiusControlLabel}>Ajusta tu radio de búsqueda</Text>
          
          <Slider
            style={styles.slider}
            minimumValue={5}
            maximumValue={50}
            step={5}
            value={searchRadius}
            onValueChange={setSearchRadius}
            minimumTrackTintColor={colors.primary}
            maximumTrackTintColor={colors.border}
            thumbTintColor={colors.primary}
          />
          
          <View style={styles.radiusLabels}>
            <Text style={styles.radiusLabel}>5 km</Text>
            <Text style={styles.radiusLabel}>25 km</Text>
            <Text style={styles.radiusLabel}>50 km</Text>
          </View>
          
          <View style={styles.radiusCategoryBanner}>
            <Text style={styles.radiusCategoryEmoji}>{category.emoji}</Text>
            <View>
              <Text style={styles.radiusCategoryTitle}>{category.text}</Text>
              <Text style={styles.radiusCategoryDesc}>{category.desc}</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.radiusInfoCard}>
          <View style={styles.radiusInfoHeader}>
            <Text style={styles.radiusInfoIcon}>💡</Text>
            <Text style={styles.radiusInfoTitle}>Mapa gratuito sin límites</Text>
          </View>
          <Text style={styles.radiusInfoText}>
            El área amarilla en el mapa muestra exactamente hasta dónde buscaremos personas que compartan tus gustos.
          </Text>
          <Text style={styles.radiusInfoSubtext}>
            ✓ Mapa basado en OpenStreetMap (gratis)
            {"\n"}✓ Sin límite de uso
            {"\n"}✓ Cálculos de distancia precisos
            {"\n"}✓ Tu privacidad está protegida
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.loadingContainer}
      >
        <Text style={styles.loadingEmoji}>🎬</Text>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Cargando preferencias...</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.headerGradient}
      >
        <Animated.View 
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          
          <View style={styles.headerIconBox}>
            <Text style={styles.headerIcon}>⚙️</Text>
          </View>
          <Text style={styles.headerTitle}>
            {isInitialSetup ? 'Configura tus preferencias' : 'Mis Preferencias'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isInitialSetup 
              ? 'Para encontrar mejores movie buddies' 
              : 'Edita tus gustos de películas'}
          </Text>
        </Animated.View>
      </LinearGradient>

      {renderTabs()}

      <LinearGradient
        colors={[colors.secondary, colors.secondaryLight]}
        style={styles.scrollViewGradient}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'genres' && renderGenres()}
          {activeTab === 'directors' && renderDirectors()}
          {activeTab === 'movies' && renderMovies()}
          {activeTab === 'radius' && renderRadius()}
        </ScrollView>
      </LinearGradient>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={savePreferences}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.textDark} />
          ) : (
            <>
              <Text style={styles.saveButtonText}>
                {isInitialSetup ? 'Continuar' : 'Guardar cambios'}
              </Text>
              <Text style={styles.saveButtonIcon}>→</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 15,
    color: colors.textSecondary,
    fontSize: 16,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    padding: 20,
    paddingTop: 0,
    alignItems: 'center',
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
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  tabEmoji: {
    fontSize: 20,
  },
  tabText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '800',
  },
  scrollViewGradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  genreChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.border,
  },
  genreChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  genreChipText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '600',
  },
  genreChipTextSelected: {
    color: colors.textDark,
    fontWeight: '800',
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 2,
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
    borderRadius: 14,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
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
    borderWidth: 2,
    borderColor: colors.primary,
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
    color: colors.textDark,
    fontSize: 18,
    fontWeight: '900',
  },
  moviePoster: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.border,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  moviePosterPlaceholder: {
    width: 60,
    height: 90,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 2,
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
    fontWeight: '600',
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
    fontWeight: '700',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 10,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: 30,
    fontStyle: 'italic',
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
    borderWidth: 2,
    borderColor: colors.border,
  },
  selectedItemText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  movieYearSmall: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    fontSize: 24,
    color: colors.accent,
    fontWeight: '700',
    paddingHorizontal: 10,
  },
  mapContainer: {
    height: 400,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  webMapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.card,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  webMapContent: {
    alignItems: 'center',
    gap: 12,
  },
  webMapEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  webMapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  webMapText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  webMapInfo: {
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  webMapInfoText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    right: 16,
    gap: 12,
  },
  mapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  mapBadgeEmoji: {
    fontSize: 24,
  },
  mapBadgeText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textDark,
    letterSpacing: 0.5,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.primary,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    minHeight: 44,
  },
  gpsButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerEmoji: {
    fontSize: 40,
  },
  noLocationBox: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border,
  },
  noLocationEmoji: {
    fontSize: 60,
    marginBottom: 16,
  },
  noLocationText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  noLocationSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  updateLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
    minHeight: 50,
  },
  updateLocationButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
  },
  updateLocationButtonEmoji: {
    fontSize: 20,
  },
  radiusControlBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radiusControlLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  radiusLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  radiusCategoryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  radiusCategoryEmoji: {
    fontSize: 36,
  },
  radiusCategoryTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 2,
  },
  radiusCategoryDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  radiusInfoCard: {
    backgroundColor: colors.card,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radiusInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  radiusInfoIcon: {
    fontSize: 24,
  },
  radiusInfoTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  radiusInfoText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  radiusInfoBold: {
    fontWeight: '800',
    color: colors.primary,
  },
  radiusInfoSubtext: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
    paddingLeft: 8,
  },
  footer: {
    padding: 20,
    backgroundColor: colors.card,
    shadowColor: colors.textDark,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
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
});

export default PreferencesScreen;
