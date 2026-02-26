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
        Schema::table('gateway_nodes', function (Blueprint $table) {
            // Whether this gateway has been verified/enabled by admin
            $table->boolean('is_verified')->default(false)->after('online');
            // Optional reference to Proxmox container (for auto-discovered gateways)
            $table->string('proxmox_vmid')->nullable()->after('is_verified');
            $table->string('proxmox_node')->nullable()->after('proxmox_vmid');
            // Description for admin notes
            $table->text('description')->nullable()->after('proxmox_node');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gateway_nodes', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'proxmox_vmid', 'proxmox_node', 'description']);
        });
    }
};
