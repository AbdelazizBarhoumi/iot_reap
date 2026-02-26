<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * USB Device Reservations:
     * - Users request reservations for specific date/time/duration
     * - Admins can approve, modify duration, or reject
     * - Approved reservations block the device during that time
     * - Admin can also create reservations to block devices
     */
    public function up(): void
    {
        Schema::create('usb_device_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usb_device_id')->constrained('usb_devices')->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('approved_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Status: pending, approved, rejected, cancelled, completed, active
            $table->string('status')->default('pending');
            
            // Requested schedule
            $table->dateTime('requested_start_at');
            $table->dateTime('requested_end_at');
            
            // Approved schedule (may differ from requested if admin modifies)
            $table->dateTime('approved_start_at')->nullable();
            $table->dateTime('approved_end_at')->nullable();
            
            // Actual usage times
            $table->dateTime('actual_start_at')->nullable();
            $table->dateTime('actual_end_at')->nullable();
            
            // Purpose/notes
            $table->text('purpose')->nullable();
            $table->text('admin_notes')->nullable();
            
            // Priority (for conflicts)
            $table->integer('priority')->default(0);
            
            $table->timestamps();
            
            // Index for finding reservations by time range
            $table->index(['usb_device_id', 'status', 'approved_start_at', 'approved_end_at'], 'idx_device_reservations_schedule');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('usb_device_reservations');
    }
};
