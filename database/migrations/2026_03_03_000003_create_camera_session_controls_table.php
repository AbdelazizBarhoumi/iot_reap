<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camera_session_controls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('camera_id')
                  ->constrained()
                  ->cascadeOnDelete();
            $table->foreignUlid('session_id')
                  ->constrained('vm_sessions')
                  ->cascadeOnDelete();
            $table->timestamp('acquired_at');
            $table->timestamp('released_at')->nullable();
            $table->timestamps();

            // Only one active (unreleased) control per camera at a time
            $table->unique(['camera_id', 'released_at'], 'unique_active_camera_control');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camera_session_controls');
    }
};
