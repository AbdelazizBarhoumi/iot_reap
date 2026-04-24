<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usb_devices', function (Blueprint $table) {
            $table->string('serial')->nullable()->after('product_id');
            $table->index(['gateway_node_id', 'serial'], 'idx_usb_device_serial');
        });
    }

    public function down(): void
    {
        Schema::table('usb_devices', function (Blueprint $table) {
            $table->dropIndex('idx_usb_device_serial');
            $table->dropColumn('serial');
        });
    }
};