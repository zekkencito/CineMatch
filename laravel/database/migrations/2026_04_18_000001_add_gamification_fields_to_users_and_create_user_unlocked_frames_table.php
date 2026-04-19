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
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('current_streak')->default(0)->after('is_admin');
            $table->unsignedInteger('best_streak')->default(0)->after('current_streak');
            $table->date('last_active_date')->nullable()->after('best_streak');
            $table->string('equipped_frame', 50)->nullable()->after('last_active_date');
            $table->unsignedInteger('total_activities')->default(0)->after('equipped_frame');
        });

        Schema::create('user_unlocked_frames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('frame_id', 50);
            $table->timestamp('unlocked_at')->useCurrent();
            $table->timestamps();

            $table->unique(['user_id', 'frame_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_unlocked_frames');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'current_streak',
                'best_streak',
                'last_active_date',
                'equipped_frame',
                'total_activities',
            ]);
        });
    }
};
