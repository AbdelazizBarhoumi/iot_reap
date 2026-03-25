<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vm_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proxmox_server_id')->constrained()->cascadeOnDelete();
            $table->foreignId('node_id')->constrained('proxmox_nodes')->cascadeOnDelete();
            $table->unsignedInteger('vmid');
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('os_type', ['windows', 'linux', 'other'])->default('linux');
            $table->enum('protocol', ['rdp', 'vnc', 'ssh'])->default('rdp');
            $table->text('admin_description')->nullable();
            $table->boolean('maintenance_mode')->default(false);
            $table->text('maintenance_notes')->nullable();
            $table->timestamp('maintenance_until')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['proxmox_server_id', 'node_id', 'vmid']);
            $table->index(['is_active', 'maintenance_mode']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vm_templates');
    }
};
