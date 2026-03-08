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
            // URL of the camera streaming API on the associated Proxmox node
            // Example: http://192.168.50.4:8001
            $table->string('proxmox_camera_api_url')->nullable()->after('proxmox_node');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gateway_nodes', function (Blueprint $table) {
            $table->dropColumn('proxmox_camera_api_url');
        });
    }
};
