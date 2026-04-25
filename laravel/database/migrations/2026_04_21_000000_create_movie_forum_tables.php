<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        
        Schema::create('movie_forum_reactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('movie_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('reaction_type', ['like', 'dislike']);
            $table->timestamps();
            $table->unique(['movie_id', 'user_id'], 'mf_reactions_unique');
            $table->foreign('movie_id')->references('id')->on('movies')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('movie_forum_reviews', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('movie_id');
            $table->unsignedBigInteger('user_id');
            $table->text('review');
            $table->timestamps();
            $table->foreign('movie_id')->references('id')->on('movies')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('movie_forum_review_reactions', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('movie_forum_review_id');
            $table->unsignedBigInteger('user_id');
            $table->enum('reaction_type', ['like', 'dislike']);
            $table->timestamps();
            $table->unique(['movie_forum_review_id', 'user_id'], 'mf_review_reactions_unique');
            $table->foreign('movie_forum_review_id')->references('id')->on('movie_forum_reviews')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::create('movie_forum_review_replies', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('movie_forum_review_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('parent_reply_id')->nullable();
            $table->text('reply');
            $table->timestamps();
            $table->foreign('movie_forum_review_id')->references('id')->on('movie_forum_reviews')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('parent_reply_id')->references('id')->on('movie_forum_review_replies')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('movie_forum_review_replies');
        Schema::dropIfExists('movie_forum_review_reactions');
        Schema::dropIfExists('movie_forum_reviews');
        Schema::dropIfExists('movie_forum_reactions');
    }
};
