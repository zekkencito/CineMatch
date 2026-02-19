# 🎬 Script para Crear 15 Usuarios Cercanos en CineMatch
# Ejecuta el seeder NearbyUsersSeeder

Write-Host "🎬 CineMatch - Creador de Usuarios Cercanos" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en la carpeta correcta
$laravelPath = Join-Path $PSScriptRoot "laravel"
if (-not (Test-Path $laravelPath)) {
    Write-Host "❌ Error: No se encuentra la carpeta 'laravel'" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde la raíz del proyecto CineMatch" -ForegroundColor Yellow
    exit 1
}

# Cambiar a la carpeta laravel
Set-Location $laravelPath

Write-Host "📍 Ubicación actual: $laravelPath" -ForegroundColor Gray
Write-Host ""

# Verificar que PHP está instalado
try {
    $phpVersion = php -v 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "PHP no encontrado"
    }
    Write-Host "✓ PHP detectado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: PHP no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "   Instala PHP o agrega su ruta al PATH del sistema" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Ejecutando seeder NearbyUsersSeeder..." -ForegroundColor Yellow
Write-Host ""

# Ejecutar el seeder
try {
    php artisan db:seed --class=NearbyUsersSeeder
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "============================================" -ForegroundColor Green
        Write-Host "✅ ¡15 usuarios cercanos creados exitosamente!" -ForegroundColor Green
        Write-Host "============================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "📧 Emails de prueba (todos con password: password123):" -ForegroundColor Cyan
        Write-Host "   - ana.garcia@demo.com" -ForegroundColor White
        Write-Host "   - roberto.lopez@demo.com" -ForegroundColor White
        Write-Host "   - laura.martinez@demo.com" -ForegroundColor White
        Write-Host "   - diego.hernandez@demo.com" -ForegroundColor White
        Write-Host "   - carmen.silva@demo.com" -ForegroundColor White
        Write-Host "   - miguel.ruiz@demo.com" -ForegroundColor White
        Write-Host "   - sofia.ramirez@demo.com" -ForegroundColor White
        Write-Host "   - javier.castro@demo.com" -ForegroundColor White
        Write-Host "   - patricia.morales@demo.com" -ForegroundColor White
        Write-Host "   - fernando.ortiz@demo.com" -ForegroundColor White
        Write-Host "   - valentina.flores@demo.com" -ForegroundColor White
        Write-Host "   - andres.mendoza@demo.com" -ForegroundColor White
        Write-Host "   - gabriela.torres@demo.com" -ForegroundColor White
        Write-Host "   - ricardo.vargas@demo.com" -ForegroundColor White
        Write-Host "   - isabella.rojas@demo.com" -ForegroundColor White
        Write-Host ""
        Write-Host "📍 Todos ubicados dentro de 5km de radio" -ForegroundColor Cyan
        Write-Host "🎬 Con gustos variados: Acción, Comedia, Terror, Romance, Sci-Fi" -ForegroundColor Cyan
        Write-Host "🎥 Películas: Spider-Man, Kill Bill, Interstellar, Shrek, y más!" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "💡 Recarga la app para ver los nuevos usuarios disponibles!" -ForegroundColor Yellow
        Write-Host ""
    } else {
        throw "Error al ejecutar el seeder"
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error al ejecutar el seeder" -ForegroundColor Red
    Write-Host "   $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica que la base de datos esté configurada (.env)" -ForegroundColor White
    Write-Host "   2. Ejecuta 'php artisan migrate' primero" -ForegroundColor White
    Write-Host "   3. Verifica que GenreSeeder se haya ejecutado previamente" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Volver a la carpeta original
Set-Location $PSScriptRoot

Write-Host "Presiona Enter para continuar..."
$null = Read-Host
