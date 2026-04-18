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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // vm, user, trainingPath, payment, system, security
            $table->string('action');
            $table->text('description');
            $table->foreignUlid('user_id')->nullable()->references('id')->on('users')->onDelete('set null');
            $table->string('ip_address')->nullable();
            $table->json('metadata')->nullable(); // Additional context (resource_id, changes, etc)
            $table->string('status')->default('completed'); // pending, completed, failed
            $table->timestamps();
            $table->index('type');
            $table->index('action');
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
