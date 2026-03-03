<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->foreignUlid('instructor_id')->constrained('users')->cascadeOnDelete();
            $table->string('thumbnail')->nullable();
            $table->string('category');
            $table->enum('level', ['Beginner', 'Intermediate', 'Advanced'])->default('Beginner');
            $table->string('duration')->nullable(); // e.g., "48 hours"
            $table->decimal('rating', 2, 1)->default(0);
            $table->boolean('has_virtual_machine')->default(false);
            $table->enum('status', ['draft', 'pending_review', 'approved', 'rejected'])->default('draft');
            $table->text('admin_feedback')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'created_at']);
            $table->index('instructor_id');
            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
