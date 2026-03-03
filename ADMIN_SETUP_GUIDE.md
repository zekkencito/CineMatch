# 📊 Guía Completa: Panel de Administración CineMatch

## Descripción General

Has configurado exitosamente un panel administrativo completo que se conecta directamente a tu base de datos Laravel. Este panel te permite gestionar:

- **Dashboard**: Estadísticas y métricas principales en tiempo real
- **Usuarios**: CRUD completo de usuarios
- **Planes de Suscripción**: Gestión de planes premium

---

## 🚀 Inicio Rápido

### Paso 1: Asegúrate que Laravel esté corriendo

```bash
cd laravel
php artisan serve
```

El servidor debe estar en `http://localhost:8000`

### Paso 2: Configura el panel admin

```bash
cd admin_panel
npm install
```

### Paso 3: Verifica el archivo .env

Abre `admin_panel/.env` y confirma:

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Cinematch Admin
```

### Paso 4: Inicia el panel admin

```bash
cd admin_panel
npm run dev
```

Accede a `http://localhost:5173` y usa:

**Email:** `admin@cinematch.com`
**Contraseña:** (la que configuraste en Laravel)

---

## 📁 Estructura del Código

### Servicio de API (`src/services/api.js`)

Punto centralizado para todas las llamadas a la API. Maneja:
- Autenticación con tokens Bearer
- Gestión de errores
- Todas las rutas disponibles

**Métodos principales:**
- `api.login(email, password)`
- `api.getUsers(page, perPage, search)`
- `api.getSubscriptionPlans()`
- `api.getDashboardStats()`

### Componentes

#### **Login.jsx**
- Autenticación de administrador
- Logo de CineMatch en la pantalla de login
- Almacena token en localStorage
- Protege rutas no autenticadas

#### **Dashboard.jsx**
- Muestra estadísticas en tiempo real
- Gráficos con Recharts
- Actualizo automático de datos

#### **Users.jsx**
- Lista de todos los usuarios
- CRUD completo: Crear, Leer, Actualizar, Eliminar
- Búsqueda y filtrado
- Modal para edición
- Notificaciones toast (éxito, error, advertencia)
- Modal de confirmación para eliminar

#### **SubscriptionPlans.jsx**
- Gestión de planes de suscripción
- CRUD de planes
- Visualización de características
- Notificaciones toast y modal de confirmación

#### **Sidebar.jsx**
- Logo y nombre de CineMatch en la parte superior
- Navegación principal entre secciones

#### **Header.jsx**
- Botón de menú para mostrar/ocultar sidebar
- Perfil de administrador con opción de cerrar sesión

#### **ProtectedRoute.jsx**
- Middleware que protege rutas
- Redirige a login si no hay token

---

## 🔌 Endpoints de API Disponibles

### Autenticación
```
POST   /admin/login              - Login de admin
POST   /admin/logout             - Logout
```

### Dashboard
```
GET    /admin/dashboard/stats    - Estadísticas principales
GET    /admin/dashboard/charts   - Datos para gráficos
```

### Usuarios
```
GET    /admin/users              - Lista de usuarios (con paginación)
GET    /admin/users/{id}         - Detalles de un usuario
POST   /admin/users              - Crear usuario
PUT    /admin/users/{id}         - Actualizar usuario
DELETE /admin/users/{id}         - Eliminar usuario
GET    /admin/users/statistics/summary - Estadísticas de usuarios
```

### Planes de Suscripción
```
GET    /admin/subscription-plans         - Lista de planes
GET    /admin/subscription-plans/{id}    - Detalles de un plan
POST   /admin/subscription-plans         - Crear plan
PUT    /admin/subscription-plans/{id}    - Actualizar plan
DELETE /admin/subscription-plans/{id}    - Eliminar plan
GET    /admin/subscriptions/statistics   - Estadísticas de suscripciones
```

---

## 🛠️ Configuración del Backend (Laravel)

### Controlador: `AdminController.php`

Ubicación: `laravel/app/Http/Controllers/AdminController.php`

**Métodos implementados:**
- `login()` - Autenticación
- `getDashboardStats()` - Estadísticas del dashboard
- `getDashboardCharts()` - Datos para gráficos
- `getUsers()` - Lista paginada de usuarios
- `getUser()` - Detalles de usuario
- `createUser()` - Crear usuario
- `updateUser()` - Actualizar usuario
- `deleteUser()` - Eliminar usuario
- `getSubscriptionPlans()` - Lista de planes
- `createSubscriptionPlan()` - Crear plan
- `updateSubscriptionPlan()` - Actualizar plan
- `deleteSubscriptionPlan()` - Eliminar plan

