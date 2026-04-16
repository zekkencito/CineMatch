# 🔄 Guía de Reset de Base de Datos en InfinityFree

## El Problema
Error: `SQLSTATE[42S02]: Base table or view not found: 1146 Table 'if0_41664573_cinematch.subscriptions' doesn't exist`

Esto ocurre porque la tabla `subscriptions` no se creó durante las migraciones.

---

## Solución: Pasos en Orden

### 1️⃣ **PRIMERO: Diagnosticar el Problema**

Accede a: `https://cinematch.wuaze.com/diagnose-migrations.php`

**¿Qué hace?**
- Dropea TODAS las tablas
- Intenta ejecutar las migrations
- Te muestra si hay errores
- Verifica que la tabla `subscriptions` existe

**Qué deberías ver:**
✅ Tabla `subscriptions` existe
✅ Exit Code: 0 (ÉXITO)

Si algo falla, lee el output con cuidado.

---

### 2️⃣ **SEGUNDO: Reset Completo**

Accede a: `https://cinematch.wuaze.com/reset-db.php`

**¿Qué hace?**
1. Dropea todas las tablas (con foreign keys desactivadas)
2. Ejecuta migrate para crear las tablas en orden correcto
3. Ejecuta los seeders en orden:
   - SubscriptionPlanSeeder
   - PaymentTypeSeeder
   - GenreSeeder
   - UserSeeder

**Resultado esperado:**
```
✅ PROCESO COMPLETADO
Credenciales:
Email: admin@gmail.com
Password: admin123
```

---

### 3️⃣ **ALTERNATIVA: Solo Seeding (si las tablas ya existen)**

Accede a: `https://cinematch.wuaze.com/seed-only.php`

Esto solo ejecuta los seeders Sin dropear nada.

---

## Scripts Disponibles

| Script | URL | Función |
|--------|-----|---------|
| **diagnose-migrations.php** | `/diagnose-migrations.php` | 🔍 Diagnostica qué está fallando |
| **reset-db.php** | `/reset-db.php` | 🔄 Reset completo (recomendado) |
| **clean-db.php** | `/clean-db.php` | 🧹 Solo limpia datos (no schemas) |
| **seed-only.php** | `/seed-only.php` | 🌱 Solo ejecuta seeders |
| **run-seeder.php** | `/run-seeder.php` | 🌱 Alternativa para seeding |
| **seed-users.php** | `/seed-users.php` | 👥 Si solo necesitas usuarios |

---

## ⚠️ Troubleshooting

### Si sigue fallando con "subscriptions doesn't exist":

1. **Revisa el output de diagnose-migrations.php**
   - Busca el error específico en las migrations
   - Probablemente una migration anterior está fallando

2. **Verifica el archivo de migration de subscriptions:**
   - `laravel/database/migrations/2026_02_17_000002_create_subscriptions_table.php`
   - Asegúrate de que depende de `subscription_plans` primero

3. **Order de migrations es importante:**
   - Las migrations se ejecutan por fecha
   - `2026_02_11_033405_subscription_plans.php` debe ejecutarse ANTES que subscriptions

---

## Credenciales Después del Reset

### Admin
- **Email:** admin@gmail.com
- **Password:** admin123

### Usuarios de Prueba
- pamela@gmail.com / 123456
- roberto@gmail.com / 123456
- ana@gmail.com / 123456
- Y más...

Las contraseñas están hasheadas en los seeders.

---

## Si Aún No Funciona

1. Revisa el servidor de errores de PHP
2. Verifica que el .env está correcto (DB_HOST, DB_DATABASE, etc.)
3. Checkea que tienes permisos en la BD
4. Revisa el archivo `storage/logs/laravel.log` para errores detallados
