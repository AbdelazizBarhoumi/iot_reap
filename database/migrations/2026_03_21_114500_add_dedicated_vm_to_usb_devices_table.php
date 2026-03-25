<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add dedicated VM fields to USB devices.
 *
 * This allows a USB device to be permanently assigned to a specific VM
 * (identified by VID:PID, not port). When the VM starts, the device
 * will be automatically attached. When the VM stops, the device returns
 * to bound state but remembers its dedicated assignment.
 *
 * Unlike pending_vmid (which is cleared after attachment), dedicated_vmid
 * persists permanently and survives reboots.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usb_devices', function (Blueprint $table) {
            // Permanent VM dedication — survives reboots, auto-attaches on VM start
            $table->integer('dedicated_vmid')->nullable()->after('pending_since');
            $table->string('dedicated_node')->nullable()->after('dedicated_vmid');
            $table->foreignId('dedicated_server_id')->nullable()->after('dedicated_node')
                ->constrained('proxmox_servers')
                ->nullOnDelete();

            // Index for finding dedicated devices for a VM
            $table->index(['dedicated_vmid', 'dedicated_server_id'], 'idx_usb_dedicated_vm');
        });
    }

    public function down(): void
    {
        Schema::table('usb_devices', function (Blueprint $table) {
            $table->dropIndex('idx_usb_dedicated_vm');
            $table->dropForeign(['dedicated_server_id']);
            $table->dropColumn([
                'dedicated_vmid',
                'dedicated_node',
                'dedicated_server_id',
            ]);
        });
    }
};
