# 📍 Sistema de Ubicación - Guía Completa

## 🎯 ¿Qué hace este sistema?

Cuando el usuario se registra, puede elegir su ubicación de 2 formas:

1. **📱 Usar GPS del celular** → Obtiene lat/lon automáticamente
2. **🔍 Buscar manualmente** → Escribe "Polanco, CDMX" → Google convierte a lat/lon

**Resultado:** Se guarda en Laravel: `latitude`, `longitude`, `city`, `country`

---

## 📁 Archivos Creados

### 1. `src/config/googlePlaces.js`
**Configuración de Google Places API**

```javascript
export const GOOGLE_PLACES_API_KEY = 'TU_API_KEY_AQUI'; // 👈 PEGA TU KEY AQUÍ
```

**Cómo obtener la key:**
1. Ve a: https://console.cloud.google.com/
2. Crea un proyecto
3. Habilita APIs:
   - Places API
   - Geocoding API
4. Credentials → Create API Key
5. **IMPORTANTE**: Restringe la key por aplicación

**Pricing:** $200 USD gratis/mes, después:
- Autocompletar: $2.83 por 1000 requests
- Geocoding: $5 por 1000 requests

---

### 2. `src/services/locationService.js`
**Servicio con todas las funciones**

```javascript
import locationService from '../services/locationService';

// Opción 1: Usar GPS del dispositivo
const location = await locationService.getCurrentLocation();
// Devuelve: { latitude, longitude, city, country, fullAddress }

// Opción 2: Autocompletar mientras escribe
const suggestions = await locationService.autocomplete('Polanco');
// Devuelve: [{ place_id, description, main_text, secondary_text }, ...]

// Opción 3: Obtener coordenadas de un lugar
const location = await locationService.getPlaceDetails(place_id);
// Devuelve: { latitude, longitude, city, country, formatted }

// Opción 4: Convertir dirección a coordenadas
const location = await locationService.geocodeAddress('Polanco, CDMX, México');
// Devuelve: { latitude, longitude, city, country, formatted }

// Reverse: Convertir coordenadas a dirección
const address = await locationService.reverseGeocode(19.4326, -99.1332);
// Devuelve: { city, country, formatted, components }
```

---

### 3. `src/components/LocationPicker.js`
**Componente visual completo**

```javascript
import LocationPicker from '../components/LocationPicker';

<LocationPicker 
  onLocationSelected={(location) => {
    console.log('Location:', location);
    // location = { latitude, longitude, city, country, formatted }
  }}
/>
```

**El componente muestra:**
- ✅ Botón "Usar mi ubicación actual" (GPS)
- ✅ Input de búsqueda con autocompletar
- ✅ Lista de sugerencias mientras escribe
- ✅ Ubicación seleccionada con coordenadas

---

## 🔧 Cómo Usarlo en RegisterScreen

### Opción A: Agregar al registro actual

```javascript
import React, { useState } from 'react';
import LocationPicker from '../components/LocationPicker';
import { authService } from '../services/authService';

const RegisterScreen = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    bio: '',
    // Nuevos campos para ubicación
    latitude: null,
    longitude: null,
    city: '',
    country: '',
  });

  const handleLocationSelected = (location) => {
    setFormData({
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude,
      city: location.city,
      country: location.country,
    });
  };

  const handleRegister = async () => {
    // Validar que tenga ubicación
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Error', 'Debes seleccionar tu ubicación');
      return;
    }

    try {
      await authService.register(formData);
      // Continuar con el flujo...
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView>
      {/* Campos existentes: name, email, password, age, bio */}
      
      {/* Agregar LocationPicker */}
      <Text style={styles.label}>📍 Tu Ubicación</Text>
      <LocationPicker onLocationSelected={handleLocationSelected} />
      
      <Button title="Registrar" onPress={handleRegister} />
    </ScrollView>
  );
};
```

---

### Opción B: Agregar como paso separado (wizard)

```javascript
const RegisterScreen = () => {
  const [step, setStep] = useState(1); // 1: datos, 2: ubicación, 3: preferencias
  
  // Step 1: Nombre, email, password
  // Step 2: Ubicación con LocationPicker
  // Step 3: Géneros favoritos, etc
};
```

