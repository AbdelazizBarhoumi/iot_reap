<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
            $table->unsignedInteger('price_cents')->default(0);
            $table->string('currency', 3)->default('USD');
            $table->boolean('is_free')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->unsignedInteger('featured_order')->nullable();
            $table->timestamp('featured_at')->nullable();
            $table->enum('status', ['draft', 'pending_review', 'approved', 'rejected', 'archived'])->default('draft');
            $table->enum('video_type', ['upload', 'youtube'])->nullable();
            $table->string('video_url')->nullable();
            $table->text('admin_feedback')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index('instructor_id');
            $table->index('category');
            $table->index(['is_featured', 'featured_order']);
        });

        if (DB::getDriverName() === 'mysql') {
            Schema::table('courses', function (Blueprint $table) {
                $table->fullText(['title', 'description'], 'courses_fulltext');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
