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
        Schema::table('proxmox_servers', function (Blueprint $table) {
            // Encrypted values are base64-encoded and can be 400+ chars
            // Change from VARCHAR(255) to TEXT to accommodate encryption overhead
            $table->text('token_id')->change();
            $table->text('token_secret')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('proxmox_servers', function (Blueprint $table) {
            $table->string('token_id')->change();
            $table->string('token_secret')->change();
        });
    }
};
