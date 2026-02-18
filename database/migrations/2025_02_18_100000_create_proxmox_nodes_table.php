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
        Schema::create('proxmox_nodes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // e.g., 'pve-1', 'pve-2'
            $table->string('hostname');
            $table->string('api_url');
            $table->string('status')->default('offline'); // 'online', 'offline', 'maintenance'
            $table->integer('max_vms')->default(50);
            $table->timestamps();

            $table->index('status');
            $table->index('hostname');
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
