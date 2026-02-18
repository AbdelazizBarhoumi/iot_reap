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
            $table->ulid('id')->primary(); // ULID primary key
            $table->foreignUlid('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('template_id')->constrained('vm_templates')->onDelete('restrict');
            $table->foreignId('node_id')->constrained('proxmox_nodes')->onDelete('restrict');
            $table->integer('vm_id')->nullable(); // Proxmox VMID, populated after clone
            $table->string('status')->default('pending'); // 'pending', 'active', 'expired', 'failed'
            $table->string('ip_address')->nullable();
            $table->string('session_type')->default('ephemeral'); // 'ephemeral', 'persistent'
            $table->timestamp('expires_at');
            $table->string('guacamole_connection_id')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('status');
            $table->index('expires_at');
            $table->index('node_id');
            $table->index('created_at');
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
