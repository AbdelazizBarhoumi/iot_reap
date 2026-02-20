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
        Schema::create('guacamole_connection_preferences', function (Blueprint $table) {
            $table->id();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            // vm_session_type corresponds to the VM template protocol: 'rdp', 'vnc', 'ssh'
            $table->string('vm_session_type', 10);
            // Stores all user-configurable Guacamole connection parameters as JSON
            $table->json('parameters');
            $table->timestamps();

            // One preference set per user per protocol
            $table->unique(['user_id', 'vm_session_type']);
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
