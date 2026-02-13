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

const LocationPicker = ({ onLocationSelected }) => {
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
      onLocationSelected(location);
      
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
    marginVertical: 15,
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e50914',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  gpsButtonIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  gpsButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontSize: 15,
    fontWeight: '500',
  },
  selectedLocationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    padding: 18,
    borderRadius: 12,
    marginTop: 15,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  selectedLocationIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  selectedLocationInfo: {
    flex: 1,
  },
  selectedLocationTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedLocationText: {
    fontSize: 18,
    color: '#000',
    fontWeight: '600',
    marginBottom: 6,
  },
  selectedLocationCoords: {
    fontSize: 13,
    color: '#555',
    fontFamily: 'monospace',
  },
});

export default LocationPicker;
