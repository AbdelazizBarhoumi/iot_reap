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
            $table->string('name', 100)->unique();
            $table->string('hostname', 255)->unique();
            $table->string('api_url', 255);
            $table->enum('status', ['online', 'offline', 'maintenance'])->default('offline');
            $table->unsignedInteger('max_vms')->default(50);
            $table->timestamps();

            $table->index('status');
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
