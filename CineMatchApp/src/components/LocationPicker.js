/**
 * 📍 Componente de Selección de Ubicación GPS
 * Obtiene la ubicación actual del usuario usando GPS del dispositivo
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import locationService from '../services/locationService';

const LocationPicker = ({ onLocationSelected, onLocationChange }) => {
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  /**
   * Usar ubicación actual del GPS
   */
  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      const location = await locationService.getCurrentLocation();
      
      setSelectedLocation(location);
      if (onLocationSelected) onLocationSelected(location);
      if (onLocationChange) onLocationChange(location);
      
      Alert.alert(
        '✅ Ubicación obtenida',
        `${location.city}, ${location.country}`
      );
    } catch (error) {
      Alert.alert(
        'Error de GPS',
        error.message || 'No se pudo obtener tu ubicación. Verifica que hayas dado permisos de ubicación en la configuración de tu dispositivo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botón: Usar ubicación actual */}
      <TouchableOpacity
        style={[styles.gpsButton, loading && styles.buttonDisabled]}
        onPress={handleUseCurrentLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <>
            <Text style={styles.gpsButtonIcon}>📍</Text>
            <Text style={styles.gpsButtonText}>
              Usar mi ubicación actual (GPS)
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e50914" />
          <Text style={styles.loadingText}>Obteniendo ubicación GPS...</Text>
        </View>
      )}

      {/* Ubicación seleccionada */}
      {selectedLocation && !loading && (
        <View style={styles.selectedLocationContainer}>
          <Text style={styles.selectedLocationIcon}>✅</Text>
          <View style={styles.selectedLocationInfo}>
            <Text style={styles.selectedLocationTitle}>Ubicación obtenida:</Text>
            <Text style={styles.selectedLocationText}>
              {selectedLocation.city}, {selectedLocation.country}
            </Text>
            <Text style={styles.selectedLocationCoords}>
              📍 {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 22,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gpsButtonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  gpsButtonText: {
    color: '#000',
    fontSize: 17,
    fontWeight: '800',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 14,
    color: '#BDBDBD',
    fontSize: 15,
    fontWeight: '600',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(84,230,157,0.15)',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#54E69D',
  },
  selectedLocationIcon: {
    fontSize: 34,
    marginRight: 16,
  },
  selectedLocationInfo: {
    flex: 1,
  },
  selectedLocationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#54E69D',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  selectedLocationText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 7,
  },
  selectedLocationCoords: {
    fontSize: 12,
    color: '#BDBDBD',
    fontFamily: 'monospace',
  },
});

export default LocationPicker;
