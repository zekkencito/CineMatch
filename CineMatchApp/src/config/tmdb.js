
export const TMDB_API_KEY = '6bbead30a73217ca3cd601c83f85e50b'; 

// URLs base de TMDB
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Tamaños de imágenes disponibles
export const IMAGE_SIZES = {
  poster: {
    small: '/w185',      
    medium: '/w342',     
    large: '/w500',      
    original: '/original' 
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
