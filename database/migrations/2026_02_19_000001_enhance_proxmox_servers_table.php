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
        Schema::table('proxmox_servers', function (Blueprint $table) {
            // Add new columns if they don't exist
            if (! Schema::hasColumn('proxmox_servers', 'realm')) {
                $table->string('realm')->default('pam')->after('port');
            }
            if (! Schema::hasColumn('proxmox_servers', 'verify_ssl')) {
                $table->boolean('verify_ssl')->default(true)->after('token_secret');
            }
            if (! Schema::hasColumn('proxmox_servers', 'created_by')) {
                $table->foreignUlid('created_by')->nullable()->constrained('users')->onDelete('set null')->after('is_active');
                $table->index('created_by');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proxmox_servers', function (Blueprint $table) {
            if (Schema::hasColumn('proxmox_servers', 'created_by')) {
                $table->dropForeignIdColumns('created_by');
            }
            if (Schema::hasColumn('proxmox_servers', 'verify_ssl')) {
                $table->dropColumn('verify_ssl');
            }
            if (Schema::hasColumn('proxmox_servers', 'realm')) {
                $table->dropColumn('realm');
            }
        });
    }
};
