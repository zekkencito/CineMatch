// Script para probar el servicio TMDB
import { tmdbRandomService } from './src/services/tmdbRandomService';

async function testTMDB() {
  console.log('=== Probando servicio TMDB ===\n');
  
  try {
    // 1. Probar obtener géneros
    console.log('1. Obteniendo géneros...');
    const genres = await tmdbRandomService.getGenres();
    console.log('Géneros encontrados:', genres.length);
    console.log('Primeros 5 géneros:', genres.slice(0, 5));
    
    // 2. Probar obtener moods
    console.log('\n2. Obteniendo moods...');
    const moods = await tmdbRandomService.getMoodsWithNames();
    console.log('Moods configurados:', moods);
    
    // 3. Probar obtener película aleatoria por mood
    console.log('\n3. Obteniendo película aleatoria (comedy)...');
    const comedyMovie = await tmdbRandomService.getRandomMovieByMood('comedy');
    console.log('Película de comedia:', comedyMovie.title);
    
    // 4. Probar obtener película aleatoria (todos)
    console.log('\n4. Obteniendo película aleatoria (all)...');
    const randomMovie = await tmdbRandomService.getRandomMovieByMood('all');
    console.log('Película aleatoria:', randomMovie.title);
    
    console.log('\n=== Prueba completada exitosamente ===');
    
  } catch (error) {
    console.error('Error en la prueba:', error);
  }
}

// Ejecutar prueba
testTMDB();
