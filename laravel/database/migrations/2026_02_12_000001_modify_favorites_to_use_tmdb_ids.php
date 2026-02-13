<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Modificar tablas para usar TMDB IDs directamente
     */
    public function up(): void
    {
        // Recrear user_favorite_directors para usar tmdb_director_id
        Schema::dropIfExists('user_favorite_directors');
        Schema::create('user_favorite_directors', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('tmdb_director_id'); // ID de TMDB, no FK
            $table->string('name', 150); // Nombre del director
            $table->primary(['user_id', 'tmdb_director_id']);
            $table->index('user_id');
        });

        // Recrear watched_movies para usar tmdb_movie_id
        Schema::dropIfExists('watched_movies');
        Schema::create('watched_movies', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('tmdb_movie_id'); // ID de TMDB, no FK
            $table->string('title', 200); // Título de la película
            $table->date('watched_date')->nullable();
            $table->integer('rating')->nullable(); // Rating opcional 1-5
            $table->primary(['user_id', 'tmdb_movie_id']);
            $table->index('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Restaurar estructuras originales
        Schema::dropIfExists('user_favorite_directors');
        Schema::create('user_favorite_directors', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('director_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'director_id']);
        });

        Schema::dropIfExists('watched_movies');
        Schema::create('watched_movies', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('movie_id')->constrained()->onDelete('cascade');
            $table->date('watched_date')->nullable();
            $table->primary(['user_id', 'movie_id']);
        });
    }
};
