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
        Schema::create('node_credentials_log', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('proxmox_server_id')->nullable();
            $table->foreign('proxmox_server_id')
                ->references('id')
                ->on('proxmox_servers')
                ->onDelete('set null');
            $table->enum('action', ['registered', 'updated', 'tested', 'deleted'])->default('registered');
            $table->ipAddress()->nullable();
            $table->foreignUlid('changed_by')
                ->nullable()
                ->constrained('users')
                ->onDelete('set null');
            $table->json('details')->nullable();
            $table->timestamps();

            $table->index('proxmox_server_id');
            $table->index('changed_by');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('node_credentials_log');
    }
};
