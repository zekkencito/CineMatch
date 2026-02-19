# Configuración de PayPal para CineMatch

## Estado actual
✅ **Modo desarrollo activado**: La app funciona con pagos simulados (mock) mientras no tengas credenciales válidas de PayPal.

## Problema detectado
En tu archivo `laravel/.env`, las variables `PAYPAL_CLIENT_ID` y `PAYPAL_SECRET` tienen el mismo valor:
```
PAYPAL_CLIENT_ID=AaIHJXgI463y65NYUIJRrrLehU2NWJDfsbsa5vYv4LiWRpk2lYrGxGPgAnAR2g2JhzrCnAzNhT-BUlzh
PAYPAL_SECRET=AaIHJXgI463y65NYUIJRrrLehU2NWJDfsbsa5vYv4LiWRpk2lYrGxGPgAnAR2g2JhzrCnAzNhT-BUlzh
```

Esto es incorrecto. PayPal requiere un **Client ID** y un **Secret** diferentes.

## Cómo obtener credenciales PayPal reales (Sandbox)

### 1. Crear/Acceder a cuenta de desarrollador PayPal
- Ve a [developer.paypal.com](https://developer.paypal.com)
- Inicia sesión o crea una cuenta de desarrollador

### 2. Crear una aplicación Sandbox
1. Ve a **Dashboard** → **Apps & Credentials**
2. Selecciona el tab **Sandbox**
3. Click en **Create App**
4. Dale un nombre (ej: "CineMatch App")
5. Click **Create App**

### 3. Obtener credenciales
Una vez creada la app, verás:
- **Client ID**: Una cadena larga (empieza con `A...`)
- **Secret**: Click en "Show" para verlo (será diferente al Client ID)

### 4. Actualizar tu proyecto

Edita `laravel/.env`:
```env
PAYPAL_CLIENT_ID=tu_client_id_aqui
PAYPAL_SECRET=tu_secret_aqui
PAYPAL_ENV=sandbox
```

Luego reinicia Laravel:
```powershell
cd laravel
php artisan config:clear
php artisan serve --host=0.0.0.0 --port=8000
```

### 5. Probar con cuenta de prueba
PayPal Sandbox proporciona cuentas de prueba. Ve a:
- **Dashboard** → **Accounts** (en Sandbox)
- Usa el email/password de la cuenta "Personal" para simular un comprador

## Modo producción
Cuando estés listo para pagos reales:
1. Repite los pasos en el tab **Live** (no Sandbox)
2. Actualiza `.env`:
   ```env
   PAYPAL_ENV=production
   ```
3. PayPal requerirá verificación de tu negocio

## Uso actual (sin credenciales)
Mientras tanto, tu app:
- ✅ Funciona con pagos simulados
- ✅ Permite probar el flujo de actualización a Premium
- ✅ No requiere configuración adicional para desarrollo
- ⚠️ Muestra un diálogo "Modo desarrollo" al intentar pagar

## Soporte
- [Documentación PayPal REST API](https://developer.paypal.com/api/rest/)
- [Guía de Checkout](https://developer.paypal.com/docs/checkout/)
