<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('training_path_modules')->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('type')->default('reading'); // reading, video, exercise, etc.
            $table->string('duration')->nullable();
            $table->longText('content')->nullable();
            $table->json('objectives')->nullable();
            $table->boolean('vm_enabled')->default(false);
            $table->string('video_url')->nullable();
            $table->json('resources')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['module_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_units');
    }
};
