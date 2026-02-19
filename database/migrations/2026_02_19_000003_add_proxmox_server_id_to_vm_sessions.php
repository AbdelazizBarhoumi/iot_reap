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
        Schema::table('vm_sessions', function (Blueprint $table) {
            if (! Schema::hasColumn('vm_sessions', 'proxmox_server_id')) {
                $table->foreignId('proxmox_server_id')
                    ->nullable()
                    ->constrained('proxmox_servers')
                    ->onDelete('restrict')
                    ->after('template_id');
                $table->index('proxmox_server_id');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vm_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('vm_sessions', 'proxmox_server_id')) {
                $table->dropForeignIdColumns('proxmox_server_id');
            }
        });
    }
};
