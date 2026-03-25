<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Allow cameras to be linked to USB devices from gateway nodes.
 * This enables converting USB webcams to full Camera entities
 * that work with the streaming and session control system.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cameras', function (Blueprint $table) {
            // Make robot_id nullable - USB cameras from gateways don't have a robot
            $table->foreignId('robot_id')
                ->nullable()
                ->change();

            // Add gateway_node_id for USB cameras that come from gateways
            $table->foreignId('gateway_node_id')
                ->nullable()
                ->after('robot_id')
                ->constrained('gateway_nodes')
                ->nullOnDelete();

            // Link to the USB device this camera was created from
            $table->foreignId('usb_device_id')
                ->nullable()
                ->after('gateway_node_id')
                ->constrained('usb_devices')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cameras', function (Blueprint $table) {
            $table->dropConstrainedForeignId('usb_device_id');
            $table->dropConstrainedForeignId('gateway_node_id');

            // Note: reverting robot_id to non-nullable would require data cleanup
        });
    }
};
