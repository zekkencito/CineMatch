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
            // Link to subscription_plans table
            $table->foreignId('subscription_plan_id')->nullable()->constrained('subscription_plans')->onDelete('set null');

            // Backwards-compatible fields for older code
            $table->enum('plan', ['free', 'premium'])->default('free');
            $table->enum('status', ['active', 'cancelled', 'expired'])->default('active');

            // Fields expected by UserSeeder
            $table->timestamp('start_date')->nullable();
            $table->timestamp('end_date')->nullable();
            $table->boolean('is_active')->default(false);

            // Optional feature flags and limits
            $table->integer('max_radius')->default(50); // Radio máximo en km
            $table->integer('daily_likes_limit')->default(10); // Límites de likes diarios
            $table->boolean('can_see_likes')->default(false); // Ver quién te dio like
            $table->boolean('can_undo_swipes')->default(false); // Deshacer swipes
            $table->boolean('has_advanced_filters')->default(false); // Filtros avanzados
            $table->boolean('is_featured')->default(false); // Perfil destacado

            $table->timestamps();

            $table->index('user_id');
            $table->index(['status', 'plan']);
            $table->index('subscription_plan_id');
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
