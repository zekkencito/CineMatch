/**
 * ===========================================
 * 🎬 CONFIGURACIÓN DE THE MOVIE DATABASE (TMDB)
 * ===========================================
 * 
 * AQUÍ PONES TU API KEY DE TMDB
 * 
 * 📝 Cómo obtener tu API key:
 * 1. Ve a https://www.themoviedb.org/
 * 2. Crea una cuenta (gratis)
 * 3. Ve a Settings -> API
 * 4. Solicita una API key (elige "Developer")
 * 5. Copia tu API key y pégala abajo en TMDB_API_KEY
 * 
 * 📚 Documentación: https://developers.themoviedb.org/3
 */

// ⬇️ PEGA TU API KEY AQUÍ ⬇️
export const TMDB_API_KEY = '6bbead30a73217ca3cd601c83f85e50b'; // 👈 CAMBIA ESTO

// URLs base de TMDB
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Tamaños de imágenes disponibles
export const IMAGE_SIZES = {
  poster: {
    small: '/w185',      // Para cards pequeñas
    medium: '/w342',     // Para cards medianas
    large: '/w500',      // Para detalles
    original: '/original' // Resolución completa
  },
  backdrop: {
    small: '/w300',
    medium: '/w780',
    large: '/w1280',
    original: '/original'
  },
  profile: {
    small: '/w185',
    medium: '/h632',
    original: '/original'
  }
};

// Idioma por defecto
export const TMDB_LANGUAGE = 'es-MX'; // Español de México
export const TMDB_REGION = 'MX';

/**
 * Construir URL completa de imagen
 * @param {string} path - Path de la imagen (ej: "/abc123.jpg")
 * @param {string} size - Tamaño (ej: IMAGE_SIZES.poster.medium)
 * @returns {string} URL completa de la imagen
 */
export const getImageUrl = (path, size = IMAGE_SIZES.poster.medium) => {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${size}${path}`;
};

/**
 * Configuración por defecto para requests a TMDB
 */
export const TMDB_DEFAULT_PARAMS = {
  api_key: TMDB_API_KEY,
  language: TMDB_LANGUAGE,
  region: TMDB_REGION,
};
