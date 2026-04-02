<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_course_stats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->unsignedInteger('enrollments')->default(0);
            $table->unsignedInteger('completions')->default(0);
            $table->unsignedInteger('active_students')->default(0);
            $table->unsignedInteger('lessons_viewed')->default(0);
            $table->unsignedInteger('video_minutes_watched')->default(0);
            $table->unsignedInteger('quiz_attempts')->default(0);
            $table->unsignedInteger('quiz_passes')->default(0);
            $table->unsignedInteger('revenue_cents')->default(0);
            $table->timestamps();

            $table->unique(['course_id', 'date']);
            $table->index(['date', 'course_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_course_stats');
    }
};
