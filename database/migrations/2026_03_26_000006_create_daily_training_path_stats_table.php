<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the daily_training_path_stats table with all columns.
     */
    public function up(): void
    {
        Schema::create('daily_training_path_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_path_id')->constrained('training_paths')->cascadeOnDelete();
            $table->date('date');
            $table->unsignedInteger('enrollments')->default(0);
            $table->unsignedInteger('completions')->default(0);
            $table->unsignedInteger('active_students')->default(0);
            $table->unsignedInteger('training_units_viewed')->default(0);
            $table->unsignedInteger('video_minutes_watched')->default(0);
            $table->unsignedInteger('quiz_attempts')->default(0);
            $table->unsignedInteger('quiz_passes')->default(0);
            $table->unsignedInteger('revenue_cents')->default(0);
            $table->timestamps();

            $table->unique(['training_path_id', 'date']);
            $table->index(['date', 'training_path_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('daily_training_path_stats');
    }
};
