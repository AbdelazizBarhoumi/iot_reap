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
        // First truncate any port values longer than 512 chars to prevent data loss
        // Use a database-agnostic approach; the original raw SQL worked on MySQL
        // but fails under SQLite (the default for tests).  Detect the driver and
        // perform the appropriate update.
        $driver = \Illuminate\Support\Facades\DB::getDriverName();
        if ($driver === 'sqlite') {
            \Illuminate\Support\Facades\DB::table('proxmox_servers')
                ->whereRaw('LENGTH(port) > 512')
                ->update(['port' => \Illuminate\Support\Facades\DB::raw('substr(port,1,512)')]);
        } else {
            \Illuminate\Support\Facades\DB::statement(
                'UPDATE proxmox_servers SET port = LEFT(port, 512) WHERE CHAR_LENGTH(port) > 512'
            );
        }

        Schema::table('proxmox_servers', function (Blueprint $table) {
            // Keep indexed columns as string (not text)
            $table->string('host', 512)->change();
            $table->string('port', 512)->change();

            // Resource control limits — only add if not already present
            if (!Schema::hasColumn('proxmox_servers', 'max_vms_per_node')) {
                $table->unsignedInteger('max_vms_per_node')
                      ->default(5)
                      ->after('verify_ssl');
            }

            if (!Schema::hasColumn('proxmox_servers', 'max_concurrent_sessions')) {
                $table->unsignedInteger('max_concurrent_sessions')
                      ->default(20)
                      ->after('max_vms_per_node');
            }

            if (!Schema::hasColumn('proxmox_servers', 'cpu_overcommit_ratio')) {
                $table->decimal('cpu_overcommit_ratio', 8, 2)
                      ->default(2.00)
                      ->after('max_concurrent_sessions');
            }

            if (!Schema::hasColumn('proxmox_servers', 'memory_overcommit_ratio')) {
                $table->decimal('memory_overcommit_ratio', 8, 2)
                      ->default(1.50)
                      ->after('cpu_overcommit_ratio');
            }
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
