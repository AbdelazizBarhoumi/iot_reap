<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('module_id')->constrained('course_modules')->cascadeOnDelete();
            $table->string('title');
            $table->enum('type', ['video', 'reading', 'practice', 'vm-lab'])->default('video');
            $table->string('duration')->nullable(); // e.g., "15 min"
            $table->text('content')->nullable();
            $table->json('objectives')->nullable(); // Array of strings
            $table->boolean('vm_enabled')->default(false);
            $table->string('video_url')->nullable();
            $table->json('resources')->nullable(); // Array of resource links
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['module_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
