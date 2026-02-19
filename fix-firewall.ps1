# ===================================================================
# Script para Solucionar Problemas de Firewall con Laravel
# ===================================================================
# Ejecuta este archivo como Administrador
# (Click derecho -> Ejecutar con PowerShell -> Ejecutar como admin)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Configurador de Firewall Laravel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar permisos de administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como Administrador" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pasos:" -ForegroundColor Yellow
    Write-Host "1. Click derecho en este archivo" -ForegroundColor White
    Write-Host "2. Ejecutar con PowerShell" -ForegroundColor White
    Write-Host "3. Ejecutar como administrador" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "✓ Permisos de administrador verificados" -ForegroundColor Green
Write-Host ""

# Regla 1: Puerto 8000
Write-Host "[1/2] Configurando regla para puerto 8000..." -ForegroundColor Yellow
try {
    $rule1 = Get-NetFirewallRule -DisplayName "Laravel Dev Server - Port 8000" -ErrorAction SilentlyContinue
    if ($rule1) {
        Write-Host "  ℹ️  La regla ya existe, actualizando..." -ForegroundColor Cyan
        Remove-NetFirewallRule -DisplayName "Laravel Dev Server - Port 8000"
    }
    
    New-NetFirewallRule -DisplayName "Laravel Dev Server - Port 8000" `
        -Direction Inbound `
        -LocalPort 8000 `
        -Protocol TCP `
        -Action Allow `
        -Profile Any `
        -Enabled True `
        -ErrorAction Stop | Out-Null
    
    Write-Host "  ✓ Regla para puerto 8000 configurada" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Error configurando puerto 8000: $_" -ForegroundColor Red
}

Write-Host ""

# Regla 2: PHP.exe
Write-Host "[2/2] Configurando regla para PHP.exe..." -ForegroundColor Yellow
try {
    $phpPath = (Get-Command php -ErrorAction SilentlyContinue).Source
    
    if (-not $phpPath) {
        Write-Host "  ⚠️  PHP no encontrado en PATH" -ForegroundColor Yellow
        Write-Host "  Buscando en ubicaciones comunes..." -ForegroundColor Cyan
        
        $commonPaths = @(
            "C:\xampp\php\php.exe",
            "C:\php\php.exe",
            "C:\Program Files\PHP\php.exe",
            "C:\wamp\bin\php\php*\php.exe"
        )
        
        foreach ($path in $commonPaths) {
            if (Test-Path $path) {
                $phpPath = $path
                Write-Host "  ✓ PHP encontrado en: $phpPath" -ForegroundColor Green
                break
            }
        }
    } else {
        Write-Host "  ✓ PHP encontrado en: $phpPath" -ForegroundColor Green
    }
    
    if ($phpPath) {
        $rule2 = Get-NetFirewallRule -DisplayName "PHP.exe - Laravel Dev" -ErrorAction SilentlyContinue
        if ($rule2) {
            Write-Host "  ℹ️  La regla ya existe, actualizando..." -ForegroundColor Cyan
            Remove-NetFirewallRule -DisplayName "PHP.exe - Laravel Dev"
        }
        
        New-NetFirewallRule -DisplayName "PHP.exe - Laravel Dev" `
            -Direction Inbound `
            -Program $phpPath `
            -Action Allow `
            -Profile Any `
            -Enabled True `
            -ErrorAction Stop | Out-Null
        
        Write-Host "  ✓ Regla para PHP.exe configurada" -ForegroundColor Green
    } else {
        Write-Host "  ❌ No se pudo encontrar PHP.exe" -ForegroundColor Red
        Write-Host "  La regla de puerto 8000 debería ser suficiente" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Error configurando PHP.exe: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Configuración Completada" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Mostrar reglas configuradas
Write-Host "Reglas de Firewall configuradas:" -ForegroundColor Cyan
Get-NetFirewallRule -DisplayName "*Laravel*" | Select-Object DisplayName, Enabled, Direction, Action | Format-Table -AutoSize

Write-Host ""
Write-Host "✅ Ahora tu aplicación React Native debería poder conectarse a Laravel" -ForegroundColor Green
Write-Host ""
Write-Host "Siguiente paso:" -ForegroundColor Yellow
Write-Host "1. Asegúrate de que el servidor Laravel esté corriendo:" -ForegroundColor White
Write-Host "   cd laravel" -ForegroundColor Gray
Write-Host "   php artisan serve --host=0.0.0.0 --port=8000" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Recarga tu aplicación en Expo (presiona R)" -ForegroundColor White
Write-Host ""

pause
