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
        Schema::create('gateway_nodes', function (Blueprint $table) {
            $table->id();
            $table->string('name');                    // "gateway-1", "gateway-2"
            $table->string('ip');                      // "192.168.50.6"
            $table->unsignedInteger('port')->default(8000);
            $table->boolean('online')->default(false);
            $table->boolean('is_verified')->default(false);
            $table->string('proxmox_vmid')->nullable();
            $table->string('proxmox_node')->nullable();
            $table->string('proxmox_host')->nullable();
            $table->text('description')->nullable();
            $table->string('proxmox_camera_api_url')->nullable();
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();

            $table->unique(['ip', 'port']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gateway_nodes');
    }
};
