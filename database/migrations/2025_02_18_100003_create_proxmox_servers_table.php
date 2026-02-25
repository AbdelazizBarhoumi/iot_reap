<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Consolidated migration for proxmox_servers table.
     * Includes all columns from the original migration plus enhancements:
     * - realm, verify_ssl, created_by
     * - TEXT columns for encrypted tokens (encryption overhead)
     * - Resource control columns (max_vms_per_node, overcommit ratios)
     */
    public function up(): void
    {
        Schema::create('proxmox_servers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('description')->nullable();
            // Use TEXT for encrypted values (can exceed 255 chars due to encryption overhead)
            $table->text('host');
            $table->text('port');
            $table->string('realm')->default('pam');
            $table->text('token_id');
            $table->text('token_secret');
            $table->boolean('verify_ssl')->default(true);
            // Resource control limits
            $table->unsignedInteger('max_vms_per_node')->default(5);
            $table->unsignedInteger('max_concurrent_sessions')->default(20);
            $table->decimal('cpu_overcommit_ratio', 8, 2)->default(2.00);
            $table->decimal('memory_overcommit_ratio', 8, 2)->default(1.50);
            $table->boolean('is_active')->default(true);
            $table->foreignUlid('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();

            $table->index('is_active');
            $table->index('created_by');
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
