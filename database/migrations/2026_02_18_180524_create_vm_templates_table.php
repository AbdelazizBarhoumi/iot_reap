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
            $table->string('name', 255)->unique();
            $table->enum('os_type', ['windows', 'linux'])->default('linux');
            $table->enum('protocol', ['rdp', 'vnc', 'ssh'])->default('vnc');
            $table->unsignedInteger('template_vmid')->unique();
            $table->unsignedSmallInteger('cpu_cores')->default(2);
            $table->unsignedInteger('ram_mb')->default(2048);
            $table->unsignedSmallInteger('disk_gb')->default(40);
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('os_type');
            $table->index('is_active');
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
