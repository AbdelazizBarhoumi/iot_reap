<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Consolidated migration for guacamole_connection_preferences.
     * Includes:
     * - profile_name, is_default columns (from 2026_02_22_103425)
     * - Updated unique constraint for multiple profiles per protocol
     */
    public function up(): void
    {
        Schema::create('guacamole_connection_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            // Protocol type: 'rdp', 'vnc', 'ssh'
            $table->string('vm_session_type', 10);
            // Profile name for multiple profiles per protocol
            $table->string('profile_name', 100)->default('Default');
            $table->boolean('is_default')->default(true);
            // Stores all user-configurable Guacamole connection parameters as JSON
            $table->json('parameters');
            $table->timestamps();

            // One preference set per user per protocol per profile name
            $table->unique(['user_id', 'vm_session_type', 'profile_name'], 'gcp_user_protocol_profile_idx');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('guacamole_connection_preferences');
    }
};
