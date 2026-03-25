<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cameras', function (Blueprint $table) {
            $table->id();
            $table->foreignId('robot_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('name');
            $table->string('stream_key')->unique();          // used in MediaMTX path
            $table->string('source_url');                     // rtsp://... or /dev/video0
            $table->string('type')->default('esp32_cam');     // CameraType enum
            $table->string('status')->default('inactive');    // CameraStatus enum
            $table->boolean('ptz_capable')->default(false);   // can this camera pan/tilt?
            $table->boolean('recording_enabled')->default(false);
            $table->boolean('detection_enabled')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cameras');
    }
};
