<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Consolidated migration for proxmox_nodes table.
     * Includes:
     * - proxmox_server_id FK (from 2026_02_19_000002)
     * - Composite unique constraints per server (from 2026_02_24_170000)
     */
    public function up(): void
    {
        Schema::create('proxmox_nodes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proxmox_server_id')
                ->nullable()
                ->constrained('proxmox_servers')
                ->onDelete('cascade');
            $table->string('name', 100);
            $table->string('hostname', 255);
            $table->string('api_url', 255);
            $table->enum('status', ['online', 'offline', 'maintenance'])->default('offline');
            $table->unsignedInteger('max_vms')->default(50);
            $table->timestamps();

            // Composite unique constraints per server (not global)
            $table->unique(['proxmox_server_id', 'name'], 'proxmox_nodes_server_name_unique');
            $table->unique(['proxmox_server_id', 'hostname'], 'proxmox_nodes_server_hostname_unique');
            $table->index('status');
            $table->index('proxmox_server_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proxmox_nodes');
    }
};
