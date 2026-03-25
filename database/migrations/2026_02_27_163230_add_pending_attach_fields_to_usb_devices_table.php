<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('usb_devices', function (Blueprint $table) {
            // Fields to track pending attachment for stopped VMs
            // When a VM is stopped, we save attachment intent and auto-attach when VM starts
            $table->integer('pending_vmid')->nullable()->after('usbip_port');
            $table->string('pending_node')->nullable()->after('pending_vmid');
            $table->foreignId('pending_server_id')->nullable()->after('pending_node')
                ->constrained('proxmox_servers')->nullOnDelete();
            $table->string('pending_vm_ip')->nullable()->after('pending_server_id');
            $table->string('pending_vm_name')->nullable()->after('pending_vm_ip');
            $table->timestamp('pending_since')->nullable()->after('pending_vm_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('usb_devices', function (Blueprint $table) {
            $table->dropForeign(['pending_server_id']);
            $table->dropColumn([
                'pending_vmid',
                'pending_node',
                'pending_server_id',
                'pending_vm_ip',
                'pending_vm_name',
                'pending_since',
            ]);
        });
    }
};
