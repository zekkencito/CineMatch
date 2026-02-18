# Guía Rápida: Generar APK de CineMatch

## 🚀 Inicio Rápido

### Opción 1: APK de Desarrollo (Recomendado para pruebas)

```powershell
# Desde el directorio CineMatchApp
.\build-apk.ps1 debug
```

El APK se generará en: `CineMatch-debug.apk`

### Opción 2: APK de Producción

**Primera vez:**

1. Genera el keystore:
   ```powershell
   .\generate-keystore.ps1
   ```

2. Genera el APK:
   ```powershell
   .\build-apk.ps1 release
   ```

El APK se generará en: `CineMatch-release.apk`

---

## 📋 Requisitos Previos

- ✅ Node.js instalado
- ✅ Java JDK 17+ instalado
- ✅ Android SDK configurado
- ✅ Dependencias npm instaladas (`npm install`)

---

## 🔧 Comandos Disponibles

### Generar APKs

```powershell
# APK de debug (para pruebas)
.\build-apk.ps1 debug

# APK de release (para distribución)
.\build-apk.ps1 release

# Generar keystore para release (solo primera vez)
.\generate-keystore.ps1
```

### Comandos Manuales (Gradle)

```powershell
# Limpiar build
cd android
.\gradlew.bat clean

# Debug APK
.\gradlew.bat assembleDebug

# Release APK
.\gradlew.bat assembleRelease

# Android App Bundle (para Google Play)
.\gradlew.bat bundleRelease
```

---

## 📱 Instalar APK en Dispositivo

### Método 1: USB (adb)

```powershell
# Conecta tu dispositivo Android por USB
# Habilita "Depuración USB" en opciones de desarrollador

adb install CineMatch-debug.apk
```

### Método 2: Transferencia Directa

1. Copia el archivo `CineMatch-debug.apk` a tu dispositivo
2. Ábrelo desde el administrador de archivos
3. Permite instalar desde "Fuentes desconocidas" si es necesario
4. Instala la aplicación

---

## 🔐 Keystore de Producción

### ⚠️ Importante

- **NUNCA** pierdas tu keystore o contraseñas
- **NUNCA** subas el keystore a Git
- **GUARDA** copias de seguridad en lugar seguro
- Si pierdes el keystore, no podrás actualizar tu app en Google Play

### Ubicación del Keystore

```
CineMatchApp/
  android/
    app/
      cinematch-release-key.keystore  ← Tu keystore
```

### Credenciales

Las credenciales se configuran en `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=cinematch-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=cinematch-key-alias
MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña
MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña
```

---

## 📊 Tamaños Típicos de APK

- **Debug APK**: 40-60 MB (sin optimizaciones)
- **Release APK**: 25-40 MB (optimizado)
- **Release APK con splits**: 15-25 MB por ABI

---

## 🐛 Solución de Problemas

### "SDK location not found"

Crea `android/local.properties`:
```properties
sdk.dir=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk
```

### "Execution failed for task ':app:packageDebug'"

Limpia el build:
```powershell
cd android
.\gradlew.bat clean
cd ..
```

### "Could not find expo CLI"

```powershell
npm install
```

### Error de memoria de Gradle

Edita `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### APK no se instala en el dispositivo

1. Desinstala la versión anterior
2. Verifica que el APK esté firmado correctamente
3. Habilita "Instalar desde fuentes desconocidas"

---

## 📦 Tipos de Build

### Debug
- **Propósito**: Desarrollo y pruebas
- **Firmado**: Con keystore de debug (automático)
- **Optimización**: Sin optimizaciones
- **Tamaño**: Más grande
- **Performance**: Más lento

### Release
- **Propósito**: Distribución y producción
- **Firmado**: Con keystore de release (manual)
- **Optimización**: ProGuard/R8 habilitado
- **Tamaño**: Optimizado
- **Performance**: Optimizado

### Profile
- **Propósito**: Pruebas de rendimiento
- **Firmado**: Con keystore de debug
- **Optimización**: Similar a release
- **Tamaño**: Optimizado
- **Performance**: Optimizado + herramientas de profiling

---

## 🚢 Publicar en Google Play Store

### 1. Genera un Android App Bundle (AAB)

```powershell
cd android
.\gradlew.bat bundleRelease
```

El AAB se genera en: `android/app/build/outputs/bundle/release/app-release.aab`

### 2. Sube el AAB a Google Play Console

1. Ve a [Google Play Console](https://play.google.com/console)
2. Crea una nueva aplicación
3. Completa la información de la tienda
4. Sube el archivo AAB
5. Configura las clasificaciones de contenido
6. Completa la información de privacidad
7. Envía la app para revisión

---

## 📄 Archivos Importantes

```
CineMatchApp/
├── build-apk.ps1              # Script para generar APK
├── generate-keystore.ps1      # Script para generar keystore
├── android/
│   ├── gradle.properties      # Configuración de Gradle
│   ├── gradle.properties.example  # Ejemplo de configuración
│   └── app/
│       ├── build.gradle       # Configuración de build
│       └── debug.keystore     # Keystore de debug (incluido)
└── BUILD_APK_GUIDE.md         # Guía detallada (completa)
```

---

## 🎯 Checklist Pre-Release

Antes de publicar tu APK de producción:

- [ ] Versión actualizada en `build.gradle` (versionCode y versionName)
- [ ] Cambios documentados
- [ ] Pruebas de la aplicación completadas
- [ ] Keystore de release configurado
- [ ] APK probado en dispositivos reales
- [ ] Permisos revisados en AndroidManifest.xml
- [ ] Iconos y recursos optimizados
- [ ] Política de privacidad actualizada
- [ ] Backup del keystore guardado de forma segura

---

## 📚 Documentación Adicional

- [Guía Completa de Build](../BUILD_APK_GUIDE.md) - Documentación detallada
- [React Native Docs](https://reactnative.dev/docs/signed-apk-android)
- [Expo Docs](https://docs.expo.dev/build/setup/)
- [Android Studio Guide](https://developer.android.com/studio/publish/app-signing)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa la [Guía Completa](../BUILD_APK_GUIDE.md)
2. Limpia el build con `cd android && .\gradlew.bat clean`
3. Verifica que todas las dependencias estén instaladas
4. Revisa los logs en `android/app/build/outputs/logs/`

---

## ✨ Tips

- Usa el APK de **debug** para desarrollo diario
- Genera APK de **release** solo para distribución
- Mantén el keystore en un lugar seguro (no en Git)
- Haz backup del keystore regularmente
- Incrementa `versionCode` en cada build de release
- Usa versionamiento semántico para `versionName` (ej: 1.0.0)

---

¡Listo para construir tu APK! 🚀
