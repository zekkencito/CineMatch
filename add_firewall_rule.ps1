# Ejecuta este archivo como Administrador (Click derecho -> Ejecutar como administrador)
# O copia estos comandos y pégalos en PowerShell Admin

# Permitir conexiones entrantes en el puerto 8000 (Laravel)
New-NetFirewallRule -DisplayName "Laravel Dev Server - Port 8000" `
    -Direction Inbound `
    -LocalPort 8000 `
    -Protocol TCP `
    -Action Allow `
    -Profile Any

Write-Host "✓ Regla de firewall agregada para el puerto 8000" -ForegroundColor Green
Write-Host "El emulador de Android ahora debería poder conectarse a Laravel" -ForegroundColor Green
Write-Host ""
Write-Host "Si sigues teniendo problemas, reinicia el emulador de Android" -ForegroundColor Yellow