### Rutas: `routes/api.php`

Se han agregado todas las rutas del admin. Las puedes ver agregando estas líneas al final del archivo.

---

## 🔐 Seguridad

### Token de Autenticación

1. **Login:** Se envía email/password a `/admin/login`
2. **Respuesta:** Se recibe un token JWT/Sanctum
3. **Almacenamiento:** Se guarda en `localStorage` como `admin_token`
4. **Uso:** Se envía en el header `Authorization: Bearer {token}`

### ProtectedRoute

Las rutas están protegidas con `ProtectedRoute` que verifica si existe token en `localStorage`.

---

## 📊 Flujo de Datos

```
┌─────────────┐
│   React UI  │
└──────┬──────┘
       │ (Hace llamadas)
       ▼
┌──────────────────────┐
│   api.js (Servicio)  │
└──────┬───────────────┘
       │ (Fetch)
       ▼
┌──────────────────────────┐
│   Laravel API Backend    │
│   (AdminController)      │
└──────┬───────────────────┘
       │ (Consulta)
       ▼
┌──────────────────────┐
│   Base de Datos      │
│   (MySQL/MariaDB)    │
└──────────────────────┘
```

---

## ⚙️ Variables de Entorno

### Admin Panel (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Cinematch Admin
```

### Laravel (`.env`)
```env
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=cinematch
DB_USERNAME=root
DB_PASSWORD=
```

---

## 🔧 Cómo Agregar Nuevos Endpoints

### 1. En Laravel (Backend)

**a) Agrega método en `AdminController.php`:**

```php
public function getStatistic() {
    // Tu lógica
    return response()->json($data);
}
```

**b) Agrega ruta en `routes/api.php`:**

```php
Route::get('/admin/statistic', [AdminController::class, 'getStatistic']);
```

### 2. En el Servicio API (`api.js`)

**Agrega método:**

```javascript
async getStatistic() {
    return this.request('/admin/statistic');
}
```

### 3. En el Componente React

**Usa el servicio:**

```jsx
import api from '../services/api'

const data = await api.getStatistic();
```

---

## 🐛 Solución de Problemas

### Error: "API Error: 401 Unauthorized"
- Verifica que tu email esté en la lista de admins en `AdminController.php`
- Asegúrate que el token sea válido

### Error: "Cannot fetch from localhost:8000"
- Verifica que Laravel esté corriendo: `php artisan serve`
- Confirma que el puerto 8000 no esté en uso: `netstat -ano | findstr :8000` (Windows)

### Datos no se actualizan en tiempo real
- Recarga la página (F5)
- Verifica que el servidor Laravel esté respondiendo
- Abre DevTools (F12) y revisa la pestaña Network

### CORS Error
- Abre `laravel/config/cors.php`
- Agrega el origen del admin panel:
```php
'allowed_origins' => ['http://localhost:5173', 'http://localhost:8000'],
```

---

## 📈 Mejoras Futuras

1. **Autenticación Multi-nivel**: Roles de admin (superadmin, moderator, etc.)
2. **Reportes Avanzados**: PDF, Excel, gráficos más detallados
3. **Auditoría**: Log de todas las acciones del admin
4. **Notificaciones Push**: Alertas en tiempo real de eventos
5. **Moderación**: Aprobar/rechazar contenido de usuarios
6. **Métricas**: Dashboard más completo y personalizable

---

## 📞 Referencia Rápida de Comandos

```bash
# Iniciar Laravel
cd laravel && php artisan serve

# Iniciar Admin Panel
cd admin_panel && npm run dev

# Build para producción
cd admin_panel && npm run build

# Ejecutar linter
cd admin_panel && npm run lint

# Hacer requests a API manualmente (con curl)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/admin/users
```

---

## ✅ Checklist de Configuración

- [ ] Laravel corriendo en http://localhost:8000
- [ ] Base de datos MySQL/MariaDB configurada
- [ ] Archivo `admin_panel/.env` configurado
- [ ] Token guardándose en localStorage
- [ ] Poder iniciar sesión con credenciales de admin
- [ ] Dashboard cargando datos de la API
- [ ] Usuarios listándose desde BD
- [ ] Poder crear/editar/eliminar usuarios
- [ ] Planes de suscripción sincronizados

---

¡Tu panel administrativo está listo! 🎉
