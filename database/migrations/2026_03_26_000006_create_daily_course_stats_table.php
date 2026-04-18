<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_trainingPath_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('trainingPath_id')->constrained('training_paths')->onDelete('cascade');
            $table->date('date');
            $table->unsignedInteger('enrollments')->default(0);
            $table->unsignedInteger('completions')->default(0);
            $table->unsignedInteger('active_students')->default(0);
            $table->unsignedInteger('trainingUnits_viewed')->default(0);
            $table->unsignedInteger('video_minutes_watched')->default(0);
            $table->unsignedInteger('quiz_attempts')->default(0);
            $table->unsignedInteger('quiz_passes')->default(0);
            $table->unsignedInteger('revenue_cents')->default(0);
            $table->timestamps();

            $table->unique(['trainingPath_id', 'date']);
            $table->index(['date', 'trainingPath_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_trainingPath_stats');
    }
};
