# ✅ Checklist Rápido: Railway → APK

## 🎯 **Lo que necesitas ahora mismo:**

### 📍 **PASO 1: Obtén tu URL de Railway**
Cuando despliegas Laravel en Railway, te da una URL como:
```
https://cinematch-production-abc123.up.railway.app
```

**¿Ya la tienes?** ☐ Sí / ☐ No

---

### 📝 **PASO 2: Configurar el archivo `.env`**

1. Abre: `CineMatchApp/.env`
2. Encuentra esta línea:
   ```bash
   # EXPO_PUBLIC_API_URL=https://tu-proyecto-laravel-production.up.railway.app/api
   ```
3. **Descomenta** y **reemplaza** con tu URL de Railway:
   ```bash
   EXPO_PUBLIC_API_URL=https://TU-URL-DE-RAILWAY.up.railway.app/api
   ```

**⚠️ IMPORTANTE**: 
- Quita el `#` del inicio
- Agrega `/api` al final
- Usa `https://`

**Ejemplo real**:
```bash
EXPO_PUBLIC_API_URL=https://cinematch-production-a1b2.up.railway.app/api
```

**¿Configurado?** ☐ Sí

---

### 🔧 **PASO 3: Configurar Laravel en Railway**

En el dashboard de Railway, ve a tu proyecto Laravel y agrega estas variables:

```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://TU-URL-DE-RAILWAY.up.railway.app

# Si usas MySQL:
DB_CONNECTION=mysql
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=TU_PASSWORD

# Si usas PostgreSQL:
# DB_CONNECTION=pgsql
# DB_HOST=containers-us-west-xxx.railway.app
# DB_PORT=5432
# DB_DATABASE=railway
# DB_USERNAME=postgres
# DB_PASSWORD=TU_PASSWORD

# PayPal (opcional por ahora)
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_SECRET=tu_secret
PAYPAL_ENV=sandbox
```

**¿Configurado?** ☐ Sí

---

### 🧪 **PASO 4: Probar la conexión**

1. **Detén Metro bundler** (Ctrl+C en la terminal donde corre)
2. **Inicia de nuevo con caché limpia**:
   ```bash
   cd CineMatchApp
   npx expo start --clear
   ```
3. **Revisa la consola**, deberías ver:
   ```
   📡 API Config: Usando URL de .env: https://tu-proyecto-railway.up.railway.app/api
   🚀 API Base URL configurada: https://tu-proyecto-railway.up.railway.app/api
   ```
4. **Abre la app** en Expo Go
5. **Intenta iniciar sesión**

**¿Funciona el login?** ☐ Sí / ☐ No

Si NO funciona:
- Verifica que la URL en `.env` sea correcta
- Verifica que Railway esté ejecutándose
- Revisa los logs de Railway

---

### 📱 **PASO 5: Generar la APK**

Una vez que **confirmes** que la app se conecta correctamente:

```bash
# 1. Autenticarse con Expo
eas login

# 2. Generar APK de prueba (recomendado primero)
eas build --platform android --profile preview

# 3. Cuando te pregunte por un proyecto:
# - Si no tienes: "Create a new project"
# - Si ya tienes: Selecciona tu proyecto
```

Esto tomará **10-15 minutos**. Al terminar:
- Recibirás un **link para descargar el APK**
- Descárgalo en tu teléfono Android
- Instálalo (permitir instalar de fuentes desconocidas)
- ¡Listo! La app funcionará sin Metro bundler

**¿APK generado?** ☐ Sí

---

## 🐛 **Solución Rápida de Problemas**

### ❌ "Network request failed"
```bash
# Verifica que la URL en .env sea correcta:
EXPO_PUBLIC_API_URL=https://TU-URL.up.railway.app/api
                                                    ^^^^
                     # No olvides /api al final    
```

### ❌ "CORS policy"
En Railway, agrega esta variable:
```bash
APP_URL=https://TU-URL-DE-RAILWAY.up.railway.app
```

Y asegúrate de que `config/cors.php` en Laravel tenga:
```php
'allowed_origins' => ['*'],
```

### ❌ La app sigue usando localhost
```bash
# 1. Cierra Metro bundler (Ctrl+C)
# 2. Limpia caché:
npx expo start --clear
# 3. Verifica los logs en la consola
```

---

## 🎯 **TU SIGUIENTE ACCIÓN**

**👉 Comparte tu URL de Railway** y te ayudo a configurarla paso a paso.

Ejemplo: `https://cinematch-production-a1b2.up.railway.app`

Una vez que la tengas, solo necesitarás:
1. Pegar la URL en `.env`
2. Reiniciar la app
3. Probar que funciona
4. Generar la APK

**Total: 10 minutos** ⏱️
