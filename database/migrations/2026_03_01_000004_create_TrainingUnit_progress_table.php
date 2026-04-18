<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_unit_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('training_unit_id')->constrained('training_units')->onDelete('cascade');
            $table->string('status')->default('not_started'); // not_started, in_progress, completed, paused
            $table->unsignedInteger('progress_percentage')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('time_spent_seconds')->default(0);
            
            // Video tracking
            $table->unsignedInteger('video_watch_percentage')->default(0);
            $table->unsignedInteger('video_position_seconds')->default(0);
            
            // TrainingUnit type tracking
            $table->boolean('completed')->default(false);
            $table->boolean('quiz_passed')->default(false);
            $table->boolean('article_read')->default(false);
            $table->timestamp('article_read_at')->nullable();
            
            $table->timestamps();

            $table->unique(['user_id', 'training_unit_id']);
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_unit_progress');
    }
};