---

## 🗄️ Laravel: Actualizar AuthController

El backend ya está listo, pero asegúrate de que reciba los campos:

```php
// app/Http/Controllers/AuthController.php

public function register(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|unique:users',
        'password' => 'required|string|min:6',
        'age' => 'nullable|integer',
        'bio' => 'nullable|string',
        
        // Validación de ubicación
        'latitude' => 'required|numeric|between:-90,90',
        'longitude' => 'required|numeric|between:-180,180',
        'city' => 'nullable|string',
        'country' => 'nullable|string',
    ]);

    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'age' => $request->age,
        'bio' => $request->bio,
    ]);

    // Crear ubicación
    $user->location()->create([
        'latitude' => $request->latitude,
        'longitude' => $request->longitude,
        'city' => $request->city,
        'country' => $request->country,
        'search_radius' => 50, // Default 50km
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'user' => $user,
        'token' => $token,
    ]);
}
```

---

## 📱 Permisos en app.json

Asegúrate de tener los permisos en `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "Allow CineMatch to use your location to find nearby movie fans."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "CineMatch needs your location to find movie fans nearby.",
        "NSLocationAlwaysUsageDescription": "CineMatch needs your location to find movie fans nearby."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION"
      ]
    }
  }
}
```

---

## 🎯 Flujo Completo

### 1. Usuario se registra
```
RegisterScreen 
  → Llena nombre, email, password
  → Selecciona ubicación con LocationPicker
     - Opción A: Click "Usar mi ubicación actual"
       → Pide permisos
       → Obtiene GPS: lat=19.4326, lon=-99.1332
       → Reverse geocode: "Polanco, México"
     
     - Opción B: Escribe "Polanco"
       → Google autocomplete muestra opciones
       → Usuario selecciona "Polanco, CDMX, México"
       → Google devuelve: lat=19.4326, lon=-99.1332
  
  → Click "Registrar"
  → Envía a Laravel: { name, email, password, latitude, longitude, city, country }
```

### 2. Laravel guarda
```
users table:
  - id, name, email, password, age, bio

locations table:
  - user_id, latitude, longitude, city, country, search_radius
```

### 3. Usuario configura radio
```
ProfileScreen/SettingsScreen
  → Slider: 5km - 500km
  → Guarda en locations.search_radius
```

### 4. Sistema filtra usuarios
```
Laravel UserController
  → Obtiene users con location
  → Calcula distancia con Haversine
  → Filtra por search_radius
  → Devuelve usuarios cercanos
```

---

## 🔑 Resumen de API Keys Necesarias

1. **TMDB API** (películas):
   - Archivo: `src/config/tmdb.js`
   - Obtener: https://www.themoviedb.org/settings/api
   - Gratis ilimitado

2. **Google Places API** (ubicación):
   - Archivo: `src/config/googlePlaces.js`
   - Obtener: https://console.cloud.google.com/
   - $200 USD/mes gratis

---

## ✅ Checklist

- [ ] Instalar expo-location: `npx expo install expo-location` ✅ HECHO
- [ ] Obtener Google Places API key
- [ ] Pegar key en `src/config/googlePlaces.js`
- [ ] Agregar permisos en `app.json`
- [ ] Integrar `LocationPicker` en `RegisterScreen`
- [ ] Actualizar `AuthController` en Laravel
- [ ] Probar registro con ubicación GPS
- [ ] Probar registro con búsqueda manual

---

## 🧪 Pruebas

```bash
# Terminal 1: Laravel
cd laravel
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2: React Native
cd CineMatchApp
npx expo start

# En el emulador:
1. Abre la app
2. Ve a Register
3. Llena los campos
4. Click "Usar mi ubicación actual"
   → Debe pedir permisos
   → Debe mostrar: "Polanco, México" (o tu ubicación)
5. O escribe "Condesa" en la búsqueda
   → Debe mostrar sugerencias
   → Selecciona una
   → Debe mostrar coordenadas
6. Click "Registrar"
   → Debe crear usuario con ubicación en DB
```

¡Todo listo! 🎬 Solo falta que pegues tu Google Places API key.
