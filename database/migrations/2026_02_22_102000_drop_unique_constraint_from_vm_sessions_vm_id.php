<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Drops the unique constraint on vm_id. VMs can be reused across sessions,
     * and expired sessions retain their vm_id for audit purposes.
     */
    public function up(): void
    {
        Schema::table('vm_sessions', function (Blueprint $table) {
            $table->dropUnique(['vm_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vm_sessions', function (Blueprint $table) {
            $table->unique('vm_id');
        });
    }
};
