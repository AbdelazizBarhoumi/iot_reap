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
        // remove template_id from vm_sessions if it exists
        Schema::table('vm_sessions', function (Blueprint $table) {
            if (Schema::hasColumn('vm_sessions', 'template_id')) {
                // drop the foreign key first
                $table->dropForeign(['template_id']);

                // SQLite may leave behind an index even after the column is gone,
                // causing errors during the rebuild. Attempt to drop it explicitly
                // (wrapped in try/catch to avoid failures on other platforms).
                try {
                    $table->dropIndex(['template_id']);
                } catch (\Exception $e) {
                    // ignore - index might not exist depending on driver
                }

                $table->dropColumn('template_id');
            }
        });

        // drop the vm_templates table completely
        Schema::dropIfExists('vm_templates');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::create('vm_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->enum('os_type', ['windows', 'linux', 'kali'])->default('linux');
            $table->enum('protocol', ['rdp', 'vnc', 'ssh']);
            $table->integer('template_vmid')->unique();
            $table->integer('cpu_cores')->default(1);
            $table->integer('ram_mb')->default(1024);
            $table->integer('disk_gb')->default(10);
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('vm_sessions', function (Blueprint $table) {
            if (! Schema::hasColumn('vm_sessions', 'template_id')) {
                $table->foreignId('template_id')
                      ->constrained('vm_templates')
                      ->cascadeOnDelete();
            }
        });
    }
};