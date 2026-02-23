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
            if (Schema::hasColumn('vm_sessions', 'session_type')) {
                $table->dropColumn('session_type');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vm_sessions', function (Blueprint $table) {
            if (! Schema::hasColumn('vm_sessions', 'session_type')) {
                $table->enum('session_type', ['ephemeral', 'persistent'])->default('ephemeral');
            }
        });
    }
};
