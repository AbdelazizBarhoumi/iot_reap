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
        Schema::create('vm_sessions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('vm_templates')->cascadeOnDelete();
            $table->foreignId('node_id')->constrained('proxmox_nodes')->restrictOnDelete();
            $table->unsignedInteger('vm_id')->unique()->nullable();
            $table->enum('status', ['pending', 'provisioning', 'active', 'expiring', 'expired', 'failed', 'terminated'])->default('pending');
            $table->enum('session_type', ['ephemeral', 'persistent'])->default('ephemeral');
            $table->ipAddress()->nullable();
            $table->unsignedBigInteger('guacamole_connection_id')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('expires_at');
            $table->index('node_id');
            $table->index('template_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vm_sessions');
    }
};
