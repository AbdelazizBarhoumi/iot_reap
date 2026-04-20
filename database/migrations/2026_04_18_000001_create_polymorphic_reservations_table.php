<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Create a single polymorphic reservations table to replace:
     * - camera_reservations
     * - usb_device_reservations
     *
     * This reduces code duplication and makes it easy to add more
     * reservation types in the future (robots, etc).
     */
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();

            // Polymorphic relationship (camera or usb_device)
            $table->morphs('reservable');

            // Users and approval
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('approved_by')->nullable()->constrained('users')->nullOnDelete();

            // Status: pending, approved, rejected, cancelled, active, completed
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

            // Target VM reference for future direct VM booking
            $table->unsignedInteger('target_vm_id')->nullable();

            $table->timestamps();

            // Indexes for finding reservations by time range and VM
            $table->index(['reservable_type', 'reservable_id', 'status', 'approved_start_at', 'approved_end_at'], 'idx_reservations_schedule');
            $table->index(['target_vm_id', 'status'], 'idx_reservations_target_vm_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};
