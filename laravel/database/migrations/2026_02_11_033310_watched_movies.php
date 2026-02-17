<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('watched_movies', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('tmdb_movie_id'); // TMDB movie ID
            $table->string('title', 200)->nullable(); // Título de la película
            $table->integer('rating')->nullable(); // Calificación del usuario (1-5)
            $table->date('watched_date')->nullable();
            $table->primary(['user_id', 'tmdb_movie_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
