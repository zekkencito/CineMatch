# 🔐 Guía de Recuperación de Contraseña - CineMatch

## Descripción General

Sistema completo para que los usuarios recuperen su contraseña mediante un token enviado por correo electrónico. El flujo es:

1. Usuario solicita reset de contraseña con su email
2. Sistema genera token único y lo envía por email
3. Usuario recibe email con link o código
4. Usuario valida el token y establece nueva contraseña
5. Contraseña se actualiza y sesiones previas se invalidan

---

## 🚀 Backend - Implementación

### 1. Migración de Base de Datos

```bash
php artisan migrate
```

**Archivo:** `database/migrations/2024_05_03_add_password_reset_to_users.php`

Agrega dos columnas a la tabla `users`:
- `password_reset_token`: VARCHAR - Token único para reset
- `password_reset_expires_at`: TIMESTAMP - Expiración del token (1 hora)

### 2. Mailable (Email)

**Archivo:** `app/Mail/PasswordResetMail.php`

Clase que prepara el correo con:
- Nombre del usuario
- Token de recuperación
- URL para hacer click (construida con `FRONTEND_URL`)
- Información de seguridad

### 3. Vista del Email

**Archivo:** `resources/views/emails/password_reset.blade.php`

HTML profesional con:
- Diseño responsive
- Botón directo para reset
- Código de token para copiar en app
- Advertencias de seguridad
- Información de expiración

### 4. Métodos en AuthController

**Archivo:** `app/Http/Controllers/AuthController.php`

#### `requestPasswordReset(Request $request)`
```php
POST /api/password-reset-request
Content-Type: application/json

{
    "email": "usuario@email.com"
}

Response:
{
    "success": true,
    "message": "Se ha enviado un enlace de recuperación a tu correo electrónico"
}
```

**Características:**
- Valida que el email existe
- Genera token único de 60 caracteres
- Guarda token y fecha de expiración (1 hora)
- Envía email con el token
- Por seguridad, no revela si el email existe o no

#### `verifyPasswordResetToken(Request $request)`
```php
GET /api/password-reset-verify?token=xxxxxxxxxxxxx

Response:
{
    "success": true,
    "message": "Token válido",
    "email": "usuario@email.com"
}
```

**Características:**
- Verifica que el token existe
- Verifica que el token no ha expirado
- Retorna el email del usuario (para confirmación)

#### `resetPassword(Request $request)`
```php
POST /api/password-reset
Content-Type: application/json

{
    "token": "xxxxxxxxxxxxx",
    "password": "nuevacontraseña",
    "password_confirmation": "nuevacontraseña"
}

Response:
{
    "success": true,
    "message": "Contraseña actualizada exitosamente. Por favor, inicia sesión con tu nueva contraseña."
}
```

**Características:**
- Valida token y fecha de expiración
- Valida que password tiene mínimo 6 caracteres
- Valida que password_confirmation coincide
- Hash seguro de la contraseña
- Invalida todos los tokens previos del usuario (fuerza re-login)
- Limpia el token de reset

---

## 🛠️ Configuración Requerida

### Variables de Entorno (.env)

```env
# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=465
MAIL_USERNAME=tu_username
MAIL_PASSWORD=tu_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@cinematch.com"
MAIL_FROM_NAME="CineMatch"

# Frontend URL (para link del email)
FRONTEND_URL=http://localhost:3000
```

**Opciones de Email:**
- **Mailtrap** (desarrollo): https://mailtrap.io
- **Mailgun** (producción)
- **SendGrid** (producción)
- **SMTP personalizado**

### Configurar Mail en Laravel

**Archivo:** `config/mail.php`

Está preconfigurado. Solo necesitas variables de entorno correctas.

---

## 📱 Frontend - Implementación

### 1. Pantalla de Solicitud de Reset

```jsx
import { useState } from 'react';
import api from '@/services/api';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleRequestReset = async () => {
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/password-reset-request', {
        email: email
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setEmail('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-bold mb-6">Recuperar Contraseña</Text>
      
      <TextInput
        placeholder="Ingresa tu email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        className="border border-gray-300 rounded-lg p-3 mb-4"
      />

      {message && <Text className="text-green-600 mb-4">{message}</Text>}
      {error && <Text className="text-red-600 mb-4">{error}</Text>}

      <TouchableOpacity
        onPress={handleRequestReset}
        disabled={loading}
        className="bg-purple-600 p-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Enviando...' : 'Enviar Enlace'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 2. Pantalla de Reset de Contraseña

```jsx
import { useState, useEffect } from 'react';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '@/services/api';

