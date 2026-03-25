<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * USB Device Queue:
     * When a device is attached to another session, users can join a queue.
     * When the device is released, the next user in queue can attach it.
     */
    public function up(): void
    {
        Schema::create('usb_device_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usb_device_id')->constrained('usb_devices')->cascadeOnDelete();
            $table->foreignUlid('session_id')->constrained('vm_sessions')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->integer('position');  // Queue position (1 = next in line)
            $table->timestamp('queued_at');
            $table->timestamp('notified_at')->nullable();  // When user was notified device is available
            $table->timestamps();

            // Ensure unique position per device
            $table->unique(['usb_device_id', 'position']);
            // Each session can only queue once per device
            $table->unique(['usb_device_id', 'session_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usb_device_queue');
    }
};
