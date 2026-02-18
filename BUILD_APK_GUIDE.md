# Guía para Generar APK de CineMatch

Este documento explica cómo generar un archivo APK de tu aplicación CineMatchApp.

## Requisitos Previos

- Node.js instalado
- Java JDK instalado (versión 17 o superior recomendada)
- Android SDK configurado
- Todas las dependencias del proyecto instaladas

## Método 1: APK de Desarrollo (Recomendado para pruebas)

Este método genera un APK de debug que puedes instalar directamente en dispositivos Android.

### Pasos:

1. **Navega al directorio de la aplicación:**
   ```bash
   cd CineMatchApp
   ```

2. **Instala las dependencias (si aún no lo has hecho):**
   ```bash
   npm install
   ```

3. **Pre-compila la aplicación:**
   ```bash
   npx expo export:android
   ```

4. **Genera el APK de debug:**
   ```bash
   cd android
   gradlew assembleDebug
   ```
   
   O en PowerShell:
   ```powershell
   cd android
   .\gradlew.bat assembleDebug
   ```

5. **Encuentra tu APK:**
   El APK se generará en:
   ```
   CineMatchApp/android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Método 2: APK de Producción (Para publicar)

Para generar un APK de producción firmado que puedes distribuir o subir a Google Play Store.

### Paso 1: Generar un Keystore

Si aún no tienes un keystore, genera uno:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore cinematch-release-key.keystore -alias cinematch-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANTE:** Guarda bien la contraseña del keystore y del alias. Si las pierdes, no podrás actualizar tu app en el futuro.

### Paso 2: Configurar el Keystore

1. Copia el archivo `cinematch-release-key.keystore` a la carpeta `CineMatchApp/android/app/`

2. Edita el archivo `android/gradle.properties` y añade (o crea el archivo si no existe):
   ```properties
   MYAPP_RELEASE_STORE_FILE=cinematch-release-key.keystore
   MYAPP_RELEASE_KEY_ALIAS=cinematch-key-alias
   MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña_del_keystore
   MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña_del_alias
   ```

3. Edita `android/app/build.gradle` y añade en la sección `signingConfigs`:
   ```gradle
   release {
       if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
           storeFile file(MYAPP_RELEASE_STORE_FILE)
           storePassword MYAPP_RELEASE_STORE_PASSWORD
           keyAlias MYAPP_RELEASE_KEY_ALIAS
           keyPassword MYAPP_RELEASE_KEY_PASSWORD
       }
   }
   ```

   Y en `buildTypes`, cambia la configuración de release para usar el signing config de release:
   ```gradle
   release {
       signingConfig signingConfigs.release
       minifyEnabled enableMinifyInReleaseBuilds
       proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
   }
   ```

### Paso 3: Generar el APK de Release

```bash
cd android
gradlew assembleRelease
```

O en PowerShell:
```powershell
cd android
.\gradlew.bat assembleRelease
```

El APK se generará en:
```
CineMatchApp/android/app/build/outputs/apk/release/app-release.apk
```

## Método 3: Usando EAS Build (Expo Application Services)

Este es el método oficial de Expo para builds de producción.

### Pasos:

1. **Instala EAS CLI:**
   ```bash
   npm install -g eas-cli
   ```

2. **Inicia sesión en tu cuenta de Expo:**
   ```bash
   eas login
   ```

3. **Configura el proyecto:**
   ```bash
   eas build:configure
   ```

4. **Genera el APK:**
   ```bash
   eas build -p android --profile preview
   ```

   O para producción:
   ```bash
   eas build -p android --profile production
   ```

5. El build se hará en la nube de Expo y recibirás un enlace para descargar el APK cuando esté listo.

## Método 4: APK Universal (AAB a APK)

Si generas un Android App Bundle (.aab) para Google Play, pero necesitas un APK:

1. **Genera el AAB:**
   ```bash
   cd android
   gradlew bundleRelease
   ```

2. **Convierte AAB a APK usando bundletool:**
   ```bash
   java -jar bundletool-all.jar build-apks --bundle=app-release.aab --output=cinematch.apks --mode=universal
   ```

## Probar el APK

Para instalar el APK en un dispositivo conectado por USB:

```bash
adb install ruta/al/app-debug.apk
```

O simplemente copia el archivo APK a tu dispositivo Android y ábrelo para instalarlo (necesitas habilitar "Instalar desde fuentes desconocidas" en la configuración de seguridad).

## Notas Importantes

- **APK de Debug:** Solo para pruebas internas, más grande y menos optimizado
- **APK de Release:** Optimizado, firmado, listo para distribución
- **Keystore:** NUNCA subas tu keystore a control de versiones (añádelo al .gitignore)
- **Google Play:** Ahora Google Play prefiere el formato AAB en lugar de APK
- **Tamaño:** Si el APK es muy grande, considera usar App Bundles o splits por ABI

## Solución de Problemas

### Error: "SDK location not found"
Crea un archivo `android/local.properties` con:
```properties
sdk.dir=C:\\Users\\TuUsuario\\AppData\\Local\\Android\\Sdk
```

### Error de compilación de Gradle
Limpia el build:
```bash
cd android
gradlew clean
```

### Problemas con dependencias nativas
Reconstruye las dependencias nativas:
```bash
cd android
gradlew clean
cd ..
npx pod-install ios
```

## Optimización del APK

Para reducir el tamaño del APK:

1. Habilita ProGuard (ya configurado para release)
2. Habilita splits por ABI en `android/app/build.gradle`:
   ```gradle
   splits {
       abi {
           enable true
           reset()
           include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
           universalApk false
       }
   }
   ```

3. Habilita la compresión de recursos en `gradle.properties`:
   ```properties
   android.enableShrinkResourcesInReleaseBuilds=true
   ```
