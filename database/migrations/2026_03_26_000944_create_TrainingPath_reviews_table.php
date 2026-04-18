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
        Schema::create('training_path_reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_path_id')->constrained('training_paths')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('rating')->comment('1-5 star rating');
            $table->text('review')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->timestamps();

            $table->unique(['training_path_id', 'user_id']);
            $table->index(['training_path_id', 'rating']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_path_reviews');
    }
};
