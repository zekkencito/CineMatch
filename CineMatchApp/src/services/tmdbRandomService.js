import axios from 'axios';
import {
  TMDB_BASE_URL,
  TMDB_API_KEY,
  TMDB_LANGUAGE
} from '../config/tmdb';

const TMDB_CONFIG = {
  api_key: TMDB_API_KEY,
  language: TMDB_LANGUAGE,
  include_adult: false
};

// Mapeo de moods a IDs de géneros de TMDB
const MOOD_TO_GENRE = {
  'comedy': 35,      // Comedia
  'horror': 27,      // Terror
  'drama': 18,       // Drama
  'action': 28,      // Acción
  'romance': 10749,  // Romance
  'thriller': 53,    // Thriller (Suspense)
  'sci-fi': 878,     // Ciencia Ficción
  'animation': 16,   // Animación
  'mystery': 9648,   // Misterio
  'adventure': 12,   // Aventura
  'fantasy': 14,     // Fantasía
  'family': 10751,    // Familia
  'documentary': 99, // Documental
  'war': 10752,      // Bélica
  'crime': 80,       // Crimen
  'history': 36,      // Historia
  'music': 10402,     // Música
  'tv': 10770,       // Película de TV
  'western': 37,      // Western
  'all': null        // Todos los géneros
};

// Historial reciente para evitar repetición (guardado en memoria)
let recentMovies = [];
const MAX_RECENT_MOVIES = 20;

