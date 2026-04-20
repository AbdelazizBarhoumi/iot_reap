<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the training_unit_notes table with all columns.
     */
    public function up(): void
    {
        Schema::create('training_unit_notes', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('training_unit_id')->constrained('training_units')->cascadeOnDelete();
            $table->text('content');
            $table->unsignedInteger('timestamp_seconds')->nullable()->comment('Video timestamp in seconds');
            $table->timestamps();

            $table->index(['user_id', 'training_unit_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('training_unit_notes');
    }
};
