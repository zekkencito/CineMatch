# 📍 Configuración de Ubicación GPS (Solo Expo Location)

## ✅ Sistema Simplificado
- **GPS del Dispositivo**: Usa Expo Location (GRATIS, sin API keys)
- **Sin Google Maps**: No hay costos, no hay límites
- **Reverse Geocoding**: Automático con Expo Location

---

## 🚀 PASO 1: Configurar Permisos

### **app.json** - Agregar permisos de ubicación:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-location",
        {
          "locationAlwaysAndWhenInUsePermission": "CineMatch necesita tu ubicación para encontrar fanáticos del cine cercanos."
        }
      ]
    ],
    "ios": {
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "CineMatch usa tu ubicación para encontrar personas con gustos similares en películas cerca de ti."
      }
    },
    "android": {
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION"
      ]
    }
  }
}
```

---

## 📱 PASO 2: Integrar en RegisterScreen

### **Importar el componente:**

```javascript
import LocationPicker from '../components/LocationPicker';
```

### **Agregar estado:**

```javascript
const [locationData, setLocationData] = useState(null);
```

### **Agregar el componente en el JSX:**

```javascript
<LocationPicker
  onLocationSelected={(location) => {
    setLocationData(location);
    console.log('Ubicación seleccionada:', location);
    // location tiene: { latitude, longitude, city, country, formatted }
  }}
/>
```

### **Validar antes de registrar:**

```javascript
const handleRegister = async () => {
  // Validar que haya seleccionado ubicación
  if (!locationData) {
    Alert.alert('Error', 'Por favor obtén tu ubicación GPS');
    return;
  }

  // Preparar datos
  const userData = {
    name: nombre,
    email: email,
    password: password,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    city: locationData.city,
    country: locationData.country,
  };

  // Registrar usuario
  try {
    const response = await authService.register(userData);
    Alert.alert('✅ Registro exitoso', 'Bienvenido a CineMatch');
    navigation.navigate('Home');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};
```

---

## 🔧 PASO 3: Actualizar Laravel (AuthController)

### **laravel/app/Http/Controllers/AuthController.php**

```php
public function register(Request $request)
{
    $validator = Validator::make($request->all(), [
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8',
        'latitude' => 'required|numeric|between:-90,90',
        'longitude' => 'required|numeric|between:-180,180',
        'city' => 'nullable|string|max:255',
        'country' => 'nullable|string|max:255',
    ]);

    if ($validator->fails()) {
        return response()->json([
            'success' => false,
            'errors' => $validator->errors()
        ], 422);
    }

    // Crear usuario
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
    ]);

    // Crear ubicación
    $user->location()->create([
        'latitude' => $request->latitude,
        'longitude' => $request->longitude,
        'city' => $request->city ?? 'Unknown',
        'country' => $request->country ?? 'Unknown',
        'search_radius' => 2000, // 2000km por defecto
    ]);

    // Generar token
    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'success' => true,
        'user' => $user,
        'token' => $token,
    ]);
}
```

---

## 🧪 PASO 4: Probar el Sistema GPS

### **1. Construir y Correr la App:**

```bash
cd CineMatchApp
npx expo run:android
# o
npx expo run:ios
```

### **2. Ir a RegisterScreen:**
- Presiona el botón "📍 Usar mi ubicación actual (GPS)"
- Acepta permisos de ubicación
- Deberías ver: "✅ Ubicación obtenida: [Tu Ciudad], [Tu País]"
- Las coordenadas aparecen abajo

### **3. Registrar Usuario:**
- Llena nombre, email, password
- Asegúrate de que LocationPicker muestre ubicación ✅
- Presiona "Registrar"
- Revisa en la base de datos que se guardaron lat/lon

### **4. Verificar en Base de Datos:**

```sql
SELECT 
    u.name, 
    l.city, 
    l.country, 
    l.latitude, 
    l.longitude,
    l.search_radius
FROM users u
JOIN locations l ON u.id = l.user_id
ORDER BY u.created_at DESC
LIMIT 5;
```

---

## 🎯 Ventajas del Sistema GPS

✅ **Gratis**: No hay costos de APIs  
✅ **Sin límites**: Ilimitadas peticiones  
✅ **Preciso**: Usa GPS real del dispositivo  
✅ **Simple**: Sin API keys que configurar  
✅ **Funciona offline**: Coordenadas siempre disponibles  
✅ **Reverse geocoding incluido**: Nombres de ciudades automáticos  

---

## 📂 Archivos Creados/Modificados

```
CineMatchApp/
├── src/
│   ├── components/
│   │   └── LocationPicker.js      ← Componente GPS simplificado
│   ├── services/
│   │   └── locationService.js     ← Solo Expo Location
│   └── screens/
│       └── RegisterScreen.js      ← Agregar LocationPicker aquí
└── app.json                       ← Agregar permisos de ubicación
```

---

## 🔍 Troubleshooting

### **"Location permission denied"**
- Ve a Configuración del dispositivo
- Busca CineMatch
- Activa permisos de ubicación

### **"No se pudo obtener ciudad"**
- Las coordenadas se obtienen de todas formas
- La ciudad se intenta obtener pero no es crítica
- Si falla, mostrará "Ciudad Desconocida"

### **Coordenadas incorrectas en emulador**
- Android Emulator: Usa ubicación simulada
- iOS Simulator: Configura ubicación en Features > Location
- Para probar real: Usa dispositivo físico

---

## 🎉 ¡Listo!

Ahora tu app usa GPS directo sin complicaciones ni costos adicionales.

**Siguiente paso**: Integrar TMDB para preferencias de películas.
