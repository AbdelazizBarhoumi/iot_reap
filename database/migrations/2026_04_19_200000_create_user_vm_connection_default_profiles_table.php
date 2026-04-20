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
        Schema::create('user_vm_connection_default_profiles', function (Blueprint $table) {
            $table->id();
            $table->ulid('user_id');
            $table->unsignedInteger('vm_id');
            $table->enum('vm_session_protocol', ['rdp', 'vnc', 'ssh']);
            $table->string('preferred_profile_name', 100);
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();

            // Unique constraint: one preferred profile per user per VM per protocol
            $table->unique(['user_id', 'vm_id', 'vm_session_protocol'], 'unique_user_vm_protocol_profile');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_vm_connection_default_profiles');
    }
};
