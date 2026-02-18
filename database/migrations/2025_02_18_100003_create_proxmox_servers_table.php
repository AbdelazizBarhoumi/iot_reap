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
        Schema::create('proxmox_servers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // 'Main Cluster', 'Production', etc.
            $table->string('description')->nullable();
            $table->string('host'); // Proxmox API host
            $table->integer('port')->default(8006);
            $table->string('token_id'); // Encrypted
            $table->string('token_secret'); // Encrypted (256+ char due to encryption)
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('is_active');
            $table->index('host');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proxmox_servers');
    }
};
