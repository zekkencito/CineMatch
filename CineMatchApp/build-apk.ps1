# Script para generar APK de CineMatch
# Uso: .\build-apk.ps1 [debug|release]

param(
    [Parameter(Position=0)]
    [ValidateSet('debug', 'release')]
    [string]$BuildType = 'debug'
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   CineMatch APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "Error: Este script debe ejecutarse desde el directorio CineMatchApp" -ForegroundColor Red
    exit 1
}

Write-Host "[1/5] Verificando dependencias..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias de Node..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Error al instalar dependencias" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Dependencias OK" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/5] Verificando configuración de Expo..." -ForegroundColor Yellow
Write-Host "Gradle se encargará de empaquetar la aplicación automáticamente" -ForegroundColor Cyan

Write-Host ""
Write-Host "[3/5] Limpiando builds anteriores..." -ForegroundColor Yellow
Push-Location android
.\gradlew.bat clean
Pop-Location

Write-Host ""
Write-Host "[4/5] Generando APK de $BuildType..." -ForegroundColor Yellow
Push-Location android

if ($BuildType -eq 'debug') {
    .\gradlew.bat assembleDebug
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    $outputName = "CineMatch-debug.apk"
} else {
    # Verificar si existe la configuración de release
    if (-not (Test-Path "gradle.properties") -or -not (Select-String -Path "gradle.properties" -Pattern "MYAPP_RELEASE" -Quiet)) {
        Write-Host ""
        Write-Host "¡ADVERTENCIA! No se encontró configuración de keystore para release." -ForegroundColor Yellow
        Write-Host "Se generará un APK firmado con el keystore de debug (no usar para producción)." -ForegroundColor Yellow
        Write-Host ""
        Start-Sleep -Seconds 3
    }
    .\gradlew.bat assembleRelease
    $apkPath = "app\build\outputs\apk\release\app-release.apk"
    $outputName = "CineMatch-release.apk"
}

Pop-Location

if ($LASTEXITCODE -ne 0) {
    Write-Host "Error al generar APK" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[5/5] Copiando APK..." -ForegroundColor Yellow

$sourcePath = Join-Path "android" $apkPath
$destPath = Join-Path $PWD $outputName

if (Test-Path $sourcePath) {
    Copy-Item -Path $sourcePath -Destination $destPath -Force
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "   ¡APK GENERADO EXITOSAMENTE!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Ubicación: " -NoNewline
    Write-Host $destPath -ForegroundColor Cyan
    
    # Obtener tamaño del archivo
    $fileSize = (Get-Item $destPath).Length / 1MB
    Write-Host "Tamaño: " -NoNewline
    Write-Host ("{0:N2} MB" -f $fileSize) -ForegroundColor Cyan
    
    Write-Host ""
    Write-Host "Para instalar en un dispositivo Android:" -ForegroundColor Yellow
    Write-Host "  1. Conecta tu dispositivo por USB" -ForegroundColor White
    Write-Host "  2. Ejecuta: adb install $outputName" -ForegroundColor White
    Write-Host "  3. O copia el archivo al dispositivo y ábrelo" -ForegroundColor White
    Write-Host ""
    
    # Preguntar si quiere abrir la ubicación
    $response = Read-Host "¿Deseas abrir la carpeta donde está el APK? (S/N)"
    if ($response -eq 'S' -or $response -eq 's') {
        explorer.exe /select,$destPath
    }
    
} else {
    Write-Host "Error: No se encontró el APK generado en $sourcePath" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Proceso completado." -ForegroundColor Green
