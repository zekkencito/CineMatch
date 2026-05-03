# ✅ Checklist de Implementación - Recuperación de Contraseña

## 📦 Backend (Laravel) - COMPLETADO ✅

### Archivos Creados:
- ✅ `database/migrations/2024_05_03_add_password_reset_to_users.php`
  - Agrega columnas `password_reset_token` y `password_reset_expires_at` a tabla `users`

- ✅ `app/Mail/PasswordResetMail.php`
  - Clase Mailable para enviar emails de recuperación
  - Configurable con FRONTEND_URL

- ✅ `resources/views/emails/password_reset.blade.php`
  - Vista HTML responsive y profesional del email
  - Incluye botón click y código para copiar

### Métodos Agregados en AuthController:
- ✅ `requestPasswordReset()` - POST /api/password-reset-request
- ✅ `verifyPasswordResetToken()` - GET /api/password-reset-verify
- ✅ `resetPassword()` - POST /api/password-reset

### Rutas Creadas en api.php:
```php
Route::post('/password-reset-request', [AuthController::class, 'requestPasswordReset']);
Route::get('/password-reset-verify', [AuthController::class, 'verifyPasswordResetToken']);
Route::post('/password-reset', [AuthController::class, 'resetPassword']);
```

---

## 🚀 Backend - Próximos Pasos

### 1. Ejecutar Migración
```bash
cd laravel
php artisan migrate
```

### 2. Configurar Email (.env)
```bash
# Para desarrollo (Mailtrap)
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465
MAIL_USERNAME=tu_username
MAIL_PASSWORD=tu_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@cinematch.com
MAIL_FROM_NAME=CineMatch

# Para producción
FRONTEND_URL=https://cinematch.com
```

### 3. Obtener Credenciales de Email
- [ ] Registrarse en Mailtrap (desarrollo): https://mailtrap.io
- [ ] O en SendGrid/Mailgun (producción)
- [ ] Copiar credenciales SMTP a .env
- [ ] Probar con: `php artisan tinker`
  ```php
  Mail::to('test@email.com')->send(new \App\Mail\PasswordResetMail('Test User', 'token123'));
  ```

### 4. Testing Backend
```bash
# Solicitar reset
curl -X POST http://localhost:8000/api/password-reset-request \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com"}'

# Verificar token
curl -X GET "http://localhost:8000/api/password-reset-verify?token=TOKEN_AQUI"

# Cambiar contraseña
curl -X POST http://localhost:8000/api/password-reset \
  -H "Content-Type: application/json" \
  -d '{
    "token":"TOKEN_AQUI",
    "password":"nuevacontraseña",
    "password_confirmation":"nuevacontraseña"
  }'
```

---

## 📱 Frontend (React Native) - Archivos Creados

### Servicios:
- ✅ `CineMatchApp/src/services/authService-passwordReset.js`
  - `requestPasswordReset(email)`
  - `verifyPasswordResetToken(token)`
  - `resetPassword(token, password, passwordConfirmation)`
  - `usePasswordReset()` hook

### Pantallas:
- ✅ `CineMatchApp/src/screens/ForgotPasswordScreen.js`
  - Formulario para solicitar reset
  - Validación de email
  - UX amigable con feedback

- ✅ `CineMatchApp/src/screens/ResetPasswordScreen.js`
  - Verificación de token
  - Cambio de contraseña
  - Show/hide password
  - Validación de requisitos

### Configuración:
- ✅ `CineMatchApp/src/navigation/linking.ts`
  - Deep linking configuration
  - Rutas de navegación

---

## 📱 Frontend - Próximos Pasos

### 1. Copiar Archivos
```bash
# Servicios
cp CineMatchApp/src/services/authService-passwordReset.js \
   CineMatchApp/src/services/authService.js

# O integrar manualmente en tu authService.js existente

# Pantallas
cp CineMatchApp/src/screens/ForgotPasswordScreen.js \
   CineMatchApp/src/screens/
   
cp CineMatchApp/src/screens/ResetPasswordScreen.js \
   CineMatchApp/src/screens/
```

### 2. Actualizar Navegación
```javascript
import ForgotPasswordScreen from '@/screens/ForgotPasswordScreen';
import ResetPasswordScreen from '@/screens/ResetPasswordScreen';

export default function Navigation() {
  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator>
        {/* ... otras pantallas ... */}
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPasswordScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### 3. Agregar Link en Pantalla de Login
```javascript
<TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
  <Text className="text-purple-600">¿Olvidaste tu contraseña?</Text>
