import * as Location from 'expo-location';

export const locationService = {

  async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  },

  async getCurrentLocation() {
    try {
      // Solicitar permisos primero
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Permisos de ubicación denegados. Ve a Configuración y activa los permisos.');
      }

      // Obtener ubicación actual
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      // Usar reverse geocoding de Expo (no requiere API key)
      let city = 'Ciudad Desconocida';
      let country = 'País Desconocido';
      
      try {
        const addresses = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (addresses && addresses.length > 0) {
          const address = addresses[0];
          city = address.city || address.subregion || address.region || 'Ciudad Desconocida';
          country = address.country || 'País Desconocido';
        }
      } catch (geocodeError) {
        console.warn('No se pudo obtener el nombre de la ciudad:', geocodeError);
        // Continuamos con valores por defecto
      }

      return {
        latitude,
        longitude,
        city,
        country,
        formatted: `${city}, ${country}`,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      throw error;
    }
  },
};

export default locationService;
