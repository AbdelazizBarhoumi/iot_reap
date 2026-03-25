<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add maintenance fields to USB devices
        Schema::table('usb_devices', function (Blueprint $table) {
            $table->text('admin_description')->nullable()->after('name');
            $table->boolean('maintenance_mode')->default(false)->after('admin_description');
            $table->text('maintenance_notes')->nullable()->after('maintenance_mode');
            $table->timestamp('maintenance_until')->nullable()->after('maintenance_notes');
        });

        // Add maintenance fields to cameras
        Schema::table('cameras', function (Blueprint $table) {
            $table->text('admin_description')->nullable()->after('name');
            $table->boolean('maintenance_mode')->default(false)->after('admin_description');
            $table->text('maintenance_notes')->nullable()->after('maintenance_mode');
            $table->timestamp('maintenance_until')->nullable()->after('maintenance_notes');
        });
    }

    public function down(): void
    {
        Schema::table('usb_devices', function (Blueprint $table) {
            $table->dropColumn(['admin_description', 'maintenance_mode', 'maintenance_notes', 'maintenance_until']);
        });

        Schema::table('cameras', function (Blueprint $table) {
            $table->dropColumn(['admin_description', 'maintenance_mode', 'maintenance_notes', 'maintenance_until']);
        });
    }
};