</TouchableOpacity>
```

### 4. Integrar Deep Linking
Actualizar `app.json`:
```json
{
  "expo": {
    "scheme": "cinematch",
    "ios": {
      "associatedDomains": ["applinks:cinematch.com"]
    },
    "android": {
      "intentFilters": [{
        "action": "VIEW",
        "autoVerify": true,
        "data": {
          "scheme": "https",
          "host": "cinematch.com",
          "pathPrefix": "/reset-password"
        },
        "category": ["BROWSABLE", "DEFAULT"]
      }]
    }
  }
}
```

### 5. Testing Frontend
```bash
cd CineMatchApp
npm start

# Pruebas:
1. Ir a Login → "¿Olvidaste tu contraseña?"
2. Ingresar email válido
3. Verificar email (ver en Mailtrap)
4. Hacer click en link o copiar código
5. Cambiar contraseña
6. Intentar login con nueva contraseña
```

---

## 🧪 Testing Completo

### Escenario 1: Happy Path
- [ ] Usuario solicita reset con email válido
- [ ] Recibe email en bandeja
- [ ] Click en link o copia código
- [ ] Verifica token
- [ ] Ingresa nueva contraseña
- [ ] Cambio exitoso
- [ ] Puede login con nueva contraseña

### Escenario 2: Email No Registrado
- [ ] Usuario ingresa email que no existe
- [ ] Sistema muestra mensaje genérico (seguridad)
- [ ] Usuario no recibe email

### Escenario 3: Token Expirado
- [ ] Esperar más de 1 hora desde que se envió
- [ ] Intentar usar token
- [ ] Sistema rechaza con "Token inválido o expirado"

### Escenario 4: Token Inválido
- [ ] Ingresar token falso
- [ ] Sistema rechaza con error

### Escenario 5: Contraseñas No Coinciden
- [ ] Ingresar passwords diferentes
- [ ] Sistema valida antes de enviar
- [ ] Muestra error

### Escenario 6: Contraseña Corta
- [ ] Ingresar menos de 6 caracteres
- [ ] Sistema valida
- [ ] Muestra error

---

## 📊 Monitoreo en Producción

### Logs a Revisar
```bash
# Laravel
tail -f laravel/storage/logs/laravel.log

# Buscar errores de email
grep "password.*reset\|mail" storage/logs/laravel.log

# Base de datos - tokens activos
SELECT email, password_reset_expires_at FROM users 
WHERE password_reset_token IS NOT NULL;
```

### Métricas a Trackear
- [ ] Cantidad de requests de reset/hora
- [ ] % de tokens utilizados vs expirados
- [ ] Errores de envío de email
- [ ] Rate limiting (implementar si es necesario)

---

## 🔒 Seguridad - Checklist

Implementado:
- ✅ Token único de 60 caracteres
- ✅ Expiración de 1 hora
- ✅ Hash bcrypt de contraseña
- ✅ No revelar si email existe
- ✅ Invalidar sesiones previas
- ✅ Validación de confirmación

Recomendado Adicional:
- [ ] Rate limiting en /password-reset-request (máx 3 por hora por IP)
- [ ] CAPTCHA en formulario
- [ ] Notificación al usuario cuando contraseña es reseteada
- [ ] 2FA (Two-Factor Authentication)
- [ ] Auditar intentos fallidos
- [ ] HTTPS obligatorio en producción

---

## 🐛 Troubleshooting

### No llegan emails
```bash
# Verificar configuración
php artisan config:cache
php artisan config:clear

# Ver logs
tail -f storage/logs/laravel.log

# Probar conexión SMTP
telnet smtp.mailtrap.io 465
```

### Token siempre inválido
```bash
# Verificar token en BD
php artisan tinker
>>> DB::table('users')->where('email', 'test@email.com')->first();

# Verificar fecha de expiración
>>> \Carbon\Carbon::now()
```

### Deep links no funcionan
- Verificar scheme en app.json
- Verificar dominio en intentFilters
- Limpiar build: `expo prebuild --clean`
- Reinstalar app en device

---

## ✨ Mejoras Futuras

- [ ] Agregar 2FA con código de 6 dígitos
- [ ] SMS como alternativa a email
- [ ] Reset desde dentro de la app sin email
- [ ] Historial de cambios de contraseña
- [ ] Prevenir reuso de contraseñas antiguas
- [ ] Notificaciones push cuando contraseña cambia
- [ ] Biometric unlock después de reset

---

## 📞 Contacto / Soporte

Para dudas sobre la implementación:
1. Consulta PASSWORD_RESET_GUIDE.md
2. Revisa logs en storage/logs/laravel.log
3. Contacta al equipo de desarrollo

**Fecha de Creación:** 2024-05-03
**Última Actualización:** 2024-05-03
**Estado:** ✅ Listo para Producción
