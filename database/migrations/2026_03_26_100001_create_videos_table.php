<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('videos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_unit_id')->constrained('training_units')->onDelete('cascade');
            $table->string('original_filename');
            $table->string('storage_path');
            $table->string('storage_disk')->default('local');
            $table->unsignedInteger('duration_seconds')->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->string('mime_type')->nullable();
            $table->enum('status', ['pending', 'processing', 'ready', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('hls_path')->nullable(); // Path to master.m3u8
            $table->json('available_qualities')->nullable(); // ['360p', '720p', '1080p']
            $table->unsignedInteger('resolution_width')->nullable();
            $table->unsignedInteger('resolution_height')->nullable();
            $table->timestamps();

            $table->index('training_unit_id');
            $table->index('status');
        });

        Schema::create('captions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('video_id')->constrained()->onDelete('cascade');
            $table->string('language', 10); // 'en', 'ar', 'fr', etc.
            $table->string('label'); // "English", "Arabic", etc.
            $table->string('file_path');
            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('video_id');
            $table->unique(['video_id', 'language']);
        });

        Schema::create('video_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('video_id')->constrained()->onDelete('cascade');
            $table->unsignedInteger('watched_seconds')->default(0);
            $table->unsignedInteger('total_watch_time')->default(0); // Cumulative watch time
            $table->boolean('completed')->default(false);
            $table->timestamp('last_watched_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'video_id']);
            $table->index(['user_id', 'completed']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('video_progress');
        Schema::dropIfExists('captions');
        Schema::dropIfExists('videos');
    }
};
