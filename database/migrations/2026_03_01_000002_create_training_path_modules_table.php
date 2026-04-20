<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_path_modules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_path_id')->constrained('training_paths')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['training_path_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_path_modules');
    }
};
