# 🔄 Cómo Recargar la App Después de Cambios

## Problema
Los cambios en el código no aparecen en la app móvil.

## Soluciones

### Opción 1: Recarga Rápida (Recomendado)
En la terminal donde está corriendo `npm start` o Expo:
- Presiona **`r`** para recargar
- O presiona **`Shift + r`** para limpiar caché y recargar

### Opción 2: Desde el Dispositivo
1. **Sacude** el dispositivo físico o **Ctrl/Cmd + M** en emulador
2. Selecciona **"Reload"** del menú

### Opción 3: Reiniciar Metro Bundler
1. Detén el servidor (Ctrl + C en la terminal de npm start)
2. Ejecuta:
   ```powershell
   npm start -- --reset-cache
   ```

### Opción 4: Limpieza Completa
Si nada funciona:
```powershell
# Limpiar caché de Metro
Remove-Item -Path "$env:LOCALAPPDATA\Temp\metro-*" -Recurse -Force -ErrorAction SilentlyContinue

# Limpiar caché de Expo
Remove-Item -Path "$env:LOCALAPPDATA\Temp\expo-*" -Recurse -Force -ErrorAction SilentlyContinue

# Reiniciar con caché limpia
npm start -- --reset-cache
```

## ✅ Verificar que los Cambios se Aplicaron
Después de recargar, el pull-to-refresh debe funcionar:
1. Abre el chat
2. Desliza hacia abajo en la lista de mensajes
3. Verás el indicador de carga
4. Los mensajes se actualizarán

---

**Nota**: Los cambios de código JavaScript se recargan automáticamente con Fast Refresh, pero a veces se necesita recarga manual.
