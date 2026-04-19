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
        Schema::create('movie_forum_movies', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('tmdb_movie_id')->unique();
            $table->string('title');
            $table->string('poster_path')->nullable();
            $table->string('backdrop_path')->nullable();
            $table->date('release_date')->nullable();
            $table->timestamps();

            $table->index('title');
        });

        Schema::create('movie_forum_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_forum_movie_id')->constrained('movie_forum_movies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('reaction_type', ['like', 'dislike']);
            $table->timestamps();

            $table->unique(['movie_forum_movie_id', 'user_id'], 'mfr_movie_user_uq');
            $table->index(['movie_forum_movie_id', 'reaction_type'], 'mfr_movie_type_idx');
        });

        Schema::create('movie_forum_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_forum_movie_id')->constrained('movie_forum_movies')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->text('review');
            $table->timestamps();

            $table->index(['movie_forum_movie_id', 'created_at'], 'mfrv_movie_created_idx');
            $table->index('user_id', 'mfrv_user_idx');
        });

        Schema::create('movie_forum_review_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_forum_review_id')->constrained('movie_forum_reviews')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('reaction_type', ['like', 'dislike']);
            $table->timestamps();

            $table->unique(['movie_forum_review_id', 'user_id'], 'mfrvr_review_user_uq');
            $table->index(['movie_forum_review_id', 'reaction_type'], 'mfrvr_review_type_idx');
        });

        Schema::create('movie_forum_review_replies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('movie_forum_review_id')->constrained('movie_forum_reviews')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('parent_reply_id')->nullable()->constrained('movie_forum_review_replies')->onDelete('cascade');
            $table->text('reply');
            $table->timestamps();

            $table->index(['movie_forum_review_id', 'created_at'], 'mfrrep_review_created_idx');
            $table->index('user_id', 'mfrrep_user_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('movie_forum_review_replies');
        Schema::dropIfExists('movie_forum_review_reactions');
        Schema::dropIfExists('movie_forum_reviews');
        Schema::dropIfExists('movie_forum_reactions');
        Schema::dropIfExists('movie_forum_movies');
    }
};
