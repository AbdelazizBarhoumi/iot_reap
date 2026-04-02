<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lesson_id')->constrained()->onDelete('cascade');
            $table->json('content');
            $table->unsignedInteger('word_count')->default(0);
            $table->unsignedInteger('estimated_read_time_minutes')->default(1);
            $table->timestamps();

            $table->unique('lesson_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
