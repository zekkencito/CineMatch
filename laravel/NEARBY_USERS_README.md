# 🎬 Crear 15 Usuarios de Prueba Cercanos

Este script crea 15 usuarios de prueba con preferencias de películas variadas, ubicados dentro de 5km de distancia.

## 📋 Características de los Usuarios

### Géneros
- Acción
- Comedia
- Terror
- Romance
- Ciencia Ficción
- Animación
- Crimen

### Películas Incluidas
- Spider-Man (2002)
- Kill Bill: Vol. 1 (2003)
- Interstellar (2014)
- Shrek (2001)
- Back to the Future (1985)
- Megamind (2010)
- Transformers (2007)
- Pulp Fiction (1994)
- Forrest Gump (1994)
- The Dark Knight (2008)

### Directores
- Michael Bay
- Quentin Tarantino
- Robert Zemeckis
- Christopher Nolan
- Tom McGrath
- Andrew Adamson
- Vicky Jenson

## 🚀 Cómo Ejecutar

### Opción 1: Ejecutar solo este seeder

```bash
# Desde la carpeta laravel
cd laravel
php artisan db:seed --class=NearbyUsersSeeder
```

### Opción 2: Usar el script PowerShell

```powershell
# Desde la raíz del proyecto CineMatch
.\create-nearby-users.ps1
```

## 👥 Usuarios Creados

Los 15 usuarios tendrán:
- ✅ Email: usuario@demo.com (todos con password: `password123`)
- ✅ Edad: Entre 23-30 años
- ✅ Ubicación: Dentro de 5km de las coordenadas base
- ✅ Biografía personalizada según sus gustos
- ✅ 1-2 géneros favoritos
- ✅ 1-2 directores favoritos
- ✅ 1-2 películas vistas con ratings 7-10

## 📍 Ubicación

Coordenadas base (ajustables en el seeder):
- Latitud: 19.432600
- Longitud: -99.133200
- Radio de búsqueda: 5km

Los usuarios se distribuirán aleatoriamente dentro de este radio.

## ⚠️ Notas Importantes

1. **Verificación de duplicados**: El seeder verifica si los directores y películas ya existen antes de crearlos
2. **Géneros**: Los géneros deben existir previamente en la base de datos (creados por `GenreSeeder`)
3. **Emails únicos**: Si ejecutas el seeder múltiples veces, obtendrás error de duplicado de email

## 🔄 Limpiar y Volver a Crear

Si quieres limpiar todos los usuarios de prueba:

```bash
# Resetear toda la base de datos (CUIDADO: borra todo)
php artisan migrate:fresh --seed

# O eliminar usuarios específicos desde la base de datos
php artisan tinker
>>> User::where('email', 'like', '%@demo.com')->delete();
```

## 🎯 Verificar que Funcionó

```bash
php artisan tinker
>>> User::where('email', 'like', '%@demo.com')->count()
# Debería mostrar 15 (o más si tenías otros usuarios de demo)

>>> User::with('location', 'favoriteGenres', 'favoriteDirectors')->where('email', 'like', '%@demo.com')->get()
# Verás todos los usuarios con sus relaciones
```

## 📧 Emails de Prueba

Los usuarios creados tienen estos emails:
- ana.garcia@demo.com
- roberto.lopez@demo.com
- laura.martinez@demo.com
- diego.hernandez@demo.com
- carmen.silva@demo.com
- miguel.ruiz@demo.com
- sofia.ramirez@demo.com
- javier.castro@demo.com
- patricia.morales@demo.com
- fernando.ortiz@demo.com
- valentina.flores@demo.com
- andres.mendoza@demo.com
- gabriela.torres@demo.com
- ricardo.vargas@demo.com
- isabella.rojas@demo.com

**Contraseña para todos**: `password123`

---

¡Ahora tendrás 15 usuarios cercanos para hacer swipes y encontrar matches! 🍿
