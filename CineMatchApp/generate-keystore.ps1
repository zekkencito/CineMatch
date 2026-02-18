# Script para generar un keystore de release para CineMatch
# Este script ayuda a crear el keystore necesario para firmar APKs de release

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CineMatch Keystore Generator" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Este script te ayudará a generar un keystore para firmar" -ForegroundColor Yellow
Write-Host "tu aplicación CineMatch para producción." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANTE: Guarda bien las contraseñas que ingreses." -ForegroundColor Red
Write-Host "Si las pierdes, no podrás actualizar tu app en el futuro." -ForegroundColor Red
Write-Host ""

# Verificar que keytool está disponible
try {
    $keytoolVersion = keytool -help 2>&1 | Select-Object -First 1
    Write-Host "✓ keytool encontrado" -ForegroundColor Green
} catch {
    Write-Host "✗ Error: keytool no está disponible" -ForegroundColor Red
    Write-Host "Asegúrate de tener Java JDK instalado y en el PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Solicitar información
Write-Host "Ingresa la siguiente información:" -ForegroundColor Cyan
Write-Host ""

$keystoreName = Read-Host "Nombre del keystore [cinematch-release-key]"
if ([string]::IsNullOrWhiteSpace($keystoreName)) {
    $keystoreName = "cinematch-release-key"
}

$keyAlias = Read-Host "Alias de la clave [cinematch-key-alias]"
if ([string]::IsNullOrWhiteSpace($keyAlias)) {
    $keyAlias = "cinematch-key-alias"
}

Write-Host ""
Write-Host "Ahora se te pedirá una contraseña (mínimo 6 caracteres)" -ForegroundColor Yellow
Write-Host "Esta contraseña será para el keystore Y la clave" -ForegroundColor Yellow
Write-Host ""

# Información adicional
Write-Host "Información del certificado:" -ForegroundColor Cyan
$nombre = Read-Host "Tu nombre y apellido [CineMatch Team]"
if ([string]::IsNullOrWhiteSpace($nombre)) {
    $nombre = "CineMatch Team"
}

$orgUnit = Read-Host "Unidad organizacional [Development]"
if ([string]::IsNullOrWhiteSpace($orgUnit)) {
    $orgUnit = "Development"
}

$org = Read-Host "Organización [CineMatch]"
if ([string]::IsNullOrWhiteSpace($org)) {
    $org = "CineMatch"
}

$ciudad = Read-Host "Ciudad"
$estado = Read-Host "Estado/Provincia"
$pais = Read-Host "Código de país (2 letras) [CR]"
if ([string]::IsNullOrWhiteSpace($pais)) {
    $pais = "CR"
}

Write-Host ""
Write-Host "Generando keystore..." -ForegroundColor Yellow
Write-Host ""

# Ruta donde se guardará el keystore
$keystoreFile = "$keystoreName.keystore"
$keystorePath = Join-Path "android\app" $keystoreFile

# Construir el comando
$dname = "CN=$nombre, OU=$orgUnit, O=$org"
if (-not [string]::IsNullOrWhiteSpace($ciudad)) {
    $dname += ", L=$ciudad"
}
if (-not [string]::IsNullOrWhiteSpace($estado)) {
    $dname += ", ST=$estado"
}
$dname += ", C=$pais"

Write-Host "Ejecutando keytool..." -ForegroundColor Cyan
Write-Host "Se te pedirá la contraseña dos veces (para el keystore y la clave)" -ForegroundColor Yellow
Write-Host ""

# Ejecutar keytool
$keytoolCmd = "keytool -genkeypair -v -storetype PKCS12 -keystore `"$keystorePath`" -alias `"$keyAlias`" -keyalg RSA -keysize 2048 -validity 10000 -dname `"$dname`""

try {
    Invoke-Expression $keytoolCmd
    
    if (Test-Path $keystorePath) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   ¡Keystore generado exitosamente!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "Ubicación: " -NoNewline
        Write-Host $keystorePath -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Ahora debes configurar gradle.properties:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "1. Abre el archivo: android/gradle.properties" -ForegroundColor White
        Write-Host "2. Añade al final del archivo:" -ForegroundColor White
        Write-Host ""
        Write-Host "# Release Signing Configuration" -ForegroundColor Gray
        Write-Host "MYAPP_RELEASE_STORE_FILE=$keystoreFile" -ForegroundColor Gray
        Write-Host "MYAPP_RELEASE_KEY_ALIAS=$keyAlias" -ForegroundColor Gray
        Write-Host "MYAPP_RELEASE_STORE_PASSWORD=tu_contraseña" -ForegroundColor Gray
        Write-Host "MYAPP_RELEASE_KEY_PASSWORD=tu_contraseña" -ForegroundColor Gray
        Write-Host ""
        
        Write-Host "3. Reemplaza 'tu_contraseña' con la contraseña que ingresaste" -ForegroundColor White
        Write-Host ""
        Write-Host "IMPORTANTE: " -NoNewline -ForegroundColor Red
        Write-Host "No subas este archivo a Git con las contraseñas" -ForegroundColor Yellow
        Write-Host ""
        
        # Preguntar si quiere que el script actualice gradle.properties
        $updateFile = Read-Host "¿Deseas que este script actualice automáticamente gradle.properties? (S/N)"
        
        if ($updateFile -eq 'S' -or $updateFile -eq 's') {
            $password = Read-Host "Ingresa la contraseña del keystore" -AsSecureString
            $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            
            $gradlePropsPath = "android\gradle.properties"
            
            # Verificar si ya existe la configuración
            if (Select-String -Path $gradlePropsPath -Pattern "MYAPP_RELEASE" -Quiet) {
                Write-Host ""
                Write-Host "El archivo gradle.properties ya contiene configuración de release." -ForegroundColor Yellow
                Write-Host "Revísalo manualmente si necesitas actualizarlo." -ForegroundColor Yellow
            } else {
                # Añadir la configuración
                $config = @"

# ============================================
# RELEASE SIGNING - Configuración del Keystore
# ============================================
# IMPORTANTE: No subir este archivo a Git con estas credenciales

MYAPP_RELEASE_STORE_FILE=$keystoreFile
MYAPP_RELEASE_KEY_ALIAS=$keyAlias
MYAPP_RELEASE_STORE_PASSWORD=$plainPassword
MYAPP_RELEASE_KEY_PASSWORD=$plainPassword

# Habilitar minificación en builds de release
android.enableMinifyInReleaseBuilds=true

# Habilitar reducción de recursos en builds de release
android.enableShrinkResourcesInReleaseBuilds=true
"@
                Add-Content -Path $gradlePropsPath -Value $config
                
                Write-Host ""
                Write-Host "✓ gradle.properties actualizado correctamente" -ForegroundColor Green
                Write-Host ""
            }
        }
        
        Write-Host "Para generar el APK de release, ejecuta:" -ForegroundColor Cyan
        Write-Host "  .\build-apk.ps1 release" -ForegroundColor White
        Write-Host ""
        
    } else {
        Write-Host "Error: No se pudo generar el keystore" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host ""
    Write-Host "Error al generar el keystore:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host "Proceso completado." -ForegroundColor Green