export default function ResetPasswordScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { token } = route.params || {};

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    try {
      const response = await api.get('/password-reset-verify', {
        params: { token }
      });
      
      if (response.data.success) {
        setEmail(response.data.email);
      } else {
        setError('Token inválido o expirado');
      }
    } catch (err) {
      setError('Token inválido o expirado');
    } finally {
      setVerifying(false);
    }
  };

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post('/password-reset', {
        token,
        password,
        password_confirmation: confirmPassword
      });

      if (response.data.success) {
        // Mostrar confirmación y redirigir a login
        navigation.navigate('Login');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return <Text>Verificando token...</Text>;
  }

  return (
    <View className="flex-1 bg-white p-6 justify-center">
      <Text className="text-2xl font-bold mb-2">Nueva Contraseña</Text>
      <Text className="text-gray-600 mb-6">Para: {email}</Text>

      <TextInput
        placeholder="Nueva contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border border-gray-300 rounded-lg p-3 mb-4"
      />

      <TextInput
        placeholder="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        className="border border-gray-300 rounded-lg p-3 mb-4"
      />

      {error && <Text className="text-red-600 mb-4">{error}</Text>}

      <TouchableOpacity
        onPress={handleResetPassword}
        disabled={loading}
        className="bg-purple-600 p-4 rounded-lg"
      >
        <Text className="text-white text-center font-semibold">
          {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
```

### 3. Deep Linking (Para Links del Email)

**Archivo:** `navigation/linking.ts`

```typescript
const linking = {
  prefixes: ['cinematch://', 'https://cinematch.com'],
  config: {
    screens: {
      ResetPassword: 'reset-password/:token',
      // ... otras rutas
    }
  }
};
```

**Archivo:** `app.json`

```json
{
  "expo": {
    "scheme": "cinematch",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png"
        }
      ]
    ],
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": {
            "scheme": "https",
            "host": "cinematch.com",
            "pathPattern": "/reset-password/*"
          },
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

---

## 🧪 Testing

### Postman/Insomnia

#### 1. Solicitar Reset
```
POST http://localhost:8000/api/password-reset-request
Content-Type: application/json

{
    "email": "usuario@email.com"
}
```

#### 2. Verificar Token
```
GET http://localhost:8000/api/password-reset-verify?token=TOKEN_AQUI
```

#### 3. Cambiar Contraseña
```
POST http://localhost:8000/api/password-reset
Content-Type: application/json

{
    "token": "TOKEN_AQUI",
    "password": "nuevacontraseña",
    "password_confirmation": "nuevacontraseña"
}
```

### En Desarrollo

**Usa Mailtrap:**
1. Crea cuenta en https://mailtrap.io
2. Copia credenciales a `.env`
3. Los emails se verán en Mailtrap dashboard
4. Copia el token y prueba

---

## 🔒 Seguridad

✅ **Implementado:**
- Token único de 60 caracteres
- Expiración de 1 hora
- Hash seguro con bcrypt
- No revela si email existe o no
- Invalida todos los tokens previos (logout de todas las sesiones)
- Validación de password confirmado
- Logs de errores sin exponer detalles

⚠️ **Recomendaciones Adicionales:**
- Implementar rate limiting en `/password-reset-request`
- Usar HTTPS en producción
- Implementar CAPTCHA en el formulario
- Log de intentos fallidos
- Notificar al usuario si su contraseña fue resetada

---

## 📋 Checklist de Implementación

Backend:
- [x] Migración creada
- [x] Mailable creada
- [x] Vista de email creada
- [x] Métodos en AuthController
- [x] Rutas en api.php
- [x] Variables de entorno configuradas

Frontend (React Native):
- [ ] Crear pantalla de "Olvidé mi contraseña"
- [ ] Crear pantalla de reset de contraseña
- [ ] Implementar deep linking
- [ ] Agregar navegación a pantallas de reset
- [ ] Integrar con flujo de login

Producción:
- [ ] Servicio de email configurado (SendGrid, Mailgun, etc)
- [ ] HTTPS activado
- [ ] Rate limiting implementado
- [ ] Testing completo
- [ ] Documentación en cliente

---

## 🐛 Troubleshooting

**No llegan los emails:**
1. Verifica variables de entorno MAIL_*
2. Revisa logs: `tail -f storage/logs/laravel.log`
3. En Mailtrap, verifica que credenciales son correctas
4. Revisa carpeta de spam

**Token inválido:**
1. Verifica que el token no ha expirado (1 hora máximo)
2. Revisa en BD que el token existe: `SELECT * FROM users WHERE email='usuario@email.com';`

**"Unable to connect":**
1. Asegúrate que Laravel está corriendo
2. Verifica que el puerto es correcto
3. CORS debe estar permitido si frontend está en otro dominio

---

## 📞 Soporte

Para preguntas o problemas contacta al equipo de desarrollo.
