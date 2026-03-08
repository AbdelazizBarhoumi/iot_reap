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
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('engineer', 'teacher', 'admin', 'security_officer') NOT NULL DEFAULT 'engineer'");
        }
        // SQLite doesn't enforce enum constraints so no ALTER needed —
        // the base migration already has 'teacher' in the enum list for fresh installs.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE users MODIFY COLUMN role ENUM('engineer', 'admin', 'security_officer') NOT NULL DEFAULT 'engineer'");
        }
    }
};
