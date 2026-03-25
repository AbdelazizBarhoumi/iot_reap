<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vm_session_queue', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vm_template_id')->constrained()->cascadeOnDelete();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('session_id')->nullable()->constrained('vm_sessions')->nullOnDelete();
            $table->foreignId('lesson_id')->nullable()->constrained()->nullOnDelete();
            $table->unsignedInteger('position');
            $table->timestamp('queued_at');
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('estimated_available_at')->nullable();
            $table->timestamps();

            $table->unique(['vm_template_id', 'position']);
            $table->unique(['vm_template_id', 'user_id']);
            $table->index(['vm_template_id', 'queued_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vm_session_queue');
    }
};
