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
        Schema::create('subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('plan', ['free', 'premium'])->default('free');
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->integer('max_radius')->default(50); // Radio máximo en km
            $table->integer('daily_likes_limit')->default(10); // Límites de likes diarios
            $table->boolean('can_see_likes')->default(false); // Ver quién te dio like
            $table->boolean('can_undo_swipes')->default(false); // Deshacer swipes
            $table->boolean('has_advanced_filters')->default(false); // Filtros avanzados
            $table->boolean('is_featured')->default(false); // Perfil destacado
            $table->timestamps();
            
            $table->index('user_id');
            $table->index(['status', 'plan']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subscriptions');
    }
};
