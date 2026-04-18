<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_path_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('training_path_id')->constrained('training_paths')->onDelete('cascade');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamp('completed_at')->nullable();
            $table->unsignedInteger('progress_percentage')->default(0);
            $table->timestamps();

            $table->unique(['user_id', 'training_path_id']);
            $table->index(['training_path_id', 'enrolled_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_path_enrollments');
    }
};
