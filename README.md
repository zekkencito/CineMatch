# CineMatch

CineMatch es una aplicacion social que conecta a personas con intereses cinematograficos similares. A traves de los gustos de peliculas, generos y directores, los usuarios pueden encontrar amigos o pareja para compartir su pasion por el cine. El proyecto consiste en tres componentes principales: una aplicacion movil para usuarios, un panel de administracion y un backend con Laravel.

## Componentes del Proyecto

### 1. Aplicacion Movil (CineMatchApp)

Aplicacion movil desarrollada con React Native y Expo que permite a los usuarios:

- **Registro y Autenticacion**: Los usuarios pueden registrarse con email y contraseña o mediante redes sociales (Google, Facebook)
- **Perfil de Usuario**: Los usuarios pueden configurar su perfil con foto, nombre, edad y biografia
- **Preferencias Cinematograficas**: Sistema completo para configurar gustos personales:
  - Seleccionar generos favoritos de peliculas (accion, comedia, drama, terror, etc.)
  - Agregar directores favoritos
  - Marcar peliculas vistas
  - Configurar radio de busqueda geografica
- **Sistema de Conexiones**: Algoritmo que conecta personas basado en compatibilidad de preferencias cinematograficas
- **Chat**: Sistema de mensajeria para comunicarse con usuarios con los que hubo conexion
- **Recomendaciones Diarias**: Sistema que sugiere peliculas diarias basadas en el mood del usuario
  - Usuarios gratuitos: 3 recomendaciones cada 24 horas
  - Usuarios Premium: Recomendaciones ilimitadas
- **Foro de Peliculas**: Comunidad donde los usuarios pueden:
  - Publicar reseñas de peliculas
  - Reaccionar a reseñas de otros usuarios
  - Responder a reseñas
- **Sistema de Suscripciones**: Planes gratuitos y premium con diferentes beneficios
- **Ubicacion**: Sistema de geolocalizacion para encontrar usuarios cercanos

**Tecnologias:**
- React Native
- Expo
- React Navigation
- Redux Toolkit
- TMDB API (The Movie Database)
- AsyncStorage para persistencia local

### 2. Panel de Administracion (admin_panel)

Panel web desarrollado con React y Vite que permite a los administradores gestionar la plataforma:

- **Dashboard**: Vista general con estadisticas en tiempo real:
  - Numero total de usuarios
  - Usuarios activos
  - Ingresos por suscripciones
  - Graficos de crecimiento
  - Peliculas mas populares
  - Usuarios mas activos
- **Gestion de Usuarios**: 
  - Ver lista completa de usuarios
  - Buscar usuarios por nombre o email
  - Editar informacion de usuarios
  - Eliminar usuarios
  - Ver estado de suscripcion (gratis/premium)
- **Gestion de Planes de Suscripcion**:
  - Crear nuevos planes
  - Editar planes existentes
  - Configurar precios y beneficios
  - Activar/desactivar planes
- **Sistema de Correos**:
  - Envio de correos masivos a usuarios
  - Plantillas de correos personalizadas
  - Historial de envios

**Tecnologias:**
- React
- Vite
- Recharts (graficos)
- Lucide React (iconos)
- Axios para comunicacion con API

### 3. Backend (Laravel)

API RESTful desarrollada con Laravel que maneja toda la logica del negocio y persistencia de datos:

**Modelos Principales:**
- **User**: Informacion de usuarios, autenticacion y perfil
- **Location**: Ubicacion geografica de usuarios
- **Genre**: Generos de peliculas de TMDB
- **Director**: Directores de cine de TMDB
- **Movie**: Peliculas de TMDB
- **UserFavoriteGenre**: Relacion entre usuarios y generos favoritos
- **UserFavoriteDirector**: Relacion entre usuarios y directores favoritos
- **WatchedMovie**: Peliculas vistas por usuarios
- **UserMovieRating**: Calificaciones de peliculas por usuarios
- **Connections**: Relaciones de conexion entre usuarios
- **Message**: Mensajes del chat
- **Subscription**: Suscripciones de usuarios
- **SubscriptionPlan**: Planes de suscripcion disponibles
- **Payment**: Historial de pagos
- **MovieForumMovie**: Peliculas en el foro
- **MovieForumReview**: Reseñas de peliculas
- **MovieForumReaction**: Reacciones a reseñas
- **MovieForumReviewReply**: Respuestas a reseñas

