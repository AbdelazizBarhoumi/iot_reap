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
        Schema::create('system_alerts', function (Blueprint $table) {
            $table->id();
            $table->string('severity')->default('info'); // info, warning, error, critical
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('source')->nullable(); // proxmox, system, vm, network
            $table->json('metadata')->nullable(); // Additional context
            $table->boolean('acknowledged')->default(false);
            $table->timestamp('acknowledged_at')->nullable();
            $table->foreignUlid('acknowledged_by')->nullable()->references('id')->on('users')->onDelete('set null');
            $table->boolean('resolved')->default(false);
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
            $table->index('severity');
            $table->index('source');
            $table->index('acknowledged');
            $table->index('resolved');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_alerts');
    }
};
