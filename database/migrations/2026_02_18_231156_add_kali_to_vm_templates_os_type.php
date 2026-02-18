<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Handle different database drivers
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite doesn't support ENUM, so we just use string validation at app level
            // The column is already created as string-like in SQLite
            return;
        }

        // MySQL: Alter the enum to include 'kali'
        DB::statement("ALTER TABLE vm_templates MODIFY COLUMN os_type ENUM('windows', 'linux', 'kali') DEFAULT 'linux'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            return;
        }

        DB::statement("ALTER TABLE vm_templates MODIFY COLUMN os_type ENUM('windows', 'linux') DEFAULT 'linux'");
    }
};