**Controladores Principales:**
- **AuthController**: Registro, login, login social, recuperacion de contraseña
- **UserController**: Gestion de perfiles de usuarios
- **PreferencesController**: Gestion de preferencias cinematograficas
- **ConnectionController**: Sistema de conexiones entre usuarios
- **MessageController**: Sistema de mensajeria
- **DailyRecommendationController**: Recomendaciones diarias de peliculas
- **MovieForumController**: Gestion del foro de peliculas
- **SubscriptionController**: Gestion de suscripciones
- **PaymentController**: Procesamiento de pagos
- **AdminController**: Endpoints para el panel de administracion

**Caracteristicas:**
- Autenticacion JWT
- Integracion con TMDB API para datos de peliculas
- Sistema de geolocalizacion
- Integracion con PayPal para pagos
- Sistema de notificaciones push con Expo
- Validacion de datos con Laravel Validation
- Migraciones de base de datos
- Seeders para datos iniciales

**Base de Datos:**
- MySQL como motor de base de datos
- Eloquent ORM para interaccion con la base de datos
- Relaciones entre modelos definidas en Eloquent

## Arquitectura del Proyecto

El proyecto sigue una arquitectura de tres capas:

1. **Frontend Movil**: CineMatchApp (React Native)
   - Maneja la interfaz de usuario
   - Comunicacion con el backend via API REST
   - Persistencia local con AsyncStorage

2. **Frontend Web**: admin_panel (React)
   - Panel de administracion
   - Visualizacion de datos y estadisticas
   - Gestion de usuarios y configuraciones

3. **Backend**: Laravel (PHP)
   - API RESTful
   - Logica de negocio
   - Persistencia de datos
   - Integracion con servicios externos (TMDB, PayPal, Expo)

## Flujo de Trabajo

1. El usuario se registra en la aplicacion movil
2. Configura sus preferencias cinematograficas (generos, directores, peliculas vistas)
3. El sistema busca personas compatibles basado en preferencias y ubicacion
4. El usuario puede hacer swipe para aceptar o rechazar perfiles
5. Cuando ambos usuarios se aceptan, se genera una conexion
6. Los usuarios pueden chatear entre si para hablar de peliculas y planes
7. El sistema recomienda peliculas diarias basadas en los gustos
8. Los usuarios pueden participar en el foro de peliculas y compartir opiniones
9. Los administradores gestionan la plataforma desde el panel web

## Requisitos del Sistema

**Para la Aplicacion Movil:**
- Node.js y npm
- Expo CLI
- React Native
- Cuenta en TMDB para obtener API key

**Para el Panel de Administracion:**
- Node.js y npm
- Navegador web moderno

**Para el Backend:**
- PHP 8.0 o superior
- Composer
- MySQL
- Servidor web (Apache o Nginx)

## Instalacion

### Backend (Laravel)
1. Clonar el repositorio
2. Navegar al directorio laravel
3. Ejecutar `composer install`
4. Copiar `.env.example` a `.env`
5. Configurar las variables de entorno
6. Ejecutar `php artisan key:generate`
7. Ejecutar `php artisan migrate`
8. Ejecutar `php artisan db:seed`

### Aplicacion Movil
1. Navegar al directorio CineMatchApp
2. Ejecutar `npm install`
3. Configurar la URL del backend en `src/config/api.js`
4. Ejecutar `npx expo start`

### Panel de Administracion
1. Navegar al directorio admin_panel
2. Ejecutar `npm install`
3. Configurar la URL del backend en `src/services/api.js`
4. Ejecutar `npm run dev`

## Variables de Entorno Importantes

**Backend (.env):**
- DB_HOST: Host de la base de datos
- DB_DATABASE: Nombre de la base de datos
- DB_USERNAME: Usuario de la base de datos
- DB_PASSWORD: Contraseña de la base de datos
- TMDB_API_KEY: API key de The Movie Database
- PAYPAL_CLIENT_ID: Client ID de PayPal
- PAYPAL_CLIENT_SECRET: Client Secret de PayPal
- EXPO_ACCESS_TOKEN: Token para notificaciones push

**Aplicacion Movil (.env):**
- API_URL: URL del backend

**Panel de Administracion (.env):**
- VITE_API_URL: URL del backend

## Despliegue

El proyecto puede desplegarse en diferentes plataformas:

**Aplicacion Movil:**
- APK para Android
- IPA para iOS
- Web con Expo

**Backend:**
- Railway
- Heroku
- VPS propio

**Panel de Administracion:**
- Vercel
- Netlify
- VPS propio

## Seguridad

- Autenticacion JWT para usuarios
- Encriptacion de contraseñas con bcrypt
- Validacion de datos en frontend y backend
- Proteccion contra CSRF en Laravel
- CORS configurado para permitir acceso desde los frontends
- Variables de entorno para datos sensibles

## Soporte

Para reportar problemas o solicitar ayuda, contactar al equipo de desarrollo.
