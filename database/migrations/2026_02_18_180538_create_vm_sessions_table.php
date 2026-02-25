<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Consolidated migration for vm_sessions table.
     * Includes:
     * - proxmox_server_id FK (from 2026_02_19_000003)
     * - credentials, return_snapshot columns (from 2026_02_22_004010)
     * - protocol column (from 2026_02_22_102820, renamed from protocol_override)
     * - Removed template_id FK (vm_templates table dropped)
     * - Removed session_type column (from 2026_02_22_200000)
     * - Cascade delete on node_id (from 2026_02_24_160000)
     * - vm_id is NOT unique (allows reuse across sessions)
     */
    public function up(): void
    {
        Schema::create('vm_sessions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('proxmox_server_id')
                ->nullable()
                ->constrained('proxmox_servers')
                ->onDelete('restrict');
            $table->foreignId('node_id')
                ->constrained('proxmox_nodes')
                ->cascadeOnDelete();
            $table->unsignedInteger('vm_id')->nullable();
            $table->enum('status', ['pending', 'provisioning', 'active', 'expiring', 'expired', 'failed', 'terminated'])->default('pending');
            $table->enum('protocol', ['rdp', 'vnc', 'ssh'])->nullable();
            $table->ipAddress()->nullable();
            $table->text('credentials')->nullable(); // encrypted JSON
            $table->string('return_snapshot')->nullable();
            $table->unsignedBigInteger('guacamole_connection_id')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('proxmox_server_id');
            $table->index('status');
            $table->index('expires_at');
            $table->index('node_id');
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
