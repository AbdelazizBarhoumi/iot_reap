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
        Schema::create('vm_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // 'Windows 11', 'Ubuntu 22.04', 'Kali Linux'
            $table->string('os_type'); // 'windows', 'linux', 'kali'
            $table->string('protocol'); // 'rdp', 'vnc', 'ssh'
            $table->integer('template_vmid'); // Proxmox template VM ID
            $table->integer('cpu_cores')->default(4);
            $table->integer('ram_mb')->default(4096);
            $table->integer('disk_gb')->default(50);
            $table->json('tags')->nullable(); // ['security-lab', 'kali']
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('os_type');
            $table->index('is_active');
            $table->index('protocol');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vm_templates');
    }
};
