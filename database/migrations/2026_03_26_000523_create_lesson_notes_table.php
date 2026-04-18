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
        Schema::create('trainingUnit_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('trainingUnit_id')->constrained('training_units')->cascadeOnDelete();
            $table->text('content');
            $table->unsignedInteger('timestamp_seconds')->nullable()->comment('Video timestamp in seconds');
            $table->timestamps();

            $table->index(['user_id', 'trainingUnit_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trainingUnit_notes');
    }
};
