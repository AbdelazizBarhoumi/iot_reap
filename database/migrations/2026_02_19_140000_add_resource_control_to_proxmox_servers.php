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
            // Keep indexed columns as string (not text)
            $table->string('host', 512)->change();
            $table->string('port', 50)->change();

            // Resource control limits
            $table->unsignedInteger('max_vms_per_node')
                  ->default(5)
                  ->after('verify_ssl');

            $table->unsignedInteger('max_concurrent_sessions')
                  ->default(20)
                  ->after('max_vms_per_node');

            $table->decimal('cpu_overcommit_ratio', 8, 2)
                  ->default(2.00)
                  ->after('max_concurrent_sessions');

            $table->decimal('memory_overcommit_ratio', 8, 2)
                  ->default(1.50)
                  ->after('cpu_overcommit_ratio');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proxmox_servers', function (Blueprint $table) {
            $table->string('host')->change();
            $table->integer('port')->change();

            $table->dropColumn([
                'max_vms_per_node',
                'max_concurrent_sessions',
                'cpu_overcommit_ratio',
                'memory_overcommit_ratio',
            ]);
        });
    }
};
