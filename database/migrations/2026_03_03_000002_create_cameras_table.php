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
                ->nullable()
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('gateway_node_id')->nullable()->constrained('gateway_nodes')->nullOnDelete();
            $table->foreignId('usb_device_id')->nullable()->constrained('usb_devices')->nullOnDelete();
            $table->string('name');
            $table->text('admin_description')->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_notes')->nullable();
            $table->timestamp('maintenance_until')->nullable();
            $table->string('stream_key')->unique();          // used in MediaMTX path
            $table->string('source_url');                     // rtsp://... or /dev/video0
            $table->unsignedSmallInteger('stream_width')->default(640);
            $table->unsignedSmallInteger('stream_height')->default(480);
            $table->unsignedTinyInteger('stream_framerate')->default(15);
            $table->string('stream_input_format', 20)->default('mjpeg');
            $table->string('type')->default('esp32_cam');     // CameraType enum
            $table->string('status')->default('inactive');    // CameraStatus enum
            $table->boolean('ptz_capable')->default(false);   // can this camera pan/tilt?
            $table->boolean('recording_enabled')->default(false);
            $table->boolean('detection_enabled')->default(false);
            // Proxmox VM numeric ID (vm_sessions.vm_id), not vm_sessions primary ULID.
            $table->unsignedInteger('assigned_vm_id')->nullable()->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cameras');
    }
};
