@echo off
echo.
echo ==========================================
echo   CineMatch - Detector de IP local
echo ==========================================
echo.
echo Buscando tu IP local...
echo.

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set IP=%%a
    set IP=!IP:~1!
    echo IP encontrada: !IP!
)

echo.
echo ==========================================
echo Para usar esta IP en la app:
echo.
echo 1. Edita el archivo .env
echo 2. Agrega esta linea:
echo    EXPO_PUBLIC_API_URL=http://!IP!:8000/api
echo.
echo 3. Reinicia Expo:
echo    npm start -- --clear
echo ==========================================
echo.
pause
