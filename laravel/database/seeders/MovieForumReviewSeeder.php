<?php

namespace Database\Seeders;

use App\Models\Movie;
use App\Models\MovieForumReview;
use App\Models\MovieForumReaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class MovieForumReviewSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener usuarios y películas
        $users = User::take(5)->get();
        $movies = Movie::take(5)->get();

        if ($users->isEmpty() || $movies->isEmpty()) {
            echo "No hay usuarios o películas suficientes para crear reseñas\n";
            return;
        }

        // Crear reseñas de ejemplo
        $reviews = [
            [
                'movie_id' => $movies[0]->id, // Inception
                'user_id' => $users[0]->id,
                'review' => 'Inception es una obra maestra de Christopher Nolan. La forma en que juega con los sueños dentro de sueños es simplemente genial. La actuación de Leonardo DiCaprio es excepcional y los efectos visuales son impresionantes. Definitivamente una película que debes ver varias veces para entenderla completamente.'
            ],
            [
                'movie_id' => $movies[1]->id, // Titanic
                'user_id' => $users[1]->id,
                'review' => 'Titanic es una película épica que mezcla romance y drama de una manera increíble. La química entre Leonardo DiCaprio y Kate Winslet es inolvidable. Aunque es larga, cada minuto vale la pena. La recreación del hundimiento es espectacular y emocionante.'
            ],
            [
                'movie_id' => $movies[2]->id, // The Conjuring
                'user_id' => $users[2]->id,
                'review' => 'Como amante del terror, The Conjuring es una de las mejores películas de terror moderno. No depende de sustos baratos, sino que crea una atmósfera tensa y aterradora. La historia basada en hechos reales la hace aún más impactante. Recomendado para los verdaderos fanáticos del género.'
            ],
            [
                'movie_id' => $movies[3]->id, // Avengers: Endgame
                'user_id' => $users[3]->id,
                'review' => 'Endgame es el culmen de 11 años del MCU. Es una celebración épica de todos los superhéroes que hemos llegado a amar. La batalla final es simplemente espectacular y emocional. Prepárate para reír, llorar y emocionarte. Es el final perfecto para esta fase del universo Marvel.'
            ],
            [
                'movie_id' => $movies[4]->id, // Interstellar
                'user_id' => $users[4]->id,
                'review' => 'Interstellar es otra joya de Nolan. La ciencia detrás de la historia es fascinante y la relación padre-hija es el corazón de la película. Los efectos visuales de los agujeros negros son increíbles. Es una película que te hace pensar y sentir al mismo tiempo.'
            ],
        ];

        // Crear las reseñas
        foreach ($reviews as $reviewData) {
            $review = MovieForumReview::create($reviewData);
            
            // Agregar algunas reacciones aleatorias
            $otherUsers = $users->where('id', '!=', $reviewData['user_id'])->take(3);
            
            foreach ($otherUsers as $user) {
                MovieForumReaction::create([
                    'movie_id' => $reviewData['movie_id'],
                    'user_id' => $user->id,
                    'reaction_type' => rand(0, 1) ? 'like' : 'dislike'
                ]);
            }
        }

        echo "Reseñas del foro creadas exitosamente\n";
    }
}