export const tmdbRandomService = {
  /**
   * Obtener películas aleatorias de TMDB por género
   */
  async getRandomMoviesByGenre(genreId, page = 1, limit = 20) {
    try {
      console.log(`Obteniendo películas de TMDB - Género: ${genreId}, Página: ${page}`);
      
      // Diferentes métodos de ordenamiento para variedad
      const sortOptions = [
        'popularity.desc',
        'vote_average.desc',
        'primary_release_date.desc',
        'primary_release_date.asc',
        'title.asc'
      ];
      
      const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
      
      const params = {
        ...TMDB_CONFIG,
        sort_by: randomSort,
        'vote_count.gte': 10, // Reducido drásticamente para más variedad
        'vote_average.gte': 5.0, // Reducido para incluir más películas
        'release_date.gte': '1990-01-01', // Películas más recientes
        'with_runtime.gte': 60, // Mínimo 60 minutos
        page: page
      };
      
      console.log(`Usando ordenamiento: ${randomSort}`);

      // Agregar filtro por género si no es 'all'
      if (genreId && genreId !== 'all') {
        // Convertir a número si es string numérico (para géneros adicionales)
        const numericGenreId = parseInt(genreId);
        params.with_genres = numericGenreId;
        console.log(`Filtrando por género ID: ${numericGenreId}`);
      } else {
        console.log('Buscando todos los géneros (sin filtro)');
      }

      const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
        params,
        timeout: 10000
      });

      const movies = response.data.results
        .filter(movie => {
          // Solo con póster
          if (!movie.poster_path) {
            console.log(`❌ Película "${movie.title}" sin póster - excluida`);
            return false;
          }
          
          // Si hay filtro de género, verificar que la película lo tenga
          if (genreId && genreId !== 'all') {
            const numericGenreId = parseInt(genreId);
            const hasGenre = movie.genre_ids && movie.genre_ids.includes(numericGenreId);
            
            if (!hasGenre) {
              console.log(`❌ "${movie.title}" no tiene género ${numericGenreId}. Géneros: [${movie.genre_ids?.join(', ') || 'ninguno'}]`);
              return false;
            } else {
              console.log(`✅ "${movie.title}" SÍ tiene género ${numericGenreId}. Géneros: [${movie.genre_ids.join(', ')}]`);
            }
          }
          
          return true;
        })
        .slice(0, limit); // Limitar cantidad

      console.log(`Se encontraron ${movies.length} películas válidas`);

      return {
        movies: movies.map(movie => ({
          id: movie.id,
          title: movie.title,
          poster_path: movie.poster_path,
          overview: movie.overview,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genre_ids: movie.genre_ids
        })),
        total_pages: response.data.total_pages,
        total_results: response.data.total_results
      };

    } catch (error) {
      console.error('Error obteniendo películas de TMDB:', error);
      throw error;
    }
  },

  /**
   * Obtener una película aleatoria específica
   */
  async getRandomMovieByMood(mood) {
    try {
      // Manejar tanto strings como números para los IDs de género
      let genreId = MOOD_TO_GENRE[mood];
      
      // Si el mood es un número (como "10402"), usarlo directamente
      if (!genreId && !isNaN(mood)) {
        genreId = parseInt(mood);
      }
      
      console.log(`=== Buscando película para mood: ${mood} (género ID: ${genreId}) ===`);
      
      // Obtener muchas más páginas para máxima variedad
      const allMovies = [];
      const maxPages = 15; // Aumentado a 15 páginas para más variedad
      let startPage = Math.floor(Math.random() * 10) + 1; // Página inicial aleatoria (1-10)

      console.log(`🔍 Buscando en ${maxPages} páginas desde página ${startPage}`);

      for (let page = startPage; page < startPage + maxPages && page <= 20; page++) {
        console.log(`📄 Buscando página ${page}...`);
        const result = await this.getRandomMoviesByGenre(genreId, page, 20);
        console.log(`📊 Página ${page}: ${result.movies.length} películas encontradas`);
        allMovies.push(...result.movies);
        
        // Si ya tenemos suficientes películas, dejar de buscar
        if (allMovies.length >= 200) break;
      }

      if (allMovies.length === 0) {
        throw new Error('No se encontraron películas para este mood');
      }

      console.log(`📈 Total películas encontradas: ${allMovies.length}`);
      
      // Filtrar películas recientes para evitar repetición
      const availableMovies = allMovies.filter(movie => 
        !recentMovies.includes(movie.id)
      );

      // Si todas las películas disponibles son recientes, limpiar el historial
      const moviesToChooseFrom = availableMovies.length > 0 ? availableMovies : allMovies;
      
      console.log(`🔄 Películas después de filtrar repetición: ${moviesToChooseFrom.length}`);
      
      // Verificación final del género
      if (genreId && genreId !== 'all') {
        const numericGenreId = parseInt(genreId);
        const correctGenreMovies = moviesToChooseFrom.filter(movie => 
          movie.genre_ids && movie.genre_ids.includes(numericGenreId)
        );
        console.log(`✅ Películas CORRECTAMENTE filtradas para género ${numericGenreId}: ${correctGenreMovies.length}/${moviesToChooseFrom.length}`);
      }
      
      if (moviesToChooseFrom.length === 0) {
        throw new Error('No se encontraron películas disponibles');
      }

      // Seleccionar una película aleatoria
      const randomIndex = Math.floor(Math.random() * moviesToChooseFrom.length);
      const selectedMovie = moviesToChooseFrom[randomIndex];

      // Agregar al historial reciente
      recentMovies.push(selectedMovie.id);
      if (recentMovies.length > MAX_RECENT_MOVIES) {
        recentMovies.shift(); // Eliminar la más antigua
      }

      console.log(`🎬 Película seleccionada: ${selectedMovie.title}`);
      console.log(`🎭 Géneros: ${selectedMovie.genre_ids}`);
      console.log(`📊 Historial reciente: ${recentMovies.length} películas`);
      console.log(`✅ Selección completada para mood: ${mood}`);

      return {
        ...selectedMovie,
        mood: mood,
        tmdb_movie_id: selectedMovie.id // Para relacionar con calificaciones de usuarios
      };

    } catch (error) {
      console.error('Error obteniendo película aleatoria:', error);
      throw error;
    }
  },

  /**
   * Obtener géneros disponibles de TMDB
   */
  async getGenres() {
    try {
      const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
        params: TMDB_CONFIG,
        timeout: 10000
      });

      return response.data.genres;
    } catch (error) {
      console.error('Error obteniendo géneros:', error);
      throw error;
    }
  },

  /**
   * Obtener moods disponibles con sus nombres reales de TMDB
   */
  async getMoodsWithNames() {
    try {
      const genres = await this.getGenres();
      const genreMap = {};
      
      // Crear mapa de ID -> nombre
      genres.forEach(genre => {
        genreMap[genre.id] = genre.name;
      });

      // Mapear moods principales con nombres reales
      const mainMoods = [
        { id: 'all', name: ' Sorpréndeme', tmdb_name: 'Todos los géneros' },
        { id: 'comedy', name: ' Comedia', tmdb_name: genreMap[35] || 'Comedia' },
        { id: 'horror', name: ' Terror', tmdb_name: genreMap[27] || 'Terror' },
        { id: 'drama', name: ' Drama', tmdb_name: genreMap[18] || 'Drama' },
        { id: 'action', name: ' Acción', tmdb_name: genreMap[28] || 'Acción' },
        { id: 'romance', name: ' Romance', tmdb_name: genreMap[10749] || 'Romance' },
        { id: 'thriller', name: ' Thriller', tmdb_name: genreMap[53] || 'Thriller' },
        { id: 'sci-fi', name: ' Sci-Fi', tmdb_name: genreMap[878] || 'Ciencia Ficción' },
        { id: 'animation', name: ' Animación', tmdb_name: genreMap[16] || 'Animación' }
      ];

      console.log('Moods principales configurados:', mainMoods);
      console.log('Total de géneros disponibles:', genres.length);
      
      return {
        mainMoods: mainMoods,
        allGenres: genres // Todos los géneros de TMDB
      };

    } catch (error) {
      console.error('Error obteniendo moods:', error);
      // Retornar moods por defecto si hay error
      return {
        mainMoods: [
          { id: 'all', name: ' Sorpréndeme', tmdb_name: 'Todos los géneros' },
          { id: 'comedy', name: ' Comedia', tmdb_name: 'Comedia' },
          { id: 'horror', name: ' Terror', tmdb_name: 'Terror' },
          { id: 'drama', name: ' Drama', tmdb_name: 'Drama' },
          { id: 'action', name: ' Acción', tmdb_name: 'Acción' },
          { id: 'romance', name: ' Romance', tmdb_name: 'Romance' },
          { id: 'thriller', name: ' Thriller', tmdb_name: 'Thriller' },
          { id: 'sci-fi', name: ' Sci-Fi', tmdb_name: 'Ciencia Ficción' },
          { id: 'animation', name: ' Animación', tmdb_name: 'Animación' }
        ],
        allGenres: []
      };
    }
  },

  // Obtener todos los géneros disponibles para mostrar en UI
  async getAllGenresForUI() {
    try {
      const genres = await this.getGenres();
      
      // Mapear a formato para UI con iconos
      const iconMap = {
        28: 'flash-outline',      // Acción
        12: 'compass-outline',    // Aventura
        16: 'color-palette-outline', // Animación
        35: 'happy-outline',      // Comedia
        80: 'alert-outline',      // Crimen
        99: 'document-text-outline', // Documental
        18: 'film-outline',       // Drama
        10751: 'people-outline',   // Familia
        14: 'sparkles-outline',   // Fantasía
        36: 'book-outline',       // Historia
        27: 'skull-outline',      // Terror
        10402: 'musical-notes-outline', // Música
        9648: 'search-outline',    // Misterio
        10749: 'heart-outline',    // Romance
        878: 'rocket-outline',    // Ciencia Ficción
        53: 'eye-outline',        // Suspense
        10752: 'shield-outline',   // Guerra
        37: 'map-outline'         // Western
      };

      const genresForUI = genres.map(genre => ({
        id: genre.id,
        name: genre.name,
        icon: iconMap[genre.id] || 'film-outline'
      }));

      console.log('Todos los géneros para UI:', genresForUI.length);
      return genresForUI;

    } catch (error) {
      console.error('Error obteniendo todos los géneros:', error);
      return [];
    }
  }
};
