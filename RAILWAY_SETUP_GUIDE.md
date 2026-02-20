# 🚀 Guía: Configurar CineMatch para Producción con Railway

## 📋 **Pasos para conectar tu app con Railway**

### 1️⃣ **Obtener la URL de Railway**

Después de desplegar tu Laravel en Railway, deberías tener una URL como:
```
https://cinematch-production-abc123.up.railway.app
```

### 2️⃣ **Configurar variables de entorno en el archivo `.env`**

Abre el archivo `CineMatchApp/.env` y descomenta la línea de Railway:

```bash
# 🚀 DESARROLLO LOCAL (auto-detecta la IP del Metro bundler)
# EXPO_PUBLIC_API_URL=

# 🚂 PRODUCCIÓN - RAILWAY (descomenta y reemplaza con tu URL):
EXPO_PUBLIC_API_URL=https://tu-proyecto-laravel-production.up.railway.app/api
```

**⚠️ IMPORTANTE**: 
- Agrega `/api` al final de la URL
- Debe usar `https://` (Railway proporciona SSL automáticamente)

**Ejemplo real**:
```bash
EXPO_PUBLIC_API_URL=https://cinematch-production-a1b2.up.railway.app/api
```

### 3️⃣ **Configurar CORS en Laravel (Railway)**

En tu proyecto Laravel en Railway, asegúrate de que el archivo `config/cors.php` tenga:

```php
'allowed_origins' => ['*'],  // O especifica tu dominio de la app
'allowed_origins_patterns' => [],
'allowed_headers' => ['*'],
'allowed_methods' => ['*'],
```

### 4️⃣ **Configurar variables de entorno en Railway**

En el panel de Railway, configura estas variables:

```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-proyecto-railway.up.railway.app

DB_CONNECTION=mysql (o postgresql)
DB_HOST=<host de tu base de datos>
DB_PORT=3306
DB_DATABASE=<nombre de tu base de datos>
DB_USERNAME=<usuario>
DB_PASSWORD=<contraseña>

PAYPAL_CLIENT_ID=<tu client id>
PAYPAL_SECRET=<tu secret>
PAYPAL_ENV=production  # Cambia a production cuando uses credenciales reales
```

### 5️⃣ **Probar la conexión**

Antes de generar el APK, prueba que la conexión funciona:

1. Detén el Metro bundler (Ctrl+C)
2. Recarga la app con `npx expo start --clear`
3. Verifica en la consola que veas:
   ```
   📡 API Config: Usando URL de .env: https://tu-proyecto-railway.up.railway.app/api
   ```
4. Inicia sesión en la app para verificar que se conecta correctamente

### 6️⃣ **Generar el APK con EAS Build**

Ya instalaste EAS CLI, ahora:

```bash
# 1. Autenticarte con Expo
eas login

# 2. Configurar el proyecto para builds
eas build:configure

# 3. Generar un APK de prueba (preview)
eas build --platform android --profile preview

# 4. Para producción (cuando esté listo):
eas build --platform android --profile production
```

El proceso tardará unos 10-15 minutos. Al finalizar, recibirás un link para descargar el APK.

---

## 🔄 **Modo Desarrollo vs Producción**

### **Desarrollo Local** (mientras programas):
```bash
# En .env:
EXPO_PUBLIC_API_URL=
# (Deja vacío para auto-detectar tu IP local)
```

### **Producción** (para generar APK):
```bash
# En .env:
EXPO_PUBLIC_API_URL=https://tu-proyecto-railway.up.railway.app/api
```

---

## 🧪 **Verificar que todo funciona**

### Test 1: Verificar URL de la API
Abre la app y revisa la consola de Metro bundler. Deberías ver:
```
🚀 API Base URL configurada: https://tu-proyecto-railway.up.railway.app/api
```

### Test 2: Probar endpoint
Puedes hacer una prueba rápida en el navegador:
```
https://tu-proyecto-railway.up.railway.app/api/
```
Debería devolver algo (no un error 404).

### Test 3: Login en la app
Intenta iniciar sesión. Si funciona, la conexión está correcta.

---

## 📱 **Configuración del archivo app.json**

Asegúrate de tener configurado en `app.json`:

```json
{
  "expo": {
    "name": "CineMatch",
    "slug": "cinematch",
    "version": "1.0.0",
    "android": {
      "package": "com.cinematch.app",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "android.permission.INTERNET",
        "android.permission.ACCESS_NETWORK_STATE"
      ]
    },
    "extra": {
      "eas": {
        "projectId": "tu-project-id-aqui"
      }
    }
  }
}
```

---

## ❓ **Solución de Problemas**

### Error: "Network request failed"
- ✅ Verifica que la URL en `.env` sea correcta
- ✅ Asegúrate de tener `https://` y `/api` al final
- ✅ Comprueba que Railway esté funcionando

### Error: "CORS policy"
- ✅ Configura CORS en Laravel como se indicó arriba
- ✅ Verifica que `APP_URL` en Railway tenga la URL correcta

### La app sigue usando localhost
- ✅ Detén Metro bundler y vuelve a iniciar con `--clear`
- ✅ Verifica que el archivo `.env` esté guardado
- ✅ Revisa los logs en la consola

---

## 🎯 **Siguiente paso: Generar la APK**

Una vez que hayas verificado que la app funciona correctamente con Railway:

1. Asegúrate de que `EXPO_PUBLIC_API_URL` en `.env` apunte a Railway
2. Ejecuta: `eas build --platform android --profile preview`
3. Espera a que termine el build
4. Descarga e instala el APK en tu teléfono
5. ¡Listo! Tu app funcionará sin necesidad de Metro bundler

---

**¿Tienes tu URL de Railway lista?** Compártela y te ayudo a configurarla correctamente. 🚀
