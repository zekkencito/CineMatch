# 🎬 Recomendación Diaria - Guía de Implementación

## 📋 Resumen
Funcionalidad de "Recomendación Diaria" para Cinematch con límite de 3 recomendaciones gratuitas por día y animación interactiva de scratch-off.

## 🔧 Dependencias Instaladas
- ✅ `expo-linear-gradient` (v15.0.8) - Para gradientes en las tarjetas
- ✅ `@expo/vector-icons` (v15.1.1) - Para los iconos de la interfaz

## 📁 Archivos Creados

### Backend (Laravel)
1. **`laravel/app/Http/Controllers/DailyRecommendationController.php`**
   - Gestiona límites de 3 recomendaciones diarias usando caché
   - Filtra películas por mood/género
   - Excluye películas ya vistas por el usuario
   - Retorna errores específicos para paywall

2. **Rutas API agregadas a `laravel/api.php`**
   - `GET /api/daily-recommendation` - Obtener recomendación
   - `GET /api/daily-recommendation/status` - Ver estado diario

### Frontend (React Native)
3. **`CineMatchApp/src/components/DailyRecommendationCard.js`**
   - Componente con animación scratch-off interactiva
   - Efecto de "rascar" para revelar la película
   - Botones para compartir y marcar como vista

4. **`CineMatchApp/src/services/dailyRecommendationService.js`**
   - Servicio para consumir la API del backend
   - Manejo de errores y límites diarios

5. **`CineMatchApp/src/screens/DailyRecommendationScreen.js`**
   - Pantalla principal con selector de moods
   - Visualización del contador de recomendaciones
   - Integración con sistema de suscripciones

6. **Navegación actualizada en `MainNavigator.js`**
   - Nueva pestaña "Recomendación" con icono de regalo

## 🎯 Características Implementadas

### Límites y Paywall
- ✅ 3 recomendaciones gratuitas por día
- ✅ Conteo usando caché de Laravel (eficiente)
- ✅ Reset automático al final del día
- ✅ Mensaje de upgrade a Plan Pro cuando se excede límite

### Filtros por Mood
- ✅ 9 moods disponibles: Comedia, Terror, Drama, Acción, Romance, Thriller, Sci-Fi, Animación, Sorpresa
- ✅ Búsqueda aleatoria de películas según filtro
- ✅ Exclusión de películas ya vistas

### Experiencia Interactiva
- ✅ Animación scratch-off con gestos táctiles
- ✅ Gradientes personalizados por mood
- ✅ Revelado progresivo al 60% de rascado
- ✅ Efectos visuales y transiciones suaves

### Funcionalidades Adicionales
- ✅ Compartir recomendación en redes sociales
- ✅ Marcar película como vista
- ✅ Contador visual de recomendaciones restantes
- ✅ Indicador de tiempo de reset

## 🚀 Cómo Usar

### Para el Usuario
1. Ir a la pestaña "Recomendación" en la app
2. Seleccionar un mood (opcional)
3. Tocar "Obtener Recomendación"
4. Rascar la tarjeta para revelar la película
5. Compartir o marcar como vista

### Para Desarrolladores

#### Backend - Prueba de API
```bash
# Obtener recomendación
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:8000/api/daily-recommendation?mood=comedy"

# Ver estado diario
curl -H "Authorization: Bearer TOKEN" \
     "http://localhost:8000/api/daily-recommendation/status"
```

#### Frontend - Iniciar App
```bash
cd CineMatchApp
npm start
# Escanear QR con Expo Go
```

## 🔍 Estructura de Datos

### Respuesta de API Exitosa
```json
{
  "success": true,
  "movie": {
    "id": 123,
    "title": "Inception",
    "poster_path": "/path/to/poster.jpg",
    "overview": "A thief who steals...",
    "release_date": "2010-07-16",
    "vote_average": 8.8
  },
  "remaining_recommendations": 2,
  "daily_count": 1,
  "limit": 3
}
```

### Respuesta de Límite Excedido
```json
{
  "error": "DAILY_LIMIT_EXCEEDED",
  "message": "Has alcanzado tu límite de 3 recomendaciones diarias...",
  "count": 3,
  "limit": 3
}
```

## 🎨 Personalización

### Colores por Mood
Los gradientes se definen en `DailyRecommendationCard.js`:
```javascript
const moodGradients = {
  comedy: ['#FFD93D', '#FFB344'],
  horror: ['#2C1810', '#8B0000'],
  // ... más colores
};
```

### Límite Diario
Modificar en `DailyRecommendationController.php`:
```php
if ($dailyCount >= 3) { // Cambiar 3 por el límite deseado
```

## 🐛 Troubleshooting

### Problemas Comunes
1. **Iconos no aparecen**: Verificar `@expo/vector-icons` instalado
2. **Gradientes no funcionan**: Verificar `expo-linear-gradient` instalado
3. **Error 401**: Verificar token de autenticación en headers
4. **Error 429**: Límite diario alcanzado

### Logs Útiles
```javascript
// En DailyRecommendationScreen.js
console.log('Daily status:', dailyStatus);
console.log('Selected mood:', selectedMood);
```

## 🔄 Próximas Mejoras (Opcional)
- [ ] Animación de ruleta como alternativa
- [ ] Sistema de puntos por usar recomendaciones
- [ ] Recomendaciones basadas en gustos del usuario
- [ ] Historial de recomendaciones vistas
- [ ] Notificaciones diarias para recordar usar la función

## 📞 Soporte
Si tienes problemas con esta implementación, revisa:
1. Logs de Laravel en `storage/logs/laravel.log`
2. Consola de React Native en Expo Dev Tools
3. Estado de la caché con `php artisan cache:clear`

---
**Implementado por**: Cascade AI Assistant  
**Fecha**: 21 de abril de 2026  
**Versión**: 1.0.0
