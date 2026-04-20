<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Add target_user_id column to reservations table.
     * This tracks which user an admin reservation was created for (in reserve_to_user mode).
     */
    public function up(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->foreignUlid('target_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete()
                ->after('target_vm_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reservations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('target_user_id');
        });
    }
};
