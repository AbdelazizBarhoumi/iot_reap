<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('robots', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('identifier')->unique();         // unique robot identifier (e.g. "robot-alpha")
            $table->text('description')->nullable();
            $table->string('status')->default('offline');    // online, offline, maintenance
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('robots');
    }
};
